from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Any

from app.database import get_db
from app.database.schema import Cart
from app.api.models.update_cart_models import CartUpdate, CartUpdateResponse

router = APIRouter()

@router.put("/cart/{cart_id}", response_model=CartUpdateResponse)
def update_cart(
    cart_id: int,
    cart_data: CartUpdate,
    db: Session = Depends(get_db)
) -> Any:
    """
    Update an existing cart entry.
    """
    db_cart = db.query(Cart).filter(Cart.id == cart_id).first()
    if not db_cart:
        raise HTTPException(status_code=404, detail="Cart entry not found")

    # Update only the fields provided in the request
    update_data = cart_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_cart, key, value)

    try:
        db.commit()
        db.refresh(db_cart)
        return db_cart
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Database integrity error.")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
