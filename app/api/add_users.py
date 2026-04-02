from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Any

from app.database import get_db
from app.database.schema import User
from app.api.models.add_users_models import UserCreate, UserResponse
from app.api.utils import hash_password

router = APIRouter()

@router.post("/users", response_model=UserResponse)
def create_user(
    *,
    db: Session = Depends(get_db),
    user_data: UserCreate
) -> Any:
    """
    Create a new user.
    """
    try:
        # Create new user instance
        db_user = User(
    name=user_data.name,
    user_name=user_data.user_name,
    password=hash_password(user_data.password),  # ← changed
    image=user_data.image
)

        # Add to database
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        return db_user

    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Database integrity error. User name might already exist."
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while creating the user: {str(e)}"
        )
