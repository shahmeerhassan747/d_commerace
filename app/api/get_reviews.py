from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Any

from app.database import get_db
from app.database.schema import Review, User, Product
from app.api.models.get_reviews_models import ReviewResponse

router = APIRouter()

@router.get("/reviews/", response_model=List[ReviewResponse])
def get_reviews(
    db: Session = Depends(get_db)
) -> Any:
    """
    Get all reviews with associated user and product names.
    """
    results = (
        db.query(
            Review.id,
            Review.rating,
            Review.review,
            Review.user_id,
            Review.product_id,
            User.name.label("user_name"),
            Product.name.label("product_name")
        )
        .outerjoin(User, Review.user_id == User.id)
        .outerjoin(Product, Review.product_id == Product.id)
        .all()
    )

    reviews = []
    for row in results:
        reviews.append({
            "id": row.id,
            "rating": row.rating,
            "review": row.review,
            "user_id": row.user_id,
            "product_id": row.product_id,
            "user_name": row.user_name,
            "product_name": row.product_name
        })

    return reviews


@router.get("/reviews/{review_id}", response_model=ReviewResponse)
def get_specific_review(
    review_id: int,
    db: Session = Depends(get_db)
) -> Any:
    """
    Get a specific review with associated user and product names.
    """
    result = (
        db.query(
            Review.id,
            Review.rating,
            Review.review,
            Review.user_id,
            Review.product_id,
            User.name.label("user_name"),
            Product.name.label("product_name")
        )
        .outerjoin(User, Review.user_id == User.id)
        .outerjoin(Product, Review.product_id == Product.id)
        .filter(Review.id == review_id)
        .first()
    )

    if not result:
        # Check if the review itself exists
        review_exists = db.query(Review.id).filter(Review.id == review_id).first()
        if not review_exists:
            raise HTTPException(status_code=404, detail="Review not found")

    return {
        "id": result.id,
        "rating": result.rating,
        "review": result.review,
        "user_id": result.user_id,
        "product_id": result.product_id,
        "user_name": result.user_name,
        "product_name": result.product_name
    }
