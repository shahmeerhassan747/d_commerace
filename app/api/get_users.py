from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Any

from app.database import get_db
from app.database.schema import User, Cart, Wishlist, Review
from app.api.models.get_users_models import UserResponse

router = APIRouter()

@router.get("/users/", response_model=List[UserResponse])
def get_users(
    db: Session = Depends(get_db)
) -> Any:
    """
    Get all users with aggregate counts for their related entities.
    """
    results = (
        db.query(
            User.id,
            User.name,
            User.user_name,
            User.image,
            func.count(func.distinct(Cart.id)).label("cart_items"),
            func.count(func.distinct(Wishlist.id)).label("wishlist_items"),
            func.count(func.distinct(Review.id)).label("total_reviews")
        )
        .outerjoin(Cart, Cart.user_id == User.id)
        .outerjoin(Wishlist, Wishlist.user_id == User.id)
        .outerjoin(Review, Review.user_id == User.id)
        .group_by(User.id, User.name, User.user_name, User.image)
        .all()
    )

    users = []
    for row in results:
        users.append({
            "id": row.id,
            "name": row.name,
            "user_name": row.user_name,
            "image": row.image,
            "cart_items": row.cart_items,
            "wishlist_items": row.wishlist_items,
            "total_reviews": row.total_reviews
        })

    return users


@router.get("/users/{user_id}", response_model=UserResponse)
def get_specific_user(
    user_id: int,
    db: Session = Depends(get_db)
) -> Any:
    """
    Get a specific user with aggregate counts for their related entities.
    """
    result = (
        db.query(
            User.id,
            User.name,
            User.user_name,
            User.image,
            func.count(func.distinct(Cart.id)).label("cart_items"),
            func.count(func.distinct(Wishlist.id)).label("wishlist_items"),
            func.count(func.distinct(Review.id)).label("total_reviews")
        )
        .outerjoin(Cart, Cart.user_id == User.id)
        .outerjoin(Wishlist, Wishlist.user_id == User.id)
        .outerjoin(Review, Review.user_id == User.id)
        .filter(User.id == user_id)
        .group_by(User.id, User.name, User.user_name, User.image)
        .first()
    )

    if not result:
        # Check if the user itself exists without aggregated joins
        user_exists = db.query(User.id).filter(User.id == user_id).first()
        if not user_exists:
            raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": result.id,
        "name": result.name,
        "user_name": result.user_name,
        "image": result.image,
        "cart_items": result.cart_items,
        "wishlist_items": result.wishlist_items,
        "total_reviews": result.total_reviews
    }
