from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any

from app.database import get_db
from app.database.schema import Product
from app.api.models.delete_product_models import DeleteResponse

router = APIRouter()

@router.delete("/products/{product_id}", response_model=DeleteResponse)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db)
) -> Any:
    """
    Delete an existing product.
    """
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    try:
        db.delete(db_product)
        db.commit()
        return DeleteResponse(success=True, message=f"Product {product_id} deleted successfully")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
