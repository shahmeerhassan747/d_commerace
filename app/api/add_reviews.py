from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Any

from app.database import get_db
from app.database.schema import Review
from app.api.models.add_reviews_models import ReviewCreate, ReviewResponse

router = APIRouter()

@router.post("/reviews", response_model=ReviewResponse)
def create_review(
    *,
    db: Session = Depends(get_db),
    review_data: ReviewCreate
) -> Any:
    """
    Create a new review.
    """
    try:
        # Create new review instance
        db_review = Review(
            rating=review_data.rating,
            review=review_data.review,
            user_id=review_data.user_id,
            product_id=review_data.product_id
        )

        # Add to database
        db.add(db_review)
        db.commit()
        db.refresh(db_review)

        return db_review

    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Database integrity error. User or Product might not exist."
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while creating the review: {str(e)}"
        )
