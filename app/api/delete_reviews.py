from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any

from app.database import get_db
from app.database.schema import Review
from app.api.models.delete_review_models import ReviewDeleteResponse

router = APIRouter()

@router.delete("/reviews/{review_id}", response_model=ReviewDeleteResponse)
def delete_review(
    review_id: int,
    db: Session = Depends(get_db)
) -> Any:
    """
    Delete an existing review.
    """
    db_review = db.query(Review).filter(Review.id == review_id).first()
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")

    try:
        db.delete(db_review)
        db.commit()
        return ReviewDeleteResponse(success=True, message=f"Review {review_id} deleted successfully")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
