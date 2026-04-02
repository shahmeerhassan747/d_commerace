from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any

from app.database import get_db
from app.database.schema import Wishlist
from app.api.models.delete_whishlist_models import WhishlistDeleteResponse

router = APIRouter()

@router.delete("/whishlist/{whishlist_id}", response_model=WhishlistDeleteResponse)
def delete_whishlist(
    whishlist_id: int,
    db: Session = Depends(get_db)
) -> Any:
    """
    Delete an existing wishlist entry.
    """
    db_whishlist = db.query(Wishlist).filter(Wishlist.id == whishlist_id).first()
    if not db_whishlist:
        raise HTTPException(status_code=404, detail="Wishlist entry not found")

    try:
        db.delete(db_whishlist)
        db.commit()
        return WhishlistDeleteResponse(success=True, message=f"Wishlist entry {whishlist_id} deleted successfully")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
