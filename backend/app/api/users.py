from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from ..database import get_db
from ..models import models

router = APIRouter()

class UserCreate(BaseModel):
    email: str
    firebase_uid: str
    role: str

class UserResponse(BaseModel):
    id: int
    email: str
    firebase_uid: str
    role: str
    
    class Config:
        orm_mode = True

@router.post("/sync", response_model=UserResponse)
def sync_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Create or update a user based on firebase_uid.
    This is called after a successful Firebase login/signup.
    """
    user = db.query(models.User).filter(models.User.firebase_uid == user_data.firebase_uid).first()
    
    if user:
        # Update existing user if needed (e.g. role changed? unlikely but good to have)
        user.email = user_data.email
        user.role = user_data.role
    else:
        # Create new user
        user = models.User(
            email=user_data.email,
            firebase_uid=user_data.firebase_uid,
            role=user_data.role
        )
        db.add(user)
    
    db.commit()
    db.refresh(user)
    return user

@router.get("/me/{firebase_uid}", response_model=UserResponse)
def get_user(firebase_uid: str, db: Session = Depends(get_db)):
    """
    Get user details by firebase_uid
    """
    user = db.query(models.User).filter(models.User.firebase_uid == firebase_uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
