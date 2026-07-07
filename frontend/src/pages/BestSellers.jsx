import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useDispatch } from 'react-redux';
import { refreshCart } from '../redux/cartUtils';
import toast from 'react-hot-toast';
import {addToWishlistUtil, removeFromWishlistUtil } from "../redux/wishlistUtils";
 
/* ─── Font loader ─── */
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300&family=Montserrat:wght@300;400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    .bs-wrap { font-family: 'Montserrat', sans-serif; background: #FFFFFF; color: #111111; }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
    @keyframes slideInLeft { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes slideInRight { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
    .animate-fadeUp { animation: fadeInUp 0.7s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards; }
    .animate-scale { animation: scaleIn 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards; }
    .animate-slideLeft { animation: slideInLeft 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards; }
    .animate-slideRight { animation: slideInRight 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards; }
    .animate-fade { animation: fadeIn 0.5s ease-out forwards; }
    .delay-1 { animation-delay: 0.1s; opacity: 0; }
    .delay-2 { animation-delay: 0.2s; opacity: 0; }
    .delay-3 { animation-delay: 0.3s; opacity: 0; }
    .delay-4 { animation-delay: 0.4s; opacity: 0; }
    .hover-lift { transition: all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1); }
    .hover-lift:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.04); }
    .bs-hero { display: grid; grid-template-columns: 1fr 1fr; min-height: 480px; background: #FFFFFF; }
    .bs-hero-left { padding: 72px 56px; display: flex; flex-direction: column; justify-content: center; }
    .bs-hero-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(52px, 6.5vw, 76px); font-weight: 400; line-height: 1.05; color: #111; margin-bottom: 24px; }
    .bs-hero-sub { font-size: 12px; color: #666; line-height: 1.8; max-width: 320px; margin-bottom: 36px; }
    .bs-hero-btn { display: inline-block; width: fit-content; background: #111; color: #fff; padding: 14px 36px; font-size: 10px; font-weight: 600; letter-spacing: 0.25em; text-decoration: none; text-transform: uppercase; transition: all 0.3s ease; border: none; cursor: pointer; }
    .bs-hero-btn:hover { background: #333; }
    .bs-hero-right { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: #E8E8E8; padding: 1px; }
    .bs-hcell { background: #FFFFFF; display: flex; flex-direction: column; justify-content: flex-end; padding: 24px; position: relative; min-height: 215px; overflow: hidden; transition: all 0.4s ease; cursor: pointer; }
    .bs-hcell:hover { transform: translateY(-3px); }
    .bs-hcell-wide { grid-column: 1/3; min-height: 100px; background: #111; }
    .bs-hcell-label { font-size: 9px; letter-spacing: 0.2em; color: #aaa; text-transform: uppercase; position: relative; z-index: 2; }
    .bs-hcell-wide .bs-hcell-label { color: rgba(255,255,255,0.7); }
    .bs-hcell-badge { position: absolute; top: 16px; left: 16px; background: #111; color: #fff; font-size: 8px; font-weight: 700; letter-spacing: 0.1em; padding: 5px 12px; text-transform: uppercase; z-index: 2; }
    .bs-hcell-badge-ol { position: absolute; top: 16px; left: 16px; border: 1px solid #DDD; background: #fff; color: #555; font-size: 8px; font-weight: 600; letter-spacing: 0.1em; padding: 5px 12px; text-transform: uppercase; z-index: 2; }
    .bs-hcell-stars { position: absolute; top: 16px; right: 16px; font-size: 11px; color: #111; letter-spacing: 2px; z-index: 2; }
    .bs-hcell img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: top; opacity: 0.5; transition: transform 0.6s ease; }
    .bs-hcell:hover img { transform: scale(1.05); opacity: 0.55; }
    .bs-stats { display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1px solid #EDEDED; border-bottom: 1px solid #EDEDED; background: #FBFBFB; }
    .bs-stat { padding: 32px 24px; text-align: center; border-right: 1px solid #EDEDED; transition: all 0.3s ease; position: relative; }
    .bs-stat:last-child { border-right: none; }
    .bs-stat:hover { background: #FFFFFF; }
    .bs-stat-num { font-family: 'Cormorant Garamond', serif; font-size: 44px; font-weight: 500; color: #111; margin-bottom: 8px; }
    .bs-stat-lbl { font-size: 9px; letter-spacing: 0.25em; color: #999; text-transform: uppercase; }
    .bs-about { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid #EDEDED; }
    .bs-about-l { padding: 56px 52px; background: #FBFBFB; border-right: 1px solid #EDEDED; }
    .bs-about-r { padding: 56px 52px; background: #FFFFFF; }
    .bs-sec-tag { font-size: 10px; font-weight: 500; letter-spacing: 0.35em; color: #999; text-transform: uppercase; margin-bottom: 16px; }
    .bs-sec-title { font-family: 'Cormorant Garamond', serif; font-size: 34px; font-weight: 400; line-height: 1.2; color: #111; margin-bottom: 20px; }
    .bs-body-txt { font-size: 12px; color: #666; line-height: 1.85; }
    .bs-vals { margin-top: 28px; display: flex; flex-direction: column; gap: 16px; }
    .bs-val { display: flex; align-items: center; gap: 14px; }
    .bs-val-dot { width: 6px; height: 6px; background: #111; border-radius: 50%; }
    .bs-val-txt { font-size: 10px; letter-spacing: 0.15em; color: #555; text-transform: uppercase; font-weight: 500; }
    .bs-mini-grid { margin-top: 28px; display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .bs-mini-card { padding: 24px; border: 1px solid #E8E8E8; background: #FFFFFF; transition: all 0.3s ease; text-align: center; }
    .bs-mini-card:hover { border-color: #111; transform: translateY(-3px); }
    .bs-mini-n { font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 500; color: #111; margin-bottom: 6px; }
    .bs-mini-l { font-size: 8px; letter-spacing: 0.2em; color: #aaa; text-transform: uppercase; }
    .bs-loved { padding: 56px 52px; background: #FFFFFF; }
    .bs-section-hdr { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 40px; flex-wrap: wrap; gap: 20px; }
    .bs-view-all { font-size: 9px; letter-spacing: 0.25em; color: #999; text-transform: uppercase; border-bottom: 1px solid #DDD; padding-bottom: 4px; text-decoration: none; transition: all 0.2s ease; }
    .bs-view-all:hover { color: #111; border-color: #111; }
    .bs-pgrid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 30px; }
    .bs-pcard { background: #FFFFFF; transition: all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1); }
    .bs-pcard:hover { transform: translateY(-8px); }
    .bs-pimg { height: 260px; background: #F5F5F5; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; margin-bottom: 18px; }
    .bs-pimg-inner { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; transition: transform 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1); }
    .bs-pcard:hover .bs-pimg-inner { transform: scale(1.04); }
    .bs-pimg-inner img { width: 100%; height: 100%; object-fit: cover; object-position: top; }
    .bs-pbadge { position: absolute; top: 12px; left: 12px; background: #111; color: #fff; font-size: 8px; font-weight: 700; letter-spacing: 0.1em; padding: 4px 12px; z-index: 2; }
    .bs-pheart { position: absolute; top: 12px; right: 12px; font-size: 15px; color: #CCC; cursor: pointer; transition: all 0.2s ease; z-index: 2; background: rgba(255,255,255,0.8); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .bs-pheart:hover { color: #111; background: #fff; }
    .bs-pinfo { padding: 0 6px 12px; text-align: center; }
    .bs-pstars { font-size: 10px; color: #111; letter-spacing: 2px; margin-bottom: 8px; }
    .bs-pname { font-size: 11px; font-weight: 500; letter-spacing: 0.1em; color: #111; margin-bottom: 6px; text-transform: uppercase; }
    .bs-pprice { font-size: 13px; color: #111; font-weight: 600; }
    .bs-pold { font-size: 10px; color: #BBB; text-decoration: line-through; margin-left: 6px; }
    .bs-padd { width: 100%; padding: 10px; background: transparent; border: 1px solid #E0E0E0; font-size: 9px; font-weight: 600; letter-spacing: 0.2em; color: #666; text-transform: uppercase; margin-top: 10px; cursor: pointer; transition: all 0.25s ease; }
    .bs-padd:hover { background: #111; color: #fff; border-color: #111; }
    .bs-rated { display: grid; grid-template-columns: 2fr 1fr; border-top: 1px solid #EDEDED; border-bottom: 1px solid #EDEDED; }
    .bs-rated-list { padding: 56px 52px; border-right: 1px solid #EDEDED; background: #FFFFFF; }
    .bs-r-item { display: flex; align-items: center; gap: 18px; padding: 18px 0; border-bottom: 1px solid #F0F0F0; transition: all 0.25s ease; }
    .bs-r-item:last-child { border-bottom: none; }
    .bs-r-num { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 400; color: #E0E0E0; width: 32px; flex-shrink: 0; }
    .bs-r-img { width: 55px; height: 65px; background: #F5F5F5; flex-shrink: 0; overflow: hidden; }
    .bs-r-img img { width: 100%; height: 100%; object-fit: cover; object-position: top; }
    .bs-r-info { flex: 1; }
    .bs-r-name { font-size: 11px; font-weight: 500; letter-spacing: 0.1em; color: #111; margin-bottom: 5px; }
    .bs-r-stars { font-size: 9px; color: #111; letter-spacing: 1px; margin-bottom: 4px; }
    .bs-r-rev { font-size: 8px; color: #BBB; }
    .bs-r-price { font-size: 12px; color: #111; font-weight: 600; white-space: nowrap; }
    .bs-rated-side { padding: 56px 44px; background: #F9F9F9; }
    .bs-review { padding: 22px; margin-bottom: 16px; border-left: 2px solid #111; background: #FFFFFF; transition: all 0.3s ease; }
    .bs-review:hover { transform: translateX(6px); }
    .bs-review-txt { font-size: 11px; color: #555; line-height: 1.8; margin-bottom: 12px; font-style: italic; }
    .bs-review-auth { font-size: 8px; letter-spacing: 0.2em; color: #111; text-transform: uppercase; font-weight: 600; opacity: 0.6; }
    .bs-feats { display: grid; grid-template-columns: repeat(4, 1fr); background: #FFFFFF; }
    .bs-feat { padding: 40px 24px; text-align: center; border-right: 1px solid #EDEDED; transition: all 0.3s ease; }
    .bs-feat:last-child { border-right: none; }
    .bs-feat:hover { background: #FBFBFB; transform: translateY(-4px); }
    .bs-feat-icon { width: 48px; height: 48px; border: 1px solid #E0E0E0; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; transition: all 0.3s ease; }
    .bs-feat:hover .bs-feat-icon { border-color: #111; background: #111; }
    .bs-feat:hover .bs-feat-icon svg { stroke: #fff; }
    .bs-feat-icon svg { width: 20px; height: 20px; stroke: #999; fill: none; stroke-width: 1.5; transition: stroke 0.3s ease; }
    .bs-feat-title { font-size: 10px; font-weight: 700; letter-spacing: 0.2em; color: #444; text-transform: uppercase; margin-bottom: 6px; }
    .bs-feat:hover .bs-feat-title { color: #111; }
    .bs-feat-desc { font-size: 9px; color: #BBB; }
    .bs-nl { padding: 64px 32px; background: #111; text-align: center; }
    .bs-nl-title { font-family: 'Cormorant Garamond', serif; font-size: 38px; font-weight: 400; color: #fff; margin-bottom: 12px; }
    .bs-nl-sub { font-size: 10px; color: rgba(255,255,255,0.5); letter-spacing: 0.2em; margin-bottom: 28px; }
    .bs-nl-form { display: flex; max-width: 420px; margin: 0 auto; }
    .bs-nl-input { flex: 1; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-right: none; padding: 14px 18px; font-size: 10px; color: rgba(255,255,255,0.8); font-family: 'Montserrat', sans-serif; outline: none; }
    .bs-nl-input::placeholder { color: rgba(255,255,255,0.3); }
    .bs-nl-btn { padding: 14px 32px; background: #fff; border: none; font-size: 9px; font-weight: 700; letter-spacing: 0.25em; color: #111; text-transform: uppercase; cursor: pointer; transition: all 0.25s ease; }
    .bs-nl-btn:hover { background: #E8E8E8; }
    .bs-footer { display: flex; align-items: center; justify-content: space-between; padding: 24px 48px; background: #FFFFFF; border-top: 1px solid #EDEDED; }
    .bs-footer-logo { font-family: 'Cormorant Garamond', serif; font-size: 16px; font-weight: 400; letter-spacing: 0.15em; color: #AAA; }
    .bs-footer-copy { font-size: 8px; color: #CCC; letter-spacing: 0.15em; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 768px) {
      .bs-hero { grid-template-columns: 1fr; }
      .bs-pgrid { grid-template-columns: repeat(2, 1fr); }
      .bs-rated { grid-template-columns: 1fr; }
      .bs-feats { grid-template-columns: repeat(2, 1fr); }
      .bs-stats { grid-template-columns: repeat(2, 1fr); }
      .bs-about { grid-template-columns: 1fr; }
    }
  `}</style>
);
 
const getImageUrl = (product) => {
  if (!product) return null;
  if (product.image_url) return product.image_url;
  if (product.image) {
    if (product.image.startsWith('http') || product.image.startsWith('/') || product.image.startsWith('data:'))
      return product.image;
    return `http://localhost:8000${product.image}`;
  }
  return null;
};
 
const starStr = (n) => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));
 
/* ─── PRODUCT CARD ─── */
const ProductCard = ({ product, onAddToCart, onToggleWishlist, isInWishlist, isAdding }) => {
  const src = getImageUrl(product);
  return (
    <div className="bs-pcard animate-scale">
      <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
        <div className="bs-pimg">
          <div className="bs-pimg-inner">
            {src ? <img src={src} alt={product.name} /> : <span style={{ fontSize: '8px', color: '#ccc' }}>Image</span>}
          </div>
          {product.discount > 0 && <span className="bs-pbadge">{product.discount}% OFF</span>}
          {/* Wishlist toggle */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWishlist(product.id); }}
            className="bs-pheart"
          >
            {isInWishlist ? '❤️' : '♡'}
          </button>
        </div>
        <div className="bs-pinfo">
          <div className="bs-pstars">{starStr(product.rating || 5)}</div>
          <div className="bs-pname">{product.name}</div>
          <div>
            <span className="bs-pprice">₹{product.price?.toLocaleString()}</span>
            {product.original_price && <span className="bs-pold">₹{product.original_price?.toLocaleString()}</span>}
          </div>
        </div>
      </Link>
      <button onClick={() => onAddToCart(product.id)} disabled={isAdding} className="bs-padd">
        {isAdding ? 'ADDING...' : 'ADD TO CART'}
      </button>
    </div>
  );
};
 
const RatedItem = ({ product, rank }) => {
  const src = getImageUrl(product);
  return (
    <div className="bs-r-item">
      <span className="bs-r-num">{rank < 10 ? `0${rank}` : rank}</span>
      <div className="bs-r-img">{src && <img src={src} alt={product.name} />}</div>
      <div className="bs-r-info">
        <div className="bs-r-name">{product.name}</div>
        <div className="bs-r-stars">{starStr(product.rating || 5)}</div>
        <div className="bs-r-rev">{product.review_count || 500} reviews</div>
      </div>
      <span className="bs-r-price">₹{product.price?.toLocaleString()}</span>
    </div>
  );
};
 
/* ─── MAIN ─── */
const BestSellers = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const [products,     setProducts]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [email,        setEmail]        = useState('');
  const [subscribed,   setSubscribed]   = useState(false);
  const [wishlist,     setWishlist]     = useState(new Set());
  const [,  setWishlistIds]  = useState({});
  const [addingToCart, setAddingToCart] = useState(null);
 
  const fetchProducts = async () => {
    try {
      const res = await productAPI.getAll({ best_sellers: true, limit: 20 });
      setProducts(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
 
  const fetchWishlist = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) { setWishlist(new Set()); setWishlistIds({}); return; }
    try {
      const { wishlistAPI: wAPI } = await import('../services/api');
      const res = await wAPI.getWishlist();
      const wishlistSet = new Set();
      const wishlistMap = {};
      res.data.forEach((item) => {
        const productId = item.product_details?.id || item.product;
        wishlistSet.add(productId);
        wishlistMap[productId] = item.id;
      });
      setWishlist(wishlistSet);
      setWishlistIds(wishlistMap);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };
 
  useEffect(() => {
    fetchProducts();
    fetchWishlist();
  }, []);
 
  const addToCart = async (productId) => {
    const token = localStorage.getItem('access_token');
    if (!token) { toast.error('Please login to add to cart'); navigate('/Login'); return; }
    setAddingToCart(productId);
    try {
      const { cartAPI } = await import('../services/api');
      await cartAPI.addToCart({ product_id: productId, quantity: 1 });
      await refreshCart(dispatch);
      toast.success('Added to cart');
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(null);
    }
  };
 

const toggleWishlist = async (
  productId,
  isInWishlist,
  wishlistId
) => {

  if (isInWishlist) {

    const result = await removeFromWishlistUtil(wishlistId);

    if (result.success) {
      toast.success("Removed from wishlist");
      fetchWishlist();
    } else {
      toast.error(result.message);
    }

  } else {

    const result = await addToWishlistUtil(
      productId,
      navigate
    );

    if (result.success) {
      toast.success("Added to wishlist");
      fetchWishlist();
    } else {
      toast.error(result.message);
    }

  }

};
 
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(''); setTimeout(() => setSubscribed(false), 3000); }
  };
 
  const fallback = [
    { id: 1, name: 'DENIM JACKET',  price: 2499, original_price: 3499, discount: 28, rating: 5, image: 'https://i.pinimg.com/1200x/27/ea/c2/27eac2b4e982614e9dfc988f8d45cacd.jpg' },
    { id: 2, name: 'TOM BOY',       price: 5999, original_price: 8999, discount: 33, rating: 5, image: 'https://i.pinimg.com/736x/ea/84/f4/ea84f4b1bc02cdad15fb1b54c01a8cb2.jpg' },
    { id: 3, name: 'CASUAL DRESS',  price: 1299, original_price: 1999, discount: 35, rating: 5, image: 'https://i.pinimg.com/736x/30/ab/a4/30aba4e8ebd4e8fba0fa2d0f5ff121c3.jpg' },
    { id: 4, name: 'PARTY GOWN',    price: 3299, original_price: 4999, discount: 34, rating: 4, image: 'https://i.pinimg.com/736x/cb/f4/9c/cbf49c8a9181ccd495201a2eb28be1bd.jpg' },
  ];
 
  const p          = products.length > 0 ? products : fallback;
  const mostLoved  = p.slice(0, 4);
  const topRated   = p.slice(0, 4);
 
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '2px solid #111', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );
 
  return (
    <>
      <FontLoader />
      <div className="bs-wrap">
        {/* Hero */}
        <div className="bs-hero">
          <div className="bs-hero-left animate-slideLeft">
            <p className="bs-sec-tag">Our Best Sellers</p>
            <h1 className="bs-hero-title">Loved<br />by Many</h1>
            <p className="bs-hero-sub">Handpicked pieces our community keeps coming back to — timeless, effortless, endlessly wearable.</p>
            <Link to="/Collections" className="bs-hero-btn">Shop Now</Link>
          </div>
          <div className="bs-hero-right">
            <div className="bs-hcell">
              <span className="bs-hcell-badge">No. 1 Bestseller</span>
              <span className="bs-hcell-stars">★★★★★</span>
              <img src="https://i.pinimg.com/736x/57/c3/9b/57c39b283206642be016d0420a8897aa.jpg" alt="Dress" />
              <span className="bs-hcell-label">Dress</span>
            </div>
            <div className="bs-hcell">
              <span className="bs-hcell-badge-ol">Top Rated</span>
              <img src="https://i.pinimg.com/736x/cb/7d/16/cb7d165de29f4aa581f0a42c564acafb.jpg" alt="Jacket" />
              <span className="bs-hcell-label">Jacket</span>
            </div>
            <div className="bs-hcell bs-hcell-wide">
              <span className="bs-hcell-label">Most Loved — New Collection 2026</span>
            </div>
          </div>
        </div>
 
        {/* Stats */}
        <div className="bs-stats">
          {[{ num: '4.9', label: 'Avg Rating', delay: 'delay-1' }, { num: '12k+', label: 'Happy Customers', delay: 'delay-2' }, { num: '280+', label: 'Bestselling Styles', delay: 'delay-3' }, { num: '98%', label: 'Would Recommend', delay: 'delay-4' }].map((stat, i) => (
            <div key={i} className={`bs-stat animate-fadeUp ${stat.delay}`}>
              <div className="bs-stat-num">{stat.num}</div>
              <div className="bs-stat-lbl">{stat.label}</div>
            </div>
          ))}
        </div>
 
        {/* About */}
        <div className="bs-about">
          <div className="bs-about-l animate-slideLeft">
            <p className="bs-sec-tag">About The Brand</p>
            <h2 className="bs-sec-title">Fashion that<br />moves with you</h2>
            <p className="bs-body-txt">Liora was born from a belief that elegance shouldn't come at the cost of comfort. Every piece is thoughtfully crafted — from fabric selection to final stitch.</p>
            <div className="bs-vals">
              <div className="bs-val"><div className="bs-val-dot" /><span className="bs-val-txt">Ethically sourced fabrics</span></div>
              <div className="bs-val"><div className="bs-val-dot" /><span className="bs-val-txt">Slow fashion — quality over quantity</span></div>
              <div className="bs-val"><div className="bs-val-dot" /><span className="bs-val-txt">Designed for real women</span></div>
            </div>
          </div>
          <div className="bs-about-r animate-slideRight">
            <p className="bs-sec-tag">Why We're Loved</p>
            <h2 className="bs-sec-title">Timeless pieces,<br />enduring style</h2>
            <p className="bs-body-txt">Our bestsellers earn their place through repeat purchases and genuine love — not just trends.</p>
            <div className="bs-mini-grid">
              <div className="bs-mini-card hover-lift"><div className="bs-mini-n">48h</div><div className="bs-mini-l">Fast Delivery</div></div>
              <div className="bs-mini-card hover-lift"><div className="bs-mini-n">15d</div><div className="bs-mini-l">Easy Returns</div></div>
            </div>
          </div>
        </div>
 
        {/* Most Loved */}
        <div className="bs-loved">
          <div className="bs-section-hdr">
            <div><p className="bs-sec-tag">Most Loved</p><h2 className="bs-sec-title" style={{ fontSize: 24, marginBottom: 0 }}>Community Favourites</h2></div>
            <Link to="/Collections" className="bs-view-all">View All →</Link>
          </div>
          <div className="bs-pgrid">
            {mostLoved.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                isInWishlist={wishlist.has(product.id)}
                isAdding={addingToCart === product.id}
              />
            ))}
          </div>
        </div>
 
        {/* Top Rated */}
        <div className="bs-rated">
          <div className="bs-rated-list">
            <p className="bs-sec-tag">Top Rated</p>
            <h2 className="bs-sec-title" style={{ fontSize: 24, marginBottom: 24 }}>Rated by Our Community</h2>
            {topRated.map((product, i) => <RatedItem key={product.id} product={product} rank={i + 1} />)}
          </div>
          <div className="bs-rated-side animate-fadeUp delay-2">
            <p className="bs-sec-tag">What They're Saying</p>
            {[
              { text: '"Absolutely in love with this dress. The quality is unmatched and it fits perfectly."', auth: '— Priya M., Verified Buyer' },
              { text: '"Liora pieces never disappoint. This blouse has gotten more compliments than anything else I own."', auth: '— Anika R., Verified Buyer' },
              { text: '"The fabric quality is exceptional. Worth every rupee."', auth: '— Meera S., Verified Buyer' },
            ].map((r, i) => (
              <div key={i} className="bs-review hover-lift">
                <p className="bs-review-txt">{r.text}</p>
                <span className="bs-review-auth">{r.auth}</span>
              </div>
            ))}
          </div>
        </div>
 
        {/* Features */}
        <div className="bs-feats">
          {[{ title: 'Fast Delivery', desc: 'Quick & safe, 48 hours', icon: <>
          <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a1 1 0 0 1 1 1" /><rect width="7" height="5" x="12" y="14" rx="1" /></> }, { title: 'Easy Returns', desc: 'Hassle-free, 15 days', icon: <><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></> }, { title: 'Quality Assured', desc: 'Best fashion, best quality', icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /> }, { title: 'Secure Payment', desc: '100% secure checkout', icon: <><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></> }].map((f, i) => (
            <div key={i} className="bs-feat animate-fadeUp delay-1">
              <div className="bs-feat-icon"><svg viewBox="0 0 24 24">{f.icon}</svg></div>
              <div className="bs-feat-title">{f.title}</div>
              <div className="bs-feat-desc">{f.desc}</div>
            </div>
          ))}
        </div>
 
        {/* Newsletter */}
        <div className="bs-nl">
          <div className="bs-nl-title">Subscribe to Liora</div>
          <div className="bs-nl-sub">Get 15% off your first order</div>
          {subscribed ? (
            <div style={{ color: '#fff', fontSize: '11px' }}>✓ Thanks for subscribing!</div>
          ) : (
            <form className="bs-nl-form" onSubmit={handleSubscribe}>
              <input type="email" className="bs-nl-input" placeholder="Your email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <button type="submit" className="bs-nl-btn">Subscribe</button>
            </form>
          )}
        </div>
 
        {/* Footer */}
        <div className="bs-footer">
          <div className="bs-footer-logo">LIORA</div>
          <div className="bs-footer-copy">© 2026 Liora. All rights reserved.</div>
        </div>
      </div>
    </>
  );
};

export default BestSellers;