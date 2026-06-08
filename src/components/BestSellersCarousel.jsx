import React, { useState, useEffect, useRef } from 'react';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';

export default function BestSellersCarousel({
  products = [],
  categories = [],
  onProductClick,
  wishlist = [],
  onToggleWishlist,
  limit = 4
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const autoPlayRef = useRef();

  // Slice products dynamically based on admin limit configuration
  const displayedProducts = products.slice(0, limit);
  const totalCount = displayedProducts.length;

  // Compute how many slides are visible on screen
  const getVisibleCount = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth <= 768) return 2;
      if (window.innerWidth <= 1024) return 3;
    }
    return 4;
  };

  const [visibleCount, setVisibleCount] = useState(getVisibleCount());

  useEffect(() => {
    const handleResize = () => {
      setVisibleCount(getVisibleCount());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine if carousel scrolling is required
  const isCarousel = totalCount > visibleCount;

  // Duplicate list ONLY if carousel is active to achieve infinite scroll loop
  const listToRender = isCarousel ? [...displayedProducts, ...displayedProducts] : displayedProducts;

  useEffect(() => {
    if (!isCarousel) return;
    autoPlayRef.current = nextSlide;
    const timer = setInterval(() => {
      autoPlayRef.current();
    }, 4500);

    return () => clearInterval(timer);
  }, [currentIndex, totalCount, isCarousel]);

  const nextSlide = () => {
    if (totalCount === 0) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => prev + 2);
  };

  const prevSlide = () => {
    if (totalCount === 0) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => (prev - 2 < 0 ? totalCount - 2 : prev - 2));
  };

  // Listen to transition end to loop around instantly
  const handleTransitionEnd = () => {
    if (currentIndex >= totalCount) {
      setIsTransitioning(false);
      setCurrentIndex(0);
    }
  };

  // Force transition enabled on next render
  useEffect(() => {
    if (!isTransitioning) {
      const t = setTimeout(() => {
        setIsTransitioning(true);
      }, 50);
      return () => clearTimeout(t);
    }
  }, [isTransitioning]);

  const handleWishlistClick = (e, productId) => {
    e.stopPropagation();
    onToggleWishlist(productId);
  };

  if (displayedProducts.length === 0) return null;

  return (
    <section className="best-seller-section">
      <div className="container" style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span className="section-tag">Best Sellers</span>
        <h2 className="section-title" style={{ fontFamily: 'Barlow Condensed', fontSize: '2.5rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--white)' }}>
          Most Demanded Weapons
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '12px', maxWidth: '600px', margin: '12px auto 0' }}>
          Our absolute bestsellers, pressed under high-ton rollings for instant feedback and massive sweet spots.
        </p>
      </div>

      <div className="carousel-outer-wrapper">
        {/* Navigation arrows (Only if Carousel is active) */}
        {isCarousel && (
          <button className="carousel-arrow prev animate-hover" onClick={prevSlide} aria-label="Previous Products">
            <ChevronLeft size={20} />
          </button>
        )}

        <div className="carousel-container">
          <div
            className="carousel-track"
            onTransitionEnd={handleTransitionEnd}
            style={{
              display: 'flex',
              justifyContent: isCarousel ? 'flex-start' : 'center',
              gap: isCarousel ? '0px' : '20px',
              transform: isCarousel ? `translateX(-${currentIndex * (100 / visibleCount)}%)` : 'none',
              transition: (isCarousel && isTransitioning) ? 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)' : 'none',
              width: isCarousel ? `${(listToRender.length / visibleCount) * 100}%` : '100%'
            }}
          >
            {listToRender.map((product, idx) => {
              const isWishlisted = wishlist.includes(product.id);
              const coverImage = product.images?.[0] || "/assets/bat_single.png";
              const uniqueKey = `${product.id}-carousel-${idx}`;

              const discount = product.bestSeller ? 25 : 20;
              const originalPrice = Math.round(product.price / (1 - discount / 100));

              return (
                <div
                  key={uniqueKey}
                  className="carousel-slide"
                  style={{
                    width: isCarousel ? `${100 / listToRender.length}%` : 'auto',
                    flex: isCarousel ? `0 0 ${100 / visibleCount}%` : '0 1 280px',
                    maxWidth: '280px'
                  }}
                >
                  <div
                    className="product-card glow-hover pulse-border-hover"
                    onClick={() => onProductClick(product)}
                    style={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '20px 18px',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      height: '100%',
                      transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
                    }}
                  >
                     {/* Media container */}
                    <div className="card-image-wrapper" style={{ width: '100%', aspectRatio: '1', background: 'var(--card-image-bg)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      <span style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        zIndex: 10,
                        background: 'var(--red)',
                        color: '#fff',
                        fontSize: '10px',
                        fontWeight: '700',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        boxShadow: '0 2px 6px rgba(227, 27, 35, 0.2)'
                      }}>
                        -{discount}%
                      </span>

                      <button
                        onClick={(e) => handleWishlistClick(e, product.id)}
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          zIndex: 10,
                          background: 'rgba(255, 255, 255, 0.08)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                      >
                        <Heart size={15} fill={isWishlisted ? "var(--gold)" : "none"} color={isWishlisted ? "var(--gold)" : "var(--white)"} />
                      </button>

                      <img
                        className="card-image"
                        src={coverImage}
                        alt={product.name}
                        onError={(e) => { e.target.src = "/assets/bat_single.png"; }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                      />
                    </div>

                    {/* Details */}
                    <div style={{ width: '100%', marginTop: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <h3 style={{
                        fontSize: '13px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        color: 'var(--white)',
                        marginBottom: '8px',
                        fontFamily: 'Barlow',
                        minHeight: '36px',
                        lineHeight: '1.4',
                        textAlign: 'center'
                      }}>
                        {product.name}
                      </h3>

                      <div style={{ display: 'flex', alignItems: 'baseline', justify: 'center', gap: '8px', marginBottom: '16px' }}>
                        <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--gold)' }}>
                          ₹{product.price.toLocaleString('en-IN')}.00
                        </span>
                        <span style={{ fontSize: '13px', color: 'var(--muted)', textDecoration: 'line-through' }}>
                          ₹{originalPrice.toLocaleString('en-IN')}.00
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '20px' }}>
                        <span style={{ fontSize: '10px', color: 'var(--muted)', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border)', padding: '3px 8px', borderRadius: '4px' }}>
                          {product.weight}
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--muted)', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border)', padding: '3px 8px', borderRadius: '4px' }}>
                          {product.grade.split(' ')[0]} Grade
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onProductClick(product);
                        }}
                        style={{
                          width: '90%',
                          background: 'transparent',
                          border: '1px solid var(--border)',
                          color: 'var(--white)',
                          padding: '9px 18px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, var(--gold), var(--gold2))';
                          e.currentTarget.style.color = '#000';
                          e.currentTarget.style.borderColor = 'var(--gold)';
                          e.currentTarget.style.boxShadow = '0 0 15px rgba(212,175,55,0.3)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'var(--white)';
                          e.currentTarget.style.borderColor = 'var(--border)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation arrows (Only if Carousel is active) */}
        {isCarousel && (
          <button className="carousel-arrow next animate-hover" onClick={nextSlide} aria-label="Next Products">
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </section>
  );
}
