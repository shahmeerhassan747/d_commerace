from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any

from app.database import get_db
from app.database.schema import User
from app.api.models.delete_users_models import UserDeleteResponse

router = APIRouter()

@router.delete("/users/{user_id}", response_model=UserDeleteResponse)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db)
) -> Any:
    """
    Delete an existing user.
    """
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        db.delete(db_user)
        db.commit()
        return UserDeleteResponse(success=True, message=f"User {user_id} deleted successfully")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
