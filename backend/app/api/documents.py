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
    
    uploaded_docs = []
    texts_for_rag = []
    metadatas_for_rag = []
    
    for file in files:
        # Save file
        file_path = os.path.join(settings.UPLOAD_DIR, f"{startup.id}_{file.filename}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Process document
        try:
            processed = document_processor.process_file(file_path)
            
            # Create document record
            doc = Document(
                startup_id=startup.id,
                filename=file.filename,
                file_path=file_path,
                file_type=processed["metadata"]["file_type"],
                file_size=os.path.getsize(file_path),
                content_text=processed["text"],
                metadata=processed["metadata"]
            )
            db.add(doc)
            
            # Prepare for RAG
            texts_for_rag.append(processed["text"])
            metadatas_for_rag.append({
                "document_id": doc.id,
                "filename": file.filename,
                "file_type": doc.file_type
            })
            
            uploaded_docs.append({
                "filename": file.filename,
                "size": doc.file_size,
                "type": doc.file_type
            })
            
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to process {file.filename}: {str(e)}")
    
    db.commit()
    
    # Add to RAG vector store
    try:
        await rag_service.add_documents(
            startup.id,
            texts_for_rag,
            metadatas_for_rag
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to index documents: {str(e)}")
    
    return {
        "startup_id": startup.id,
        "startup_name": startup.name,
        "uploaded_documents": uploaded_docs,
        "total_documents": len(uploaded_docs)
    }


@router.get("/startup/{startup_id}")
async def get_startup_documents(
    startup_id: int,
    db: Session = Depends(get_db)
):
    """Get all documents for a startup"""
    documents = db.query(Document).filter(Document.startup_id == startup_id).all()
    
    return [
        {
            "id": doc.id,
            "filename": doc.filename,
            "file_type": doc.file_type,
            "file_size": doc.file_size,
            "uploaded_at": doc.uploaded_at.isoformat(),
            "metadata": doc.metadata
        }
        for doc in documents
    ]


@router.delete("/{document_id}")
async def delete_document(
    document_id: int,
    db: Session = Depends(get_db)
):
    """Delete a document"""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Delete file
    if os.path.exists(doc.file_path):
        os.remove(doc.file_path)
    
    db.delete(doc)
    db.commit()
    
    return {"message": "Document deleted successfully"}