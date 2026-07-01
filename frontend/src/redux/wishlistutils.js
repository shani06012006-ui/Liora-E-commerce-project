import { wishlistAPI } from "../services/api";

export const addToWishlistUtil = async (productId, navigate) => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    navigate("/Login");
    return { success: false, message: "Please login to add to wishlist" };
  }
  try {
    const res = await wishlistAPI.addToWishlist(productId);
    window.dispatchEvent(new Event("wishlistUpdated"));
    return { success: true, added: true, wishlistId: res.data.id };
  } catch {
    return { success: false, message: "Failed to add to wishlist" };
  }
};

export const removeFromWishlistUtil = async (wishlistId) => {
  try {
    await wishlistAPI.removeFromWishlist(wishlistId);
    window.dispatchEvent(new Event("wishlistUpdated"));
    return { success: true, removed: true };
  } catch {
    return { success: false, message: "Failed to remove from wishlist" };
  }
};

export const toggleWishlistUtil = async ({
  productId,
  isInWishlist,
  wishlistId,
  navigate,
}) => {
  if (isInWishlist) {
    return await removeFromWishlistUtil(wishlistId);
  } else {
    return await addToWishlistUtil(productId, navigate);
  }
};