from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.models import Startup, Document, Analysis, Score, MarketAnalysis
from ..services.rag_service import rag_service
import os
import shutil

router = APIRouter()


@router.delete("/{startup_id}")
async def delete_startup(startup_id: int, db: Session = Depends(get_db)):
    """Delete a startup and all its related data"""
    try:
        # Get the startup
        startup = db.query(Startup).filter(Startup.id == startup_id).first()
        if not startup:
            raise HTTPException(status_code=404, detail="Startup not found")
        
        # Delete all documents from filesystem
        documents = db.query(Document).filter(Document.startup_id == startup_id).all()
        for doc in documents:
            if os.path.exists(doc.file_path):
                try:
                    os.remove(doc.file_path)
                except Exception as e:
                    print(f"Failed to delete file {doc.file_path}: {e}")
        
        # Delete vector store data
        try:
            await rag_service.delete_startup_data(startup_id)
        except Exception as e:
            print(f"Failed to delete vector data: {e}")
        
        # Delete from database (cascade will handle related records)
        db.delete(startup)
        db.commit()
        
        return {
            "message": f"Startup '{startup.name}' deleted successfully",
            "deleted_id": startup_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete startup: {str(e)}")