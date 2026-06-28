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