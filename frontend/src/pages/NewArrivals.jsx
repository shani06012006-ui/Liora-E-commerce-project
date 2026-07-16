// frontend/src/pages/NewArrivals.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, getImageUrl } from '../services/api';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await productAPI.getAll({ sort: 'newest', limit: 8 });
      setProducts(res.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const getProductImage = (product) => getImageUrl(product);

  const fallbackProducts = [
    { id: 1, name: 'TIMELESS SUITS', price: 4999, original_price: 6999, discount: 28, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format' },
    { id: 2, name: 'WINTER ESSENTIALS', price: 3299, original_price: 4999, discount: 34, image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&auto=format' },
    { id: 3, name: 'PURE LOVER', price: 2499, original_price: 3499, discount: 28, image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600&auto=format' },
    { id: 4, name: 'PURE CLOVER', price: 3999, original_price: 5999, discount: 33, image: 'https://images.unsplash.com/photo-1483985988355-963728e2c5e8?w=600&auto=format' },
  ];

  const displayProducts = products.length > 0 ? products.slice(0, 4) : fallbackProducts;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="flex flex-col justify-center items-center text-center py-20 px-4">
        <h1 className="text-5xl md:text-6xl font-light text-gray-900 tracking-wide mb-4">NEW ARRIVALS</h1>
        <Link 
          to="/Collections" 
          className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-gray-600 hover:text-gray-900 transition"
        >
          SHOP NOW
          <ChevronRightIcon className="w-3 h-3" />
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 items-center">
          <div className="relative overflow-hidden bg-gray-100 aspect-[4/5]">
            <img 
              src={getProductImage(displayProducts[0])} 
              alt={displayProducts[0]?.name}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              onError={(e) => { e.target.src = 'https://placehold.co/600x700/f5f5f5/999999?text=Image'; }}
            />
            {displayProducts[0]?.discount > 0 && (
              <span className="absolute top-4 left-4 bg-black text-white text-xs px-2 py-1">
                {displayProducts[0]?.discount}% OFF
              </span>
            )}
          </div>
          <div className="text-left">
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-3 tracking-wide">
              {displayProducts[0]?.name}
            </h2>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl font-medium text-gray-900">₹{displayProducts[0]?.price}</span>
              {displayProducts[0]?.original_price && (
                <span className="text-gray-400 line-through">₹{displayProducts[0]?.original_price}</span>
              )}
            </div>
            <Link 
              to={`/product/${displayProducts[0]?.id}`}
              className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-gray-600 hover:text-gray-900 transition"
            >
              READ MORE
              <ChevronRightIcon className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 items-center">
          <div className="order-2 md:order-1 text-left">
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-3 tracking-wide">
              {displayProducts[1]?.name}
            </h2>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl font-medium text-gray-900">₹{displayProducts[1]?.price}</span>
              {displayProducts[1]?.original_price && (
                <span className="text-gray-400 line-through">₹{displayProducts[1]?.original_price}</span>
              )}
            </div>
            <Link 
              to={`/product/${displayProducts[1]?.id}`}
              className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-gray-600 hover:text-gray-900 transition"
            >
              READ MORE
              <ChevronRightIcon className="w-3 h-3" />
            </Link>
          </div>
          <div className="order-1 md:order-2 relative overflow-hidden bg-gray-100 aspect-[4/5]">
            <img 
              src={getProductImage(displayProducts[1])} 
              alt={displayProducts[1]?.name}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              onError={(e) => { e.target.src = 'https://placehold.co/600x700/f5f5f5/999999?text=Image'; }}
            />
            {displayProducts[1]?.discount > 0 && (
              <span className="absolute top-4 left-4 bg-black text-white text-xs px-2 py-1">
                {displayProducts[1]?.discount}% OFF
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 items-center">
          <div className="relative overflow-hidden bg-gray-100 aspect-[4/5]">
            <img 
              src={getProductImage(displayProducts[2])} 
              alt={displayProducts[2]?.name}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              onError={(e) => { e.target.src = 'https://placehold.co/600x700/f5f5f5/999999?text=Image'; }}
            />
            {displayProducts[2]?.discount > 0 && (
              <span className="absolute top-4 left-4 bg-black text-white text-xs px-2 py-1">
                {displayProducts[2]?.discount}% OFF
              </span>
            )}
          </div>
          <div className="text-left">
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-3 tracking-wide">
              {displayProducts[2]?.name}
            </h2>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl font-medium text-gray-900">₹{displayProducts[2]?.price}</span>
              {displayProducts[2]?.original_price && (
                <span className="text-gray-400 line-through">₹{displayProducts[2]?.original_price}</span>
              )}
            </div>
            <Link 
              to={`/product/${displayProducts[2]?.id}`}
              className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-gray-600 hover:text-gray-900 transition"
            >
              READ MORE
              <ChevronRightIcon className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 items-center">
          <div className="order-2 md:order-1 text-left">
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-3 tracking-wide">
              {displayProducts[3]?.name}
            </h2>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl font-medium text-gray-900">₹{displayProducts[3]?.price}</span>
              {displayProducts[3]?.original_price && (
                <span className="text-gray-400 line-through">₹{displayProducts[3]?.original_price}</span>
              )}
            </div>
            <Link 
              to={`/product/${displayProducts[3]?.id}`}
              className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-gray-600 hover:text-gray-900 transition"
            >
              READ MORE
              <ChevronRightIcon className="w-3 h-3" />
            </Link>
          </div>
          <div className="order-1 md:order-2 relative overflow-hidden bg-gray-100 aspect-[4/5]">
            <img 
              src={getProductImage(displayProducts[3])} 
              alt={displayProducts[3]?.name}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              onError={(e) => { e.target.src = 'https://placehold.co/600x700/f5f5f5/999999?text=Image'; }}
            />
            {displayProducts[3]?.discount > 0 && (
              <span className="absolute top-4 left-4 bg-black text-white text-xs px-2 py-1">
                {displayProducts[3]?.discount}% OFF
              </span>
            )}
          </div>
        </div>

        <div className="text-center mt-8 pt-8">
          <Link 
            to="/Sale" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm uppercase tracking-[0.2em] transition"
          >
            DISCOVER MORE
            <ChevronRightIcon className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NewArrivals;