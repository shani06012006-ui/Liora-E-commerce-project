import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { productAPI, cartAPI, wishlistAPI, reviewAPI } from '../services/api';
import { setCart } from '../redux/cartSlice';
import { HeartIcon, StarIcon, TruckIcon, ShieldCheckIcon, ArrowPathIcon, BoltIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistId, setWishlistId] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, title: '', comment: '' });
  const [addingToCart, setAddingToCart] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    checkWishlistStatus();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await productAPI.getById(id);
      setProduct(res.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load product');
    }
    setLoading(false);
  };

  const fetchReviews = async () => {
    try {
      const res = await reviewAPI.getReviews(id);
      setReviews(res.data.reviews || []);
      setAverageRating(res.data.average_rating || 0);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const checkWishlistStatus = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    
    try {
      const res = await wishlistAPI.getWishlist();
      const wishlistItem = res.data.find(item => item.product === parseInt(id) || item.product_details?.id === parseInt(id));
      if (wishlistItem) {
        setIsInWishlist(true);
        setWishlistId(wishlistItem.id);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const addToCart = async () => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    toast.error('Please login to add items to cart');
    navigate('/login');
    return;
  }

  setAddingToCart(true);
  try {
    await cartAPI.addToCart({ product_id: product.id, quantity });
    const cartRes = await cartAPI.getCart();
    dispatch(setCart(cartRes.data));
    toast.success(`Added ${quantity} item(s) to cart!`);
  } catch (error) {
    toast.error('Failed to add to cart');
  } finally {
    setAddingToCart(false);
  }
  };

  // Buy Now function - Direct checkout
  const buyNow = async () => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    toast.error('Please login to buy');
    navigate('/login');
    return;
  }

  try {
    await cartAPI.addToCart({ product_id: product.id, quantity });
    const cartRes = await cartAPI.getCart();
    dispatch(setCart(cartRes.data));
    navigate('/checkout');
  } catch (error) {
    toast.error('Failed to proceed');
  }
};

  const toggleWishlist = async () => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    toast.error('Please login to add to wishlist');
    navigate('/login');
    return;
  }

  try {
    if (isInWishlist) {
      await wishlistAPI.removeFromWishlist(wishlistId);
      setIsInWishlist(false);
      toast.success('Removed from wishlist');
    } else {
      await wishlistAPI.addToWishlist(product.id);
      setIsInWishlist(true);
      toast.success('Added to wishlist');
    }
  } catch (error) {
    toast.error('Failed to update wishlist');
  }
  };

  // Update the submitReview function
const submitReview = async (e) => {
  e.preventDefault();
  if (!user) {
    toast.error('Please login to submit a review');
    navigate('/login');
    return;
  }
  
  if (!reviewData.rating) {
    toast.error('Please select a rating');
    return;
  }
  
  setSubmitting(true);
  try {
    const response = await reviewAPI.createReview(product.id, {
      rating: reviewData.rating,
      title: reviewData.title,
      comment: reviewData.comment
    });
    
    console.log('Review submitted:', response.data);
    toast.success('Review submitted successfully!');
    setShowReviewForm(false);
    setReviewData({ rating: 5, title: '', comment: '' });
    fetchReviews(); // Refresh reviews
  } catch (error) {
    console.error('Review error:', error);
    const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to submit review';
    toast.error(errorMsg);
  } finally {
    setSubmitting(false);
  }
};

  const getImageUrl = (product) => {
    if (product?.image_url) return product.image_url;
    if (product?.image) return `http://localhost:8000${product.image}`;
    return 'https://placehold.co/600x800/e0e0e0/2D2D2D?text=No+Image';
  };

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colors = ['Black', 'White', 'Navy', 'Burgundy', 'Beige'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">Product not found.</p>
        <Link to="/dresses" className="inline-block mt-4 text-gray-900 hover:text-gray-600">Back to Shop</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-gray-500">
        <Link to="/" className="hover:text-gray-900">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/dresses" className="hover:text-gray-900">Dresses</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="bg-gray-100 rounded-2xl overflow-hidden">
            <img 
              src={getImageUrl(product)} 
              alt={product.name}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        {/* Product Info */}
        <div>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-serif text-gray-900 mb-2">{product.name}</h1>
              <p className="text-gray-500 text-sm">{product.category?.toUpperCase()}</p>
            </div>
            <button
              onClick={toggleWishlist}
              className="p-2 border border-gray-200 rounded-full hover:border-gray-900 transition"
            >
              {isInWishlist ? (
                <HeartSolidIcon className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5 text-gray-400 hover:text-gray-900" />
              )}
            </button>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-3">
            <div className="flex">
              {[1,2,3,4,5].map((star) => (
                <StarSolidIcon key={star} className={`w-4 h-4 ${star <= averageRating ? 'text-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
          </div>

          {/* Price */}
          <div className="mt-4">
            <p className="text-3xl font-bold text-gray-900">₹{product.price}</p>
            {product.original_price && (
              <p className="text-sm text-gray-400 line-through">₹{product.original_price}</p>
            )}
          </div>

          {/* Description */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Size Selection */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-2">Select Size</h3>
            <div className="flex flex-wrap gap-3">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 border rounded-lg transition ${
                    selectedSize === size
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-300 hover:border-gray-900'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-2">Select Color</h3>
            <div className="flex flex-wrap gap-3">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-4 py-2 border rounded-lg transition ${
                    selectedColor === color
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-300 hover:border-gray-900'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-2">Quantity</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border rounded-lg hover:bg-gray-100 text-xl"
              >
                -
              </button>
              <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 border rounded-lg hover:bg-gray-100 text-xl"
              >
                +
              </button>
              <span className="text-sm text-gray-500">Stock: {product.stock} available</span>
            </div>
          </div>

          {/* Stock Status */}
          {product.stock === 0 && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              Out of Stock - Notify me when available
            </div>
          )}

          {/* Action Buttons - Add to Cart & Buy Now side by side */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={addToCart}
              disabled={product.stock === 0 || addingToCart}
              className={`flex-1 py-3 rounded-lg transition flex items-center justify-center gap-2 ${
                product.stock === 0 || addingToCart
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6.5M17 13l1.5 6.5M9 21h6M12 21v-8" />
              </svg>
              {addingToCart ? 'ADDING...' : 'ADD TO CART'}
            </button>
            <button
              onClick={buyNow}
              disabled={product.stock === 0}
              className={`flex-1 border border-gray-900 text-gray-900 py-3 rounded-lg transition flex items-center justify-center gap-2 ${
                product.stock === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-900 hover:text-white'
              }`}
            >
              <BoltIcon className="w-4 h-4" />
              BUY NOW
            </button>
          </div>

          {/* Shipping Info */}
          <div className="mt-8 pt-6 border-t space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <TruckIcon className="w-5 h-5" />
              <span>Free shipping on orders above ₹999</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <ArrowPathIcon className="w-5 h-5" />
              <span>7-day easy returns</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <ShieldCheckIcon className="w-5 h-5" />
              <span>Secure payments</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16 pt-8 border-t">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Customer Reviews</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">
                {[1,2,3,4,5].map((star) => (
                  <StarSolidIcon key={star} className={`w-5 h-5 ${star <= averageRating ? 'text-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
            </div>
          </div>
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Write a Review
          </button>
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <form onSubmit={submitReview} className="bg-gray-50 p-6 rounded-xl mb-8">
            <h4 className="font-semibold text-gray-900 mb-4">Write Your Review</h4>
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2">Rating</label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewData({...reviewData, rating: star})}
                    className="focus:outline-none"
                  >
                    {star <= reviewData.rating ? (
                      <StarSolidIcon className="w-8 h-8 text-yellow-400" />
                    ) : (
                      <StarIcon className="w-8 h-8 text-gray-300" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Review Title"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900"
                value={reviewData.title}
                onChange={(e) => setReviewData({...reviewData, title: e.target.value})}
                required
              />
            </div>
            <div className="mb-4">
              <textarea
                placeholder="Your Review"
                rows="4"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900"
                value={reviewData.comment}
                onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                required
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting}
                    className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50">
                    {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-100 pb-4">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <div className="flex gap-1 mb-1">
                      {[1,2,3,4,5].map((star) => (
                        <StarSolidIcon key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <h4 className="font-semibold text-gray-900">{review.title}</h4>
                    <p className="text-gray-600 text-sm mt-1">{review.comment}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      By {review.user_name || 'Anonymous'} • {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {review.is_verified_purchase && (
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">Verified Purchase</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;