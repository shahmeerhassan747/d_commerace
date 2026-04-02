from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Any

from app.database import get_db
from app.database.schema import Wishlist
from app.api.models.add_whishlist_models import WhishlistCreate, WhishlistResponse

router = APIRouter()

@router.post("/whishlist", response_model=WhishlistResponse)
def add_to_whishlist(
    *,
    db: Session = Depends(get_db),
    whishlist_data: WhishlistCreate
) -> Any:
    """
    Add a product to the whishlist.
    """
    try:
        # Create new wishlist instance
        db_whishlist = Wishlist(
            product_id=whishlist_data.product_id,
            user_id=whishlist_data.user_id
        )

        # Add to database
        db.add(db_whishlist)
        db.commit()
        db.refresh(db_whishlist)

        return db_whishlist

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
            detail=f"An error occurred while adding to whishlist: {str(e)}"
        )
