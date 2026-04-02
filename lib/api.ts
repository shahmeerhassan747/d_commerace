const API_URL = 'http://localhost:8000';

export async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(typeof window !== 'undefined' && localStorage.getItem('token') ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {}),
          ...options.headers,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

export interface Product {
  id: number;
  name: string;
  price: number;
  rating?: number;
  review_count: number;
  image?: string;
}

export interface SpecificProduct {
  id: number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  discount?: number;
  sold?: number;
  custom?: string;
  key_features?: string;
  rating?: number;
  review_count: number;
  image?: string;
}

export interface WishlistItem {
  id: number;
  product_name: string;
  product_price: number;
  product_discount?: number;
  user_name: string;
}

export interface CartItem {
  id: number;
  total_amount: number;
  product_name: string;
  product_price: number;
  product_discount?: number;
  user_name: string;
}

export interface WishlistCreate {
  product_id: number;
  user_id: number;
}

export interface CartCreate {
  product_id: number;
  user_id: number;
  total_amount: number;
}

export interface ProductCreate {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  discount?: number;
  sold?: number;
  custom?: string;
  key_features?: string;
  image?: string;
}

export interface ProductUpdate {
  name?: string;
  description?: string;
  price?: number;
  quantity?: number;
  discount?: number;
  sold?: number;
  custom?: string;
  key_features?: string;
  image?: string;
}

export interface ReviewCreate {
  rating: number;
  review?: string;
  user_id: number;
  product_id: number;
}

export interface ReviewResponse {
  id: number;
  rating: number;
  review?: string;
  user_id?: number;
  product_id?: number;
  user_name?: string;
  product_name?: string;
}

export interface UserCreate {
  name: string;
  user_name: string;
  password: string;
  image?: string;
}

export interface UserResponse {
  id: number;
  name: string;
  user_name: string;
  image?: string;
}

export interface LoginRequest {
  username: string; // The backend uses Form data or JSON for this depending on implementation. Assuming JSON based on the curl provided: {"username": "shahmeer", "password": "pass"}
  password: string;
}

export interface LoginResponse {
  token: string;
  user_id: number;
  username: string;
}

export interface UserListItem {
  id: number;
  name: string;
  user_name: string;
  cart_items: number;
  wishlist_items: number;
  total_reviews: number;
  image?: string;
}

export interface PaginatedProducts {
  total: number;
  page: number;
  limit: number;
  products: Product[];
}

export const api = {
  getProducts: async (page = 1, limit = 10): Promise<PaginatedProducts> => {
    const response = await fetchWithRetry(`/products/list?page=${page}&limit=${limit}`);
    return response.data;
  },
  
  getProduct: async (id: number | string): Promise<SpecificProduct> => {
    const response = await fetchWithRetry(`/products/${id}`);
    const rows = response.data;
    
    if (!rows || rows.length === 0) {
      throw new Error("Product not found");
    }

    // Backend returns multiple rows, one for each rating present
    // We need to aggregate them to get the total review count and weighted average rating
    const data = rows[0];
    let totalReviews = 0;
    let totalWeightedRating = 0;

    rows.forEach((row: any) => {
      if (row.rating != null) {
        totalReviews += row.review_count;
        totalWeightedRating += (row.rating * row.review_count);
      }
    });

    const averageRating = totalReviews > 0 ? Number((totalWeightedRating / totalReviews).toFixed(1)) : 0;

    return {
      ...data,
      id: Number(id),
      rating: averageRating,
      review_count: totalReviews
    };
  },
  
  searchProducts: async (params: { name?: string; category?: string; min_price?: number; max_price?: number }) => {
    const searchParams = new URLSearchParams();
    if (params.name) searchParams.append('name', params.name);
    if (params.category) searchParams.append('category', params.category);
    if (params.min_price) searchParams.append('min_price', params.min_price.toString());
    if (params.max_price) searchParams.append('max_price', params.max_price.toString());
    const response = await fetchWithRetry(`/products/search?${searchParams.toString()}`);
    return response.data;
  },
  
  getWishlist: async (userId: number | string): Promise<WishlistItem[]> => {
    // Note: Backend has a typo 'whishlist'
    const response = await fetchWithRetry(`/whishlist/${userId}`);
    return response.data;
  },

  addToWishlist: async (item: WishlistCreate): Promise<any> => {
    const response = await fetchWithRetry('/whishlist', {
      method: 'POST',
      body: JSON.stringify(item),
    });
    return response.data;
  },

  updateWishlist: async (id: number | string, item: WishlistCreate): Promise<any> => {
    const response = await fetchWithRetry(`/whishlist/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
    return response.data;
  },

  deleteWishlist: async (id: number | string): Promise<{ success: boolean; message: string }> => {
    const response = await fetchWithRetry(`/whishlist/${id}`, {
      method: 'DELETE',
    });
    return response.data;
  },
  
  getCart: async (userId: number | string): Promise<CartItem[]> => {
    const response = await fetchWithRetry(`/cart/${userId}`);
    return response.data;
  },

  addToCart: async (item: CartCreate): Promise<any> => {
    const response = await fetchWithRetry('/cart', {
      method: 'POST',
      body: JSON.stringify(item),
    });
    return response.data;
  },

  updateCart: async (id: number | string, item: CartCreate): Promise<any> => {
    const response = await fetchWithRetry(`/cart/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
    return response.data;
  },

  deleteCartItem: async (id: number | string): Promise<{ success: boolean; message: string }> => {
    const response = await fetchWithRetry(`/cart/${id}`, {
      method: 'DELETE',
    });
    return response.data;
  },

  createProduct: async (product: ProductCreate): Promise<SpecificProduct> => {
    const response = await fetchWithRetry('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
    return response.data;
  },

  updateProduct: async (id: number | string, product: ProductUpdate): Promise<SpecificProduct> => {
    const response = await fetchWithRetry(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
    return response.data;
  },

  deleteProduct: async (id: number | string): Promise<{ success: boolean; message: string }> => {
    const response = await fetchWithRetry(`/products/${id}`, {
      method: 'DELETE',
    });
    return response.data;
  },

  createReview: async (review: ReviewCreate): Promise<ReviewResponse> => {
    const response = await fetchWithRetry(`/reviews`, {
      method: 'POST',
      body: JSON.stringify(review),
    });
    return response.data;
  },

  updateReview: async (id: number | string, review: ReviewCreate): Promise<ReviewResponse> => {
    const response = await fetchWithRetry(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(review),
    });
    return response.data;
  },

  deleteReview: async (id: number | string): Promise<{ success: boolean; message: string }> => {
    const response = await fetchWithRetry(`/reviews/${id}`, {
      method: 'DELETE',
    });
    return response.data;
  },

  getReviews: async (): Promise<ReviewResponse[]> => {
    const response = await fetchWithRetry(`/reviews/`);
    return response.data;
  },

  createUser: async (user: UserCreate): Promise<UserResponse> => {
    const response = await fetchWithRetry('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
    return response.data;
  },

  updateUser: async (id: number | string, user: UserCreate): Promise<UserResponse> => {
    const response = await fetchWithRetry(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
    return response.data;
  },

  deleteUser: async (id: number | string): Promise<{ success: boolean; message: string }> => {
    const response = await fetchWithRetry(`/users/${id}`, {
      method: 'DELETE',
    });
    return response.data;
  },

  getUsers: async (): Promise<UserListItem[]> => {
    const response = await fetchWithRetry('/users/');
    return response.data;
  },

  getUser: async (id: number | string): Promise<UserListItem> => {
    const response = await fetchWithRetry(`/users/${id}`);
    return response.data;
  },

  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await fetchWithRetry('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return response.data;
  },
};
