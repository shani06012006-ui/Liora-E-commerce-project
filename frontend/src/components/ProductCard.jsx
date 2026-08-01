import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { getImageUrl } from '../services/api';
import { addToCartSafe } from '../redux/cartUtils';
import { getTokens } from '../utils/storage';
 
const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
 
  const isOutOfStock = product.stock === 0;
 
  const handleAddToCart = async (e) => {
    // Prevent the click from bubbling up into the wrapping <Link>
    e.preventDefault();
    e.stopPropagation();
 
    if (isOutOfStock || adding) return;
 
    const { accessToken } = getTokens();
    if (!accessToken) {
      toast.error('Please login to add items to your cart');
      navigate('/Login');
      return;
    }
 
    setAdding(true);
    try {
      const result = await addToCartSafe(dispatch, product.id, 1);
      if (result.alreadyExists) toast.error('Already in cart!');
      else if (result.success) toast.success('Added to cart!');
      else toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };
 
  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
      <Link to={`/product/${product.id}`}>
        <div className="relative overflow-hidden">
          <img
            src={getImageUrl(product)}
            alt={product.name}
            className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { e.target.src = 'https://placehold.co/400x500/e0e0e0/2D2D2D?text=Product'; }}
          />
 
          {/* Out of stock takes priority; only show one badge at a time so they never overlap */}
          {isOutOfStock ? (
            <span className="absolute top-3 left-3 bg-gray-800 text-white text-xs px-2 py-1 rounded">
              Out of Stock
            </span>
          ) : product.discount > 0 && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded">
              {product.discount}% OFF
            </span>
          )}
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-medium text-gray-800 hover:text-gray-600 line-clamp-1">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-2 mt-2">
          <p className="text-gray-800 font-bold">₹{product.price}</p>
          {product.original_price && (
            <p className="text-gray-400 line-through text-sm">₹{product.original_price}</p>
          )}
        </div>
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || adding}
          aria-label={isOutOfStock ? 'Out of stock' : `Add ${product.name} to cart`}
          className={`w-full mt-3 py-2 rounded-lg transition text-sm ${
            isOutOfStock
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-800 text-white hover:bg-gray-700'
          }`}
        >
          {isOutOfStock ? 'Out of Stock' : adding ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};
 
export default ProductCard;
 