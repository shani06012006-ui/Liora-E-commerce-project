import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const getImageUrl = (product) => {
    if (product?.image_url) return product.image_url;
    if (product?.image) return `http://localhost:8000${product.image}`;
    return 'https://placehold.co/400x500/e0e0e0/2D2D2D?text=No+Image';
  };

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
      <Link to={`/product/${product.id}`}>
        <div className="relative overflow-hidden">
          <img 
            src={getImageUrl(product)} 
            alt={product.name}
            className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {product.discount && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded">
              {product.discount}% OFF
            </span>
          )}
          {product.stock === 0 && (
            <span className="absolute top-3 left-3 bg-gray-800 text-white text-xs px-2 py-1 rounded">
              Out of Stock
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
        <button className="w-full mt-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition text-sm">
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;