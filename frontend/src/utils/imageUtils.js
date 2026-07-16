// frontend/src/utils/imageUtils.js
import { getImageUrl } from '../services/api';

export const getProductImage = (product) => {
  if (!product) return 'https://placehold.co/100x100/e0e0e0/2D2D2D?text=No+Image';
  return getImageUrl(product);
};

export default getProductImage;