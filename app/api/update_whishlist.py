from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Any

from app.database import get_db
from app.database.schema import Wishlist
from app.api.models.update_whishlist_models import WhishlistUpdate, WhishlistUpdateResponse

router = APIRouter()

@router.put("/whishlist/{whishlist_id}", response_model=WhishlistUpdateResponse)
def update_whishlist(
    whishlist_id: int,
    whishlist_data: WhishlistUpdate,
    db: Session = Depends(get_db)
) -> Any:
    """
    Update an existing whishlist entry.
    """
    db_whishlist = db.query(Wishlist).filter(Wishlist.id == whishlist_id).first()
    if not db_whishlist:
        raise HTTPException(status_code=404, detail="Whishlist entry not found")

    # Update only the fields provided in the request
    update_data = whishlist_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_whishlist, key, value)

    try:
        db.commit()
        db.refresh(db_whishlist)
        return db_whishlist
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Database integrity error.")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
