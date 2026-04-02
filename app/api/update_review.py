from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Any

from app.database import get_db
from app.database.schema import Review
from app.api.models.update_review_models import ReviewUpdate, ReviewResponse

router = APIRouter()

@router.put("/reviews/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: int,
    review_data: ReviewUpdate,
    db: Session = Depends(get_db)
) -> Any:
    """
    Update an existing review.
    """
    db_review = db.query(Review).filter(Review.id == review_id).first()
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")

    # Update only the fields provided in the request
    update_data = review_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_review, key, value)

    try:
        db.commit()
        db.refresh(db_review)
        return db_review
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Database integrity error.")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
