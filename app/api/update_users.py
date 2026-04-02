from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Any

from app.database import get_db
from app.database.schema import User
from app.api.models.update_users_models import UserUpdate, UserUpdateResponse

router = APIRouter()

@router.put("/users/{user_id}", response_model=UserUpdateResponse)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db)
) -> Any:
    """
    Update an existing user.
    """
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update only the fields provided in the request
    update_data = user_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)

    try:
        db.commit()
        db.refresh(db_user)
        return db_user
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Database integrity error. User name might already exist.")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
