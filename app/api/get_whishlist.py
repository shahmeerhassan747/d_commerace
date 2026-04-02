from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Any

from app.database import get_db
from app.database.schema import Wishlist, User, Product
from app.api.models.get_whishlist_models import WhishlistResponse

router = APIRouter()

@router.get("/whishlist/{user_id}", response_model=List[WhishlistResponse])
def get_whishlist_by_user(
    user_id: int,
    db: Session = Depends(get_db)
) -> Any:
    """
    Get all wishlist items for a specific user with associated product and user names.
    """
    results = (
        db.query(
            Wishlist.id,
            Product.name.label("product_name"),
            Product.price.label("product_price"),
            Product.discount.label("product_discount"),
            User.name.label("user_name")
        )
        .outerjoin(Product, Wishlist.product_id == Product.id)
        .outerjoin(User, Wishlist.user_id == User.id)
        .filter(Wishlist.user_id == user_id)
        .all()
    )

    if not results:
        # Check if the user exists
        user_exists = db.query(User.id).filter(User.id == user_id).first()
        if not user_exists:
            raise HTTPException(status_code=404, detail="User not found")
        return [] # Return empty list if user exists but wishlist is empty

    whishlist_items = []
    for row in results:
        whishlist_items.append({
            "id": row.id,
            "product_name": row.product_name,
            "product_price": row.product_price,
            "product_discount": row.product_discount,
            "user_name": row.user_name
        })

    return whishlist_items
