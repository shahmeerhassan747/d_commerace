from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Any

from app.database import get_db
from app.database.schema import Cart, User, Product
from app.api.models.get_cart_models import CartResponse

router = APIRouter()

@router.get("/cart/{user_id}", response_model=List[CartResponse])
def get_cart_by_user(
    user_id: int,
    db: Session = Depends(get_db)
) -> Any:
    """
    Get all cart items for a specific user with associated product and user names.
    """
    results = (
        db.query(
            Cart.id,
            Cart.total_amount,
            Product.name.label("product_name"),
            Product.price.label("product_price"),
            Product.discount.label("product_discount"),
            User.name.label("user_name")
        )
        .outerjoin(Product, Cart.product_id == Product.id)
        .outerjoin(User, Cart.user_id == User.id)
        .filter(Cart.user_id == user_id)
        .all()
    )

    if not results:
        # Check if the user exists
        user_exists = db.query(User.id).filter(User.id == user_id).first()
        if not user_exists:
            raise HTTPException(status_code=404, detail="User not found")
        return [] # Return empty list if user exists but cart is empty

    cart_items = []
    for row in results:
        cart_items.append({
            "id": row.id,
            "total_amount": row.total_amount,
            "product_name": row.product_name,
            "product_price": row.product_price,
            "product_discount": row.product_discount,
            "user_name": row.user_name
        })

    return cart_items
