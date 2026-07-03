import { useReducer, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { productAPI, wishlistAPI, reviewAPI } from '../services/api';
import { addToCartSafe } from '../redux/cartUtils';
import { HeartIcon, StarIcon, TruckIcon, ShieldCheckIcon, ArrowPathIcon, BoltIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { toggleWishlistUtil } from '../redux/wishlistUtils';

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_PRODUCT':          return { ...state, product:        action.payload };
    case 'SET_LOADING':          return { ...state, loading:        action.payload };
    case 'SET_QUANTITY':         return { ...state, quantity:       action.payload };
    case 'SET_SELECTED_SIZE':    return { ...state, selectedSize:   action.payload };
    case 'SET_SELECTED_COLOR':   return { ...state, selectedColor:  action.payload };
    case 'SET_WISHLIST':         return { ...state, isInWishlist:   action.payload.status, wishlistId: action.payload.id };
    case 'SET_REVIEWS':          return { ...state, reviews:        action.payload.reviews, averageRating: action.payload.averageRating };
    case 'SET_SHOW_REVIEW_FORM': return { ...state, showReviewForm: action.payload };
    case 'SET_REVIEW_DATA':      return { ...state, reviewData:     { ...state.reviewData, ...action.payload } };
    case 'RESET_REVIEW_DATA':    return { ...state, reviewData:     { rating: 5, title: '', comment: '' }, showReviewForm: false };
    case 'SET_ADDING_TO_CART':   return { ...state, addingToCart:   action.payload };
    case 'SET_SUBMITTING':       return { ...state, submitting:     action.payload };
    default:                     return state;
  }
};

const initialState = {
  product: null, loading: true, quantity: 1,
  selectedSize: '', selectedColor: '',
  isInWishlist: false, wishlistId: null,
  reviews: [], averageRating: 0,
  showReviewForm: false,
  reviewData: { rating: 5, title: '', comment: '' },
  addingToCart: false, submitting: false,
};

const sizes  = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const colors = ['Black', 'White', 'Navy', 'Burgundy', 'Beige'];

const ProductDetail = () => {
  const { id }        = useParams();
  const navigate      = useNavigate();
  const reduxDispatch = useDispatch();
  const { user }      = useSelector((state) => state.auth);
  const [state, dispatch] = useReducer(reducer, initialState);

  const {
    product, loading, quantity, selectedSize, selectedColor,
    isInWishlist, wishlistId, reviews, averageRating,
    showReviewForm, reviewData, addingToCart, submitting,
  } = state;

  const fetchProduct = useCallback(async () => {
    try {
      const res = await productAPI.getById(id);
      dispatch({ type: 'SET_PRODUCT', payload: res.data });
    } catch { toast.error('Failed to load product'); }
    finally { dispatch({ type: 'SET_LOADING', payload: false }); }
  }, [id]);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await reviewAPI.getReviews(id);
      dispatch({ type: 'SET_REVIEWS', payload: { reviews: res.data.reviews || [], averageRating: res.data.average_rating || 0 } });
    } catch (err) { console.error(err); }
  }, [id]);

  const checkWishlistStatus = useCallback(async () => {
    if (!localStorage.getItem('access_token')) return;
    try {
      const res  = await wishlistAPI.getWishlist();
      const item = res.data.find(i => i.product === parseInt(id) || i.product_details?.id === parseInt(id));
      dispatch({ type: 'SET_WISHLIST', payload: { status: !!item, id: item?.id || null } });
    } catch (err) { console.error(err); }
  }, [id]);

  useEffect(() => {
    fetchProduct(); fetchReviews(); checkWishlistStatus();
  }, [fetchProduct, fetchReviews, checkWishlistStatus]);

  const addToCart = async () => {
    if (!localStorage.getItem('access_token')) { toast.error('Please login'); navigate('/Login'); return; }
    dispatch({ type: 'SET_ADDING_TO_CART', payload: true });
    try {
      const result = await addToCartSafe(reduxDispatch, product.id, quantity);
      if (result.alreadyExists) toast.error('Already in cart!');
      else if (result.success)  toast.success(`Added ${quantity} item(s) to cart!`);
      else                      toast.error('Failed to add to cart');
    } finally { dispatch({ type: 'SET_ADDING_TO_CART', payload: false }); }
  };

  const buyNow = () => {
    if (!localStorage.getItem('access_token')) { toast.error('Please login to buy'); navigate('/Login'); return; }
    navigate('/checkout', { state: { buyNow: true, product, quantity } });
  };

  const toggleWishlist = async () => {
    const result = await toggleWishlistUtil({ productId: product.id, isInWishlist, wishlistId, navigate });
    if (result.success) {
      if (result.removed) { dispatch({ type: 'SET_WISHLIST', payload: { status: false, id: null } }); toast.success('Removed from wishlist'); }
      else if (result.added) { dispatch({ type: 'SET_WISHLIST', payload: { status: true, id: result.wishlistId } }); toast.success('Added to wishlist'); }
    } else { toast.error(result.message || 'Failed to update wishlist'); }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to submit a review'); navigate('/Login'); return; }
    dispatch({ type: 'SET_SUBMITTING', payload: true });
    try {
      await reviewAPI.createReview(product.id, { rating: reviewData.rating, title: reviewData.title, comment: reviewData.comment });
      toast.success('Review submitted!');
      dispatch({ type: 'RESET_REVIEW_DATA' });
      fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit review');
    } finally { dispatch({ type: 'SET_SUBMITTING', payload: false }); }
  };

  const getImageUrl = (p) => {
    if (p?.image_url) return p.image_url;
    if (p?.image)     return `http://localhost:8000${p.image}`;
    return 'https://placehold.co/600x800/e0e0e0/2D2D2D?text=No+Image';
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto" />
        <p className="text-gray-500 mt-4 text-sm">Loading...</p>
      </div>
    </div>
  );

  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <p className="text-gray-500">Product not found.</p>
      <Link to="/Collections" className="inline-block mt-4 text-gray-900 hover:text-gray-600">Back to Shop</Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
      {/* Breadcrumb */}
      <div className="mb-4 md:mb-6 text-xs md:text-sm text-gray-500 flex items-center gap-1 flex-wrap">
        <Link to="/" className="hover:text-gray-900">Home</Link>
        <span>/</span>
        <Link to="/Collections" className="hover:text-gray-900">Collections</Link>
        <span>/</span>
        <span className="text-gray-900 truncate max-w-[150px]">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">

        {/* Product Image */}
        <div className="bg-gray-100 rounded-xl md:rounded-2xl overflow-hidden">
          <img src={getImageUrl(product)} alt={product.name} className="w-full h-auto object-cover" />
        </div>

        {/* Product Info */}
        <div className="px-0">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-4">
              <h1 className="text-2xl md:text-3xl font-serif text-gray-900 mb-1">{product.name}</h1>
              <p className="text-gray-500 text-xs">{product.category?.toUpperCase()}</p>
            </div>
            <button onClick={toggleWishlist}
              className="p-2 border border-gray-200 rounded-full hover:border-gray-900 transition flex-shrink-0">
              {isInWishlist
                ? <HeartSolidIcon className="w-5 h-5 text-red-500" />
                : <HeartIcon className="w-5 h-5 text-gray-400" />}
            </button>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-3">
            <div className="flex">
              {[1,2,3,4,5].map(star => (
                <StarSolidIcon key={star} className={`w-4 h-4 ${star <= averageRating ? 'text-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-xs text-gray-500">({reviews.length} reviews)</span>
          </div>

          {/* Price */}
          <div className="mt-4">
            <p className="text-2xl md:text-3xl font-bold text-gray-900">₹{product.price}</p>
            {product.original_price && (
              <p className="text-sm text-gray-400 line-through">₹{product.original_price}</p>
            )}
          </div>

          {/* Description */}
          <div className="mt-4 md:mt-6">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Description</h3>
            <p className="text-gray-600 leading-relaxed text-sm">{product.description}</p>
          </div>

          {/* Size */}
          <div className="mt-5 md:mt-6">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Select Size</h3>
            <div className="flex flex-wrap gap-2">
              {sizes.map(size => (
                <button key={size}
                  onClick={() => dispatch({ type: 'SET_SELECTED_SIZE', payload: size })}
                  className={`px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm border rounded-lg transition ${
                    selectedSize === size ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 hover:border-gray-900'
                  }`}>
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="mt-5 md:mt-6">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Select Color</h3>
            <div className="flex flex-wrap gap-2">
              {colors.map(color => (
                <button key={color}
                  onClick={() => dispatch({ type: 'SET_SELECTED_COLOR', payload: color })}
                  className={`px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm border rounded-lg transition ${
                    selectedColor === color ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 hover:border-gray-900'
                  }`}>
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="mt-5 md:mt-6">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Quantity</h3>
            <div className="flex items-center gap-3">
              <button onClick={() => dispatch({ type: 'SET_QUANTITY', payload: Math.max(1, quantity - 1) })}
                className="w-9 h-9 md:w-10 md:h-10 border rounded-lg hover:bg-gray-100 text-lg md:text-xl">-</button>
              <span className="text-lg md:text-xl font-semibold w-10 text-center">{quantity}</span>
              <button onClick={() => dispatch({ type: 'SET_QUANTITY', payload: quantity + 1 })}
                className="w-9 h-9 md:w-10 md:h-10 border rounded-lg hover:bg-gray-100 text-lg md:text-xl">+</button>
              <span className="text-xs text-gray-500">Stock: {product.stock}</span>
            </div>
          </div>

          {product.stock === 0 && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-xs md:text-sm">
              Out of Stock
            </div>
          )}

          {/* Cart + Buy Now */}
          <div className="flex gap-3 mt-6 md:mt-8">
            <button onClick={addToCart} disabled={product.stock === 0 || addingToCart}
              className={`flex-1 py-2.5 md:py-3 rounded-lg transition flex items-center justify-center gap-2 text-sm ${
                product.stock === 0 || addingToCart ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6.5M17 13l1.5 6.5M9 21h6M12 21v-8" />
              </svg>
              {addingToCart ? 'ADDING...' : 'ADD TO CART'}
            </button>

            <button onClick={buyNow} disabled={product.stock === 0}
              className={`flex-1 border border-gray-900 text-gray-900 py-2.5 md:py-3 rounded-lg transition flex items-center justify-center gap-2 text-sm ${
                product.stock === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-900 hover:text-white'
              }`}>
              <BoltIcon className="w-4 h-4" />
              BUY NOW
            </button>
          </div>

          {/* Shipping Info */}
          <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t space-y-2.5">
            {[
              [TruckIcon,       'Free shipping on orders above ₹999'],
              [ArrowPathIcon,   '7-day easy returns'],
              [ShieldCheckIcon, 'Secure payments'],
            ].map(([Icon, text]) => (
              <div key={text} className="flex items-center gap-3 text-xs md:text-sm text-gray-600">
                <Icon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12 md:mt-16 pt-6 md:pt-8 border-t">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-900">Customer Reviews</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">
                {[1,2,3,4,5].map(star => (
                  <StarSolidIcon key={star} className={`w-4 h-4 md:w-5 md:h-5 ${star <= averageRating ? 'text-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-xs md:text-sm text-gray-500">({reviews.length} reviews)</span>
            </div>
          </div>
          <button onClick={() => dispatch({ type: 'SET_SHOW_REVIEW_FORM', payload: !showReviewForm })}
            className="px-3 md:px-4 py-1.5 md:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm">
            Write a Review
          </button>
        </div>

        {showReviewForm && (
          <form onSubmit={submitReview} className="bg-gray-50 p-4 md:p-6 rounded-xl mb-8">
            <h4 className="font-semibold text-gray-900 mb-4 text-sm md:text-base">Write Your Review</h4>
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2">Rating</label>
              <div className="flex gap-1.5 md:gap-2">
                {[1,2,3,4,5].map(star => (
                  <button key={star} type="button"
                    onClick={() => dispatch({ type: 'SET_REVIEW_DATA', payload: { rating: star } })}
                    className="focus:outline-none">
                    {star <= reviewData.rating
                      ? <StarSolidIcon className="w-7 h-7 md:w-8 md:h-8 text-yellow-400" />
                      : <StarIcon      className="w-7 h-7 md:w-8 md:h-8 text-gray-300" />}
                  </button>
                ))}
              </div>
            </div>
            <input type="text" placeholder="Review Title" required value={reviewData.title}
              onChange={(e) => dispatch({ type: 'SET_REVIEW_DATA', payload: { title: e.target.value } })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg mb-4 focus:ring-2 focus:ring-gray-900 text-sm" />
            <textarea placeholder="Your Review" rows="4" required value={reviewData.comment}
              onChange={(e) => dispatch({ type: 'SET_REVIEW_DATA', payload: { comment: e.target.value } })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg mb-4 focus:ring-2 focus:ring-gray-900 text-sm" />
            <div className="flex gap-3">
              <button type="submit" disabled={submitting}
                className="bg-gray-900 text-white px-4 md:px-6 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 text-sm">
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button type="button"
                onClick={() => dispatch({ type: 'SET_SHOW_REVIEW_FORM', payload: false })}
                className="px-4 md:px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-center py-8 text-sm">No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map(review => (
              <div key={review.id} className="border-b border-gray-100 pb-4">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <div className="flex gap-0.5 mb-1">
                      {[1,2,3,4,5].map(star => (
                        <StarSolidIcon key={star} className={`w-3.5 h-3.5 md:w-4 md:h-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm">{review.title}</h4>
                    <p className="text-gray-600 text-xs md:text-sm mt-1">{review.comment}</p>
                    <p className="text-[11px] text-gray-400 mt-2">
                      By {review.user_name || 'Anonymous'} • {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {review.is_verified_purchase && (
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">Verified</span>
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