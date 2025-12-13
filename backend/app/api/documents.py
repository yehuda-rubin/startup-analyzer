from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from typing import List
import os
import shutil

from ..database import get_db
from ..models.models import Startup, Document
from ..services.document_processor import document_processor
from ..services.rag_service import rag_service
from ..config import settings

router = APIRouter()


@router.post("/upload")
async def upload_documents(
    startup_name: str = Form(...),
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    """Upload documents for a startup"""
    
    print(f"\n{'='*60}")
    print(f"📤 UPLOAD REQUEST: {startup_name}")
    print(f"{'='*60}")
    
    # Create or get startup
    startup = db.query(Startup).filter(Startup.name == startup_name).first()
    if not startup:
        startup = Startup(
            name=startup_name,
            description=f"Startup: {startup_name}"
        )
        db.add(startup)
        db.commit()
        db.refresh(startup)
    
    print(f"✅ Startup ID: {startup.id}")
    
    uploaded_docs = []
    texts_for_rag = []
    metadatas_for_rag = []
    
    for file in files:
        print(f"\n📄 Processing: {file.filename}")
        
        # Save file
        file_path = os.path.join(settings.UPLOAD_DIR, f"{startup.id}_{file.filename}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        print(f"💾 Saved to: {file_path}")
        
        # Process document
        try:
            processed = document_processor.process_file(file_path)
            
            text_length = len(processed["text"])
            print(f"📝 Extracted text length: {text_length} chars")
            print(f"📝 First 200 chars: {processed['text'][:200]}")
            
            if text_length < 50:
                print(f"⚠️ WARNING: Text too short! Might be extraction failure.")
            
            # Create document record
            doc = Document(
                startup_id=startup.id,
                filename=file.filename,
                file_path=file_path,
                file_type=processed["metadata"]["file_type"],
                file_size=os.path.getsize(file_path),
                content_text=processed["text"],
                meta_data=processed["metadata"]
            )
            db.add(doc)
            
            # Prepare for RAG
            texts_for_rag.append(processed["text"])
            metadatas_for_rag.append({
                "document_id": doc.id,
                "filename": file.filename,
                "file_type": doc.file_type,
                "startup_name": startup_name
            })
            
            uploaded_docs.append({
                "filename": file.filename,
                "size": doc.file_size,
                "type": doc.file_type,
                "text_length": text_length
            })
            
        except Exception as e:
            print(f"❌ Processing failed: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Failed to process {file.filename}: {str(e)}")
    
    db.commit()
    
    # Add to RAG vector store
    print(f"\n🔍 Adding to FAISS vector store...")
    print(f"   Texts count: {len(texts_for_rag)}")
    print(f"   Total chars: {sum(len(t) for t in texts_for_rag)}")
    
    try:
        vector_ids = await rag_service.add_documents(
            startup.id,
            texts_for_rag,
            metadatas_for_rag
        )
        print(f"✅ Added {len(vector_ids)} chunks to vector store")
    except Exception as e:
        print(f"❌ FAISS indexing failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to index documents: {str(e)}")
    
    print(f"\n{'='*60}")
    print(f"✅ UPLOAD COMPLETE")
    print(f"{'='*60}\n")
    
    return {
        "startup_id": startup.id,
        "startup_name": startup.name,
        "uploaded_documents": uploaded_docs,
        "total_documents": len(uploaded_docs),
        "vector_chunks": len(vector_ids)
    }