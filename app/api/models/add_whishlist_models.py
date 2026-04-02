from pydantic import BaseModel

class WhishlistBase(BaseModel):
    product_id: int
    user_id: int

class WhishlistCreate(WhishlistBase):
    pass

class WhishlistResponse(WhishlistBase):
    id: int

    class Config:
        from_attributes = True
