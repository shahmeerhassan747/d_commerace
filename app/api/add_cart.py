from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Any

from app.database import get_db
from app.database.schema import Cart
from app.api.models.add_cart_models import CartCreate, CartResponse

router = APIRouter()

@router.post("/cart", response_model=CartResponse)
def add_to_cart(
    *,
    db: Session = Depends(get_db),
    cart_data: CartCreate
) -> Any:
    """
    Add a product to the cart.
    """
    try:
        # Create new cart instance
        db_cart = Cart(
            product_id=cart_data.product_id,
            user_id=cart_data.user_id,
            total_amount=cart_data.total_amount
        )

        # Add to database
        db.add(db_cart)
        db.commit()
        db.refresh(db_cart)

        return db_cart

    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Database integrity error. User might not exist."
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while adding to cart: {str(e)}"
        )
