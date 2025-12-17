import firebase_admin
from firebase_admin import auth, credentials
from fastapi import Header, HTTPException, Depends
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize Firebase Admin
# Expecting FIREBASE_CREDENTIALS_PATH in .env or default location
cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "backend/firebase-service-account.json")

if not len(firebase_admin._apps):
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    else:
        print(f"Warning: Firebase credentials not found at {cred_path}. Auth will fail.")

async def verify_firebase_token(authorization: str = Header(...)):
    """
    Verifies the Firebase Bearer Token and returns the decoded token.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authentication header format")
    
    token = authorization.split("Bearer ")[1]
    
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid authentication token: {str(e)}")

def get_current_user_role(token: dict = Depends(verify_firebase_token)):
    """
    Extracts role from the token (checking custom claims or DB).
    For now, we rely on the client sending role during sign-up which syncs to DB,
    or we can attach custom claims. 
    Simplest approach: look up user in DB using token['uid'].
    """
    return token
