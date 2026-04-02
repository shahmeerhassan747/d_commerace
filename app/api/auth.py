from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.api.utils import verify_password, create_token
from app.database import get_db
from app.database.schema import User
from pydantic import BaseModel

router = APIRouter()

class LoginSchema(BaseModel):
    username: str
    password: str

@router.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    
    # 1. Find user
    user = db.query(User).filter(User.user_name == data.username).first()
    
    # 2. Check if user exists
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    # 3. Verify password
    if not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    # 4. Return token
    token = create_token({"user_id": user.id})
    return {
        "token": token,
        "user_id": user.id,
        "username": user.user_name
    }
