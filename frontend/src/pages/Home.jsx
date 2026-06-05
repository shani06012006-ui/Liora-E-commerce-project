import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../services/api';


import {
  TruckIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  ChevronRightIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
 
/* ─────────────────────────────────────────
   HERO
───────────────────────────────────────── */
const Hero = () => (
  <div className="relative h-screen w-full overflow-hidden bg-white">
    <div className="absolute inset-0 flex justify-center items-center">
      <img
        src="Liora.png"
        alt="Liora Hero"
        className="h-full w-full object-contain"
      />
    </div>
 
    {/* Left Top Text */}
    <div className="absolute left-16 top-32 z-20">
      <p className="text-xs uppercase tracking-[0.35em] text-black/70 leading-6">
        Fashion
        <br />
        That Moves
        <br />
        With You.
      </p>
    </div>
 
    {/* Bottom Right Text */}
    <div className="absolute right-16 bottom-24 z-20 text-right">
      <p className="text-xs uppercase tracking-[0.35em] text-black/70 leading-6">
        New
        <br />
        Collection
        <br />
        2026
      </p>
    </div>
 
    {/* Scroll Indicator */}
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
      <svg className="w-5 h-5 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </div>
  </div>
);
 
/* ─────────────────────────────────────────
   CATEGORY STRIP  (GAZU-style)
   Black bg · small square thumb left · text right
   Three equal columns with dividers
───────────────────────────────────────── */
const CategorySection = () => {
  const categories = [
    {
      name: 'NEW ARRIVALS',
      shopLabel: 'SHOP NEW ARRIVALS',
      desc: 'Fresh drops, every season.',
      image: 'oo.jpg ',
      link: '/new-arrivals',
    },
    {
      name: 'COLLECTIONS',
      shopLabel: 'SHOP COLLECTIONS',
      desc: 'Curated for every you.',
      image: 'o.jpg',
      link: '/collections',
    },
    {
      name: 'SIGNATURE STYLES',
      shopLabel: 'SHOP SIGNATURE',
      desc: 'Timeless. Effortlessly iconic.',
      image: 'ooo.jpg',
      link: '/signature',
    },
  ];
 
  return (
    <div style={{ background: '#0a0a0a' }} className="w-full">
      <div className="flex divide-x divide-white/10">
        {categories.map((cat, idx) => (
          <Link
            key={idx}
            to={cat.link}
            className="flex-1 flex items-center gap-5 px-8 py-7 group transition-colors hover:bg-white/5"
            style={{ textDecoration: 'none' }}
          >
            {/* Small square thumbnail */}
            <div className="flex-shrink-0 w-[90px] h-[110px] overflow-hidden">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
              />
            </div>
 
            {/* Text block */}
            <div>
              <p
                className="text-white font-semibold mb-1"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: '13px',
                  letterSpacing: '0.12em',
                }}
              >
                {cat.name}
              </p>
              <p
                className="text-white/55 mb-4 leading-snug"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: '11px',
                  letterSpacing: '0.04em',
                }}
              >
                {cat.desc}
              </p>
              <span
                className="inline-flex items-center gap-1 text-white/70 group-hover:text-white transition-colors border-b border-white/30 group-hover:border-white pb-[2px]"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: '10px',
                  letterSpacing: '0.15em',
                }}
              >
                {cat.shopLabel} →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
 
/* ─────────────────────────────────────────
   NEW SEASON BANNER  (GAZU-style)
   Light grey bg · big bold heading left ·
   model photo filling right half
───────────────────────────────────────── */
const NewSeasonBanner = () => (
  <div
    className="relative w-full overflow-hidden"
    style={{ background: '#e8e5e0', minHeight: '520px' }}
  >
    {/* Background model image fills right side */}
    <div className="absolute inset-0">
      <img
        src="1.jpg"
        alt="New Season"
        className="w-full h-full object-cover object-center"
        style={{ filter: 'grayscale(30%)' }}
      />
      {/* Left fade so text is readable */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to right, #e8e5e0 38%, transparent 70%)',
        }}
      />
    </div>
 
    {/* Text content — left aligned */}
    <div className="relative z-10 flex flex-col justify-center h-full px-16 py-20"
         style={{ minHeight: '520px' }}>
      <p
        className="uppercase text-black/50 mb-3"
        style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: '11px',
          letterSpacing: '0.3em',
        }}
      >
        NEW SEASON
      </p>
      <h2
        className="text-black leading-none mb-5"
        style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: 'clamp(56px, 8vw, 100px)',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          lineHeight: 0.9,
        }}
      >
        NEW
        <br />
        VIBES
      </h2>
      <p
        className="text-black/60 mb-8 max-w-xs"
        style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: '13px',
          letterSpacing: '0.04em',
        }}
      >
        Discover everything new and now.
      </p>
      <Link
        to="/new-arrivals"
        className="inline-block w-fit"
        style={{
          background: '#111',
          color: '#fff',
          fontFamily: "'Montserrat', sans-serif",
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.2em',
          padding: '14px 28px',
          textDecoration: 'none',
          transition: 'background 0.2s',
        }}
        onMouseOver={e => (e.currentTarget.style.background = '#333')}
        onMouseOut={e => (e.currentTarget.style.background = '#111')}
      >
        EXPLORE COLLECTION
      </Link>
    </div>
  </div>
);
 
/* ─────────────────────────────────────────
   FEATURES STRIP
───────────────────────────────────────── */
const FeaturesSection = () => {
  const features = [
    { icon: TruckIcon,       title: 'FAST DELIVERY',   description: 'Quick & safe delivery' },
    { icon: ArrowPathIcon,   title: 'EASY RETURNS',    description: 'Within 15 days' },
    { icon: ShieldCheckIcon, title: 'QUALITY ASSURED', description: 'Best fashion, best quality' },
    { icon: CreditCardIcon,  title: 'SECURE PAYMENT',  description: '100% secure checkout' },
  ];
 
  return (
    <div className="py-12 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((f, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100">
                <f.icon className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h3
                  className="text-gray-900 mb-0.5"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                  }}
                >
                  {f.title}
                </h3>
                <p
                  className="text-gray-400"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: '10px',
                  }}
                >
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
 
/* ─────────────────────────────────────────
   PRODUCT GRID
───────────────────────────────────────── */
// Product Section
const ProductSection = ({ title, subtitle, link, products }) => {
  const getImageUrl = (product) => {
    // First check if it's a fallback product with direct image URL
    if (product.image && (product.image.startsWith('http://') || product.image.startsWith('https://'))) {
      return product.image;
    }
    // Check for image_url from API
    if (product?.image_url) return product.image_url;
    // Check for image from API
    if (product?.image) return `http://localhost:8000${product.image}`;
    // Return placeholder if nothing works
    return 'https://placehold.co/400x500/e0e0e0/2D2D2D?text=Product';
  };

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-gray-900 mb-1 text-3xl md:text-4xl font-serif">{title}</h2>
            <p className="text-gray-400 text-xs uppercase tracking-[0.25em]">{subtitle}</p>
          </div>
          <Link to={link} className="flex items-center gap-1 text-gray-500 hover:text-gray-900 text-xs uppercase tracking-[0.2em]">
            VIEW ALL <ChevronRightIcon className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => (
            <div key={product.id} className="group">
              <Link to={`/product/${product.id}`}>
                <div className="relative overflow-hidden bg-gray-100 aspect-[3/4]">
                  <img 
                    src={getImageUrl(product)} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  {product.discount > 0 && (
                    <span className="absolute top-3 left-3 bg-black text-white px-2 py-1 text-[9px] tracking-wide">
                      {product.discount}% OFF
                    </span>
                  )}
                  <button className="absolute top-3 right-3 bg-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <HeartIcon className="w-3.5 h-3.5 text-gray-700" />
                  </button>
                </div>
              </Link>
              <div className="mt-3">
                <Link to={`/product/${product.id}`}>
                  <h3 className="text-gray-800 hover:text-gray-500 text-xs font-medium tracking-wide line-clamp-1">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-gray-900 font-semibold text-xs">₹{product.price}</p>
                  {product.original_price && (
                    <p className="text-gray-400 line-through text-xs">₹{product.original_price}</p>
                  )}
                </div>
                <button className="mt-3 w-full py-2 border border-gray-200 text-gray-700 hover:bg-black hover:text-white hover:border-black text-[9px] font-semibold tracking-[0.2em] transition-all">
                  ADD TO CART
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
 
/* ─────────────────────────────────────────
   NEWSLETTER
───────────────────────────────────────── */
const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
 
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail('');
    }
  };
 
  return (
    <div className="py-20 bg-black">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <p
          className="text-white/40 mb-3 uppercase tracking-widest"
          style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', letterSpacing: '0.35em' }}
        >
          EXCLUSIVE ACCESS
        </p>
        <h2
          className="text-white mb-3"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 300,
            letterSpacing: '0.05em',
          }}
        >
          Join Our Community
        </h2>
        <p
          className="text-white/50 mb-10"
          style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '12px', letterSpacing: '0.05em' }}
        >
          Subscribe and get 15% off your first order
        </p>
 
        {subscribed ? (
          <div
            className="text-white/80 py-4 border border-white/20 px-8 inline-block"
            style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '11px', letterSpacing: '0.1em' }}
          >
            Thank you — your discount code is on its way.
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex gap-0 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-4 py-3 bg-white/5 border border-white/20 border-r-0 text-white placeholder-white/30 focus:outline-none focus:border-white/50"
              style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '11px', letterSpacing: '0.05em' }}
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white text-black font-semibold hover:bg-white/90 transition-colors"
              style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '10px', letterSpacing: '0.2em' }}
            >
              SUBSCRIBE
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
 
/* ─────────────────────────────────────────
   HOME PAGE
───────────────────────────────────────── */
const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    fetchProducts();
  }, []);
 
  const fetchProducts = async () => {
    try {
      const res = await productAPI.getAll({ limit: 8 });
      const products = res.data;
      setFeaturedProducts(products.slice(0, 4));
      setNewArrivals(products.slice(4, 8));
    } catch (error) {
      console.error('Error fetching products:', error);
    }
    setLoading(false);
  };
 
  const fallbackProducts = [
  {
    id: 1,
    name: 'Jacket',
    price: 2499,
    original_price: 3499,
    discount: 28,
    image: 'https://i.pinimg.com/1200x/27/ea/c2/27eac2b4e982614e9dfc988f8d45cacd.jpg'
  },
  {
    id: 2,
    name: 'Joggers ',
    price: 5999,
    original_price: 8999,
    discount: 33,
    image:'https://i.pinimg.com/736x/74/d2/0a/74d20ab68e3d1b9552d1d6509055e351.jpg'
  },
  {
    id: 3,
    name: 'Office Wear',
    price: 1299,
    original_price: 1999,
    discount: 35,
    image: 'https://i.pinimg.com/1200x/23/74/5d/23745d46473b0a11655a093dcdc85ce5.jpg'
  },
  {
    id: 4,
    name: 'Cargo Pants',
    price: 2999,
    original_price: 3999,
    discount: 34,
    image: 'https://i.pinimg.com/736x/f9/0f/81/f90f81779a5afc0780ec6287b143aff1.jpg'
  }
];
 
  const displayProducts    = featuredProducts.length  > 0 ? featuredProducts  : fallbackProducts;
  const displayNewArrivals = newArrivals.length        > 0 ? newArrivals        : fallbackProducts;
 
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b border-gray-900 mx-auto" />
      </div>
    );
  }
 
  return (
    <main>
      {/* 1 ─ Hero */}
      <Hero />
 
      {/* 2 ─ Category strip — black bg, small thumbs, GAZU style */}
      <CategorySection />

       {/* 3 ─ New season banner */}
      <NewSeasonBanner />
 
      {/* 4 ─ Best of Liora products */}
      <ProductSection
        title="Best of Liora"
        subtitle="Editor's Picks"
        link="/best-sellers"
        products={displayProducts}
      />
 
      {/* 6 ─ Features strip */}
      <FeaturesSection />
 
      {/* 7 ─ Newsletter */}
      <NewsletterSection />
 
    </main>
  );
};
 
export default Home;