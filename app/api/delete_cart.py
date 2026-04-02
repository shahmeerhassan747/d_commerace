from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any

from app.database import get_db
from app.database.schema import Cart
from app.api.models.delete_cart_models import CartDeleteResponse

router = APIRouter()

@router.delete("/cart/{cart_id}", response_model=CartDeleteResponse)
def delete_cart(
    cart_id: int,
    db: Session = Depends(get_db)
) -> Any:
    """
    Delete an existing cart entry.
    """
    db_cart = db.query(Cart).filter(Cart.id == cart_id).first()
    if not db_cart:
        raise HTTPException(status_code=404, detail="Cart entry not found")

    try:
        db.delete(db_cart)
        db.commit()
        return CartDeleteResponse(success=True, message=f"Cart entry {cart_id} deleted successfully")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
