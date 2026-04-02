"""SQLAlchemy models for the commerce database."""

from sqlalchemy import Column, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(500))
    user_name = Column(String(500))
    password = Column(String(500))
    image = Column(String)  # Base-64 encoded image string

    # Relationships
    reviews = relationship("Review", back_populates="user")
    carts = relationship("Cart", back_populates="user")
    wishlists = relationship("Wishlist", back_populates="user")


class Product(Base):
    __tablename__ = "product"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(500))
    description = Column(String(500))
    price = Column(Float)
    quantity = Column(Integer)
    discount = Column(Integer)
    sold = Column(Float)
    custom = Column(String(500))
    key_features = Column(String(500))
    category = Column(String(500))
    image = Column(String)  # Base-64 encoded image string


    # Relationships
    reviews = relationship("Review", back_populates="product")
    carts = relationship("Cart", back_populates="product")
    wishlists = relationship("Wishlist", back_populates="product")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    rating = Column(Float)
    review = Column(String(500))
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("product.id"))

    # Relationships
    user = relationship("User", back_populates="reviews")
    product = relationship("Product", back_populates="reviews")


class Cart(Base):
    __tablename__ = "cart"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("product.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    total_amount = Column(Float)

    # Relationships
    user = relationship("User", back_populates="carts")
    product = relationship("Product", back_populates="carts")


class Wishlist(Base):
    __tablename__ = "whishlist"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("product.id"))
    user_id = Column(Integer, ForeignKey("users.id"))

    # Relationships
    user = relationship("User", back_populates="wishlists")
    product = relationship("Product", back_populates="wishlists")
