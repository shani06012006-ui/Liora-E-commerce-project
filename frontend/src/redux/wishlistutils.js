import { wishlistAPI } from '../services/api';
 

export const addToWishlistUtil = async (productId, navigate) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    navigate('/Login');
    return { success: false, message: 'Please login to add to wishlist' };
  }
  try {
    const res = await wishlistAPI.addToWishlist(productId);
    window.dispatchEvent(new Event('wishlistUpdated'));
    return { success: true, wishlistId: res.data.id };
  } catch {
    return { success: false, message: 'Already in wishlist' };
  }
};
 
export const removeFromWishlistUtil = async (wishlistItemId) => {
  try {
    await wishlistAPI.removeFromWishlist(wishlistItemId);
    window.dispatchEvent(new Event('wishlistUpdated'));
    return { success: true };
  } catch {
    return { success: false, message: 'Failed to remove' };
  }
};