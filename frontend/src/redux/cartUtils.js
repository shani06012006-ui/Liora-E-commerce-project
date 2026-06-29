import { cartAPI } from '../services/api';
import { setCart } from './cartSlice';
 
export const refreshCart = async (dispatch) => {
  try {
    const cartRes = await cartAPI.getCart();
    dispatch(setCart(cartRes.data));
    window.dispatchEvent(new Event('cartUpdated'));
  } catch (err) {
    console.error('Error refreshing cart:', err);
  }
};
 
export const addToCartSafe = async (dispatch, productId, quantity = 1) => {
  try {
    const res = await cartAPI.addToCart({ product_id: productId, quantity });
 
    if (res.data?.already_exists) {
      return { alreadyExists: true };
    }
 
    await refreshCart(dispatch);
    return { success: true };
 
  } catch (err) {
    console.error('Error adding to cart:', err);
    return { error: true };
  }
};