import { wishlistAPI } from "../services/api";

export const toggleWishlistUtil = async ({
  productId,
  isInWishlist,
  wishlistId,
  navigate,
}) => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    navigate("/Login");
    return {
      success: false,
      message: "Please login to add to wishlist",
    };
  }

  try {
    if (isInWishlist) {
      await wishlistAPI.removeFromWishlist(wishlistId);

      window.dispatchEvent(new Event("wishlistUpdated"));

      return {
        success: true,
        removed: true,
      };
    }

    const res = await wishlistAPI.addToWishlist(productId);

    window.dispatchEvent(new Event("wishlistUpdated"));

    return {
      success: true,
      added: true,
      wishlistId: res.data.id,
    };
  } catch {
    return {
      success: false,
      message: "Failed to update wishlist",
    };
  }
};