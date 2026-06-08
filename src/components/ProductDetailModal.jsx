import React, { useState, useEffect } from 'react';
import { X, Send, MessageCircle, Info, CheckCircle2, Heart, Play, ThumbsUp, ThumbsDown, ShoppingBag } from 'lucide-react';
import { db } from '../data/db';

export default function ProductDetailModal({
  product,
  onClose,
  categories,
  onNewLead,
  wishlist = [],
  onToggleWishlist,
  allProducts = [],
  onProductClick,
  onAddToCart
}) {
  const [activeMediaIdx, setActiveMediaIdx] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: 'center center', transform: 'scale(1)' });
  
  // Variant states
  const [selectedWeight, setSelectedWeight] = useState('');
  const [selectedHandle, setSelectedHandle] = useState('');

  // Spec callback form states
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', note: '' });
  const [submitted, setSubmitted] = useState(false);
  const [showOverview, setShowOverview] = useState(false);

  // Review states
  const [productReviews, setProductReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ userName: '', rating: 5, comment: '' });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Load product reviews and set default variant values
  useEffect(() => {
    if (product) {
      setActiveMediaIdx(0);
      setSubmitted(false);
      setShowOverview(false);
      setReviewSubmitted(false);
      setFormData({ name: '', phone: '', email: '', note: '' });
      setReviewForm({ userName: '', rating: 5, comment: '' });
      
      const w = product.variants?.weights?.[0] || product.weight || '';
      const h = product.variants?.handles?.[0] || (product.specs?.handle) || '';
      setSelectedWeight(w);
      setSelectedHandle(h);

      // Load reviews
      loadReviews();
    }
  }, [product]);

  const loadReviews = () => {
    if (product) {
      setProductReviews(db.getProductReviews(product.id));
    }
  };

  if (!product) return null;

  const getCategoryName = (catId) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.name : 'Cricket Bat';
  };

  // Magnifying Glass Zoom logic
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.8)'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ transformOrigin: 'center center', transform: 'scale(1)' });
  };

  const handleFormProceed = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert("Please provide Name and Contact Number!");
      return;
    }
    setShowOverview(true);
  };

  // Callback Spec Logger Submit
  const handleFormSubmit = () => {
    const specNote = `Weight: ${selectedWeight}, Handle: ${selectedHandle}. Notes: ${formData.note || 'None'}`;
    const lead = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: `Inquiry for bat: ${product.name}. Specs Selected - ${specNote}`,
      type: "Product Page Detail Request",
      status: "New"
    };
    db.addLead(lead);

    const priceWithGst = Math.round(product.price * (1 + product.gst / 100));
    const gstAmt = Math.round(product.price * (product.gst / 100));
    const order = {
      customerName: formData.name,
      email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      phone: formData.phone,
      batName: product.name,
      price: product.price,
      gst: gstAmt,
      total: priceWithGst,
      status: "pending",
      specs: specNote
    };
    db.createOrder(order);

    // Directly open WhatsApp on submit
    const whatsappNum = "919558943199"; // contactWhatsapp / Shailesh Bhai
    const text = `Hello Vishwakarma Bat House,\n\nI want to place an order with custom specifications:\n\n*Customer Name*: ${formData.name}\n*Phone*: ${formData.phone}\n*Email*: ${formData.email || 'N/A'}\n\n*Product Name*: ${product.name}\n*Weight*: ${selectedWeight}\n*Handle*: ${selectedHandle}\n*Additional Notes*: ${formData.note || 'None'}\n\n*Price*: ₹${product.price}\n*GST (${product.gst}%)*: ₹${gstAmt}\n*Total*: ₹${priceWithGst}\n\nPlease confirm availability and details. Thank you!`;
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${whatsappNum}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');

    setSubmitted(true);
    setShowOverview(false);
    if (onNewLead) onNewLead();
  };

  // Review Submit
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewForm.userName || !reviewForm.comment) {
      alert("Name and comment are required to submit a review!");
      return;
    }

    db.addReview(product.id, reviewForm);
    setReviewSubmitted(true);
    setReviewForm({ userName: '', rating: 5, comment: '' });
    // Alert the user that the review was submitted for admin review
    alert("Review submitted! It will appear on the site once moderated by the VK Administrator.");
  };

  // Review Voting
  const handleVoteReview = (reviewId, type) => {
    db.voteReview(reviewId, type);
    loadReviews();
  };

  const mediaList = [...(product.images || [])];
  const hasVideo = product.videoUrl && product.videoUrl.trim() !== "";
  if (hasVideo) {
    mediaList.push({ type: 'video', url: product.videoUrl });
  }

  const isCurrentMediaVideo = typeof mediaList[activeMediaIdx] === 'object' && mediaList[activeMediaIdx]?.type === 'video';
  const isWishlisted = wishlist.includes(product.id);
  
  const whatsappNumber = "919274543199";
  const specText = `*Selected Specifications*:\n- Weight Range: ${selectedWeight}\n- Handle Shape: ${selectedHandle}`;
  const whatsappText = encodeURIComponent(
    `Hello Vishwakarma Bat House,\n\nI want to order: *${product.name}*\nCategory: ${getCategoryName(product.category)}\nPrice: ₹${product.price} (+${product.gst}% GST)\n\n${specText}\n\nPlease confirm availability and let me know payment/delivery details!`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappText}`;

  // Related Products
  const relatedProducts = (allProducts || [])
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="product-fullscreen-overlay">
      {/* Close Overlay Button */}
      <button className="product-fullscreen-close" onClick={onClose} aria-label="Close Product Details Page">
        <X size={20} />
      </button>

      <div className="product-fullscreen-container">
        {/* Main Product Panel */}
        <div className="product-detail-grid">
          
          {/* Left Column: Gallery & Zoom */}
          <div className="gallery-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              className="main-image-view zoom-wrapper"
              onMouseMove={!isCurrentMediaVideo ? handleMouseMove : undefined}
              onMouseLeave={!isCurrentMediaVideo ? handleMouseLeave : undefined}
              style={{
                borderRadius: '8px',
                background: 'var(--dark)',
                height: '480px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
                border: '1px solid var(--border)'
              }}
            >
              {isCurrentMediaVideo ? (
                <video
                  src={mediaList[activeMediaIdx].url}
                  controls
                  autoPlay
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <img
                  src={mediaList[activeMediaIdx] || "/assets/bat_single.png"}
                  alt={product.name}
                  className="zoom-image"
                  style={{
                    maxWidth: '90%',
                    maxHeight: '90%',
                    objectFit: 'contain',
                    transition: 'transform 0.1s ease-out',
                    ...zoomStyle
                  }}
                  onError={(e) => { e.target.src = "/assets/bat_single.png"; }}
                />
              )}
            </div>
            
            {/* Thumbnails */}
            <div className="gallery-thumbs" style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '4px 0' }}>
              {mediaList.map((item, idx) => {
                const isVideoType = typeof item === 'object' && item?.type === 'video';
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveMediaIdx(idx)}
                    className={`thumb-btn ${activeMediaIdx === idx ? 'active' : ''}`}
                    style={{
                      borderRadius: '4px',
                      width: '72px',
                      height: '72px',
                      flexShrink: 0,
                      border: activeMediaIdx === idx ? '2px solid var(--gold)' : '1px solid var(--border)',
                      background: 'var(--dark)',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      cursor: 'pointer'
                    }}
                  >
                    {isVideoType ? (
                      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Play size={18} color="var(--gold)" style={{ zIndex: 2 }} />
                        <span style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }}></span>
                      </div>
                    ) : (
                      <img
                        src={item || "/assets/bat_single.png"}
                        alt="thumbnail"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={(e) => { e.target.src = "/assets/bat_single.png"; }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Spec sheet & checkout options */}
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="badge badge-gold" style={{ background: 'var(--gold)', color: '#fff' }}>
                {getCategoryName(product.category)}
              </span>
              
              {onToggleWishlist && (
                <button
                  onClick={() => onToggleWishlist(product.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: isWishlisted ? 'var(--gold)' : 'var(--muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                >
                  <Heart size={18} fill={isWishlisted ? "var(--gold)" : "none"} color="var(--gold)" />
                  {isWishlisted ? 'Saved' : 'Add to Wishlist'}
                </button>
              )}
            </div>

            <h1 style={{ fontSize: '2.5rem', color: 'var(--white)', fontFamily: 'Playfair Display', marginBottom: '8px', textTransform: 'none', fontWeight: 900, lineHeight: 1.15 }}>
              {product.name}
            </h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div className="stars" style={{ margin: 0, color: 'var(--gold)', fontSize: '15px' }}>★★★★★</div>
              <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>(5.0 rating based on player comments)</span>
            </div>

            <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--gold)', marginBottom: '24px', letterSpacing: '-0.5px' }}>
              ₹{product.price.toLocaleString('en-IN')}
              <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: '400', marginLeft: '12px' }}>
                + {product.gst}% GST (Exclusive of taxes)
              </span>
            </div>

            {/* VARIANTS SELECTORS */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {product.variants?.weights && product.variants.weights.length > 0 && (
                <div style={{ flex: 1, minWidth: '150px' }}>
                  <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', color: 'var(--muted)' }}>Select Weight</label>
                  <select
                    className="form-control"
                    value={selectedWeight}
                    onChange={(e) => setSelectedWeight(e.target.value)}
                    style={{ padding: '12px', fontSize: '14px', background: 'var(--dark)', border: '1px solid var(--border)', color: 'var(--white)', width: '100%', outline: 'none' }}
                  >
                    {product.variants.weights.map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
              )}

              {product.variants?.handles && product.variants.handles.length > 0 && (
                <div style={{ flex: 1, minWidth: '150px' }}>
                  <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', color: 'var(--muted)' }}>Handle Type</label>
                  <select
                    className="form-control"
                    value={selectedHandle}
                    onChange={(e) => setSelectedHandle(e.target.value)}
                    style={{ padding: '12px', fontSize: '14px', background: 'var(--dark)', border: '1px solid var(--border)', color: 'var(--white)', width: '100%', outline: 'none' }}
                  >
                    {product.variants.handles.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Specifications Sheet */}
            <h3 style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--white)', borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '14px', fontWeight: 700 }}>
              Specifications Sheet
            </h3>
            <table className="specs-table" style={{ margin: '0 0 30px', width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                  <th style={{ padding: '10px 0', fontSize: '14px', color: 'var(--muted)', width: '35%', textAlign: 'left', fontWeight: 500 }}>Willow Grade</th>
                  <td style={{ padding: '10px 0', fontSize: '14px', color: 'var(--white)' }}>{product.grade}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                  <th style={{ padding: '10px 0', fontSize: '14px', color: 'var(--muted)', textAlign: 'left', fontWeight: 500 }}>Edges & Spine</th>
                  <td style={{ padding: '10px 0', fontSize: '14px', color: 'var(--white)' }}>{product.specs?.edges || "40mm"} edges / {product.specs?.spine || "62mm"} spine</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                  <th style={{ padding: '10px 0', fontSize: '14px', color: 'var(--muted)', textAlign: 'left', fontWeight: 500 }}>Handle Cane</th>
                  <td style={{ padding: '10px 0', fontSize: '14px', color: 'var(--white)' }}>{product.specs?.handle || "Singapore Cane"}</td>
                </tr>
                <tr>
                  <th style={{ padding: '10px 0', fontSize: '14px', color: 'var(--muted)', textAlign: 'left', fontWeight: 500 }}>Sweetspot</th>
                  <td style={{ padding: '10px 0', fontSize: '14px', color: 'var(--white)' }}>{product.specs?.sweetspot || "Mid Sweetspot"}</td>
                </tr>
              </tbody>
            </table>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    if (onAddToCart) onAddToCart(product, selectedWeight, selectedHandle, 1);
                  }}
                  className="btn-outline"
                  style={{ flex: 1, padding: '16px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}
                >
                  <ShoppingBag size={18} /> Add to Cart
                </button>
                <button
                  onClick={() => {
                    if (onAddToCart) onAddToCart(product, selectedWeight, selectedHandle, 1);
                  }}
                  className="btn-primary"
                  style={{ flex: 1, padding: '16px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}
                >
                  Buy Now
                </button>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ textTransform: 'uppercase', letterSpacing: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', fontWeight: 'bold', width: '100%', border: '1px solid var(--border)', color: 'var(--muted)' }}
                onMouseOver={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--gold)'; }}
                onMouseOut={(e) => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <MessageCircle size={16} /> Order via WhatsApp (Alternative)
              </a>
            </div>
          </div>
        </div>

        {/* Product Specific Reviews Section */}
        <div className="reviews-container">
          <div className="reviews-header">
            <div>
              <h2 style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem', color: 'var(--white)', marginBottom: '4px' }}>Player Reviews & Comments</h2>
              <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Genuine feedback and ratings from league players.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--white)' }}>5.0</span>
              <div>
                <div className="review-stars">★★★★★</div>
                <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{productReviews.length} comments</span>
              </div>
            </div>
          </div>

          <div className="reviews-grid-details">
            {/* Reviews List */}
            <div>
              {productReviews.length === 0 ? (
                <div style={{ padding: '40px 20px', border: '1px dashed var(--border)', textAlign: 'center', color: 'var(--muted)' }}>
                  No approved reviews yet for this bat. Be the first to leave a comment!
                </div>
              ) : (
                productReviews.map(rev => (
                  <div key={rev.id} className="review-card-item">
                    <div className="review-card-top">
                      <div className="review-card-user">
                        <div className="review-user-avatar">{rev.userName.charAt(0).toUpperCase()}</div>
                        <div>
                          <strong style={{ color: 'var(--white)', fontSize: '14px', display: 'block' }}>{rev.userName}</strong>
                          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{rev.date}</span>
                        </div>
                      </div>
                      <div className="review-stars">{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</div>
                    </div>
                    <p className="review-card-comment">{rev.comment}</p>
                    <div className="review-card-actions">
                      <button onClick={() => handleVoteReview(rev.id, 'like')} className="review-action-btn">
                        <ThumbsUp size={12} /> Like ({rev.likes})
                      </button>
                      <button onClick={() => handleVoteReview(rev.id, 'dislike')} className="review-action-btn">
                        <ThumbsDown size={12} /> Dislike ({rev.dislikes})
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Write a Review Form */}
            <div style={{ background: 'var(--dark)', border: '1px solid var(--border)', padding: '30px 24px', borderRadius: '6px' }}>
              <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--white)', marginBottom: '20px', fontWeight: '700' }}>
                Write a Review
              </h3>
              <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', color: 'var(--muted)', display: 'block' }}>Your Name *</label>
                  <input
                    type="text"
                    value={reviewForm.userName}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, userName: e.target.value }))}
                    placeholder="e.g. Rahul Patel"
                    style={{ width: '100%', padding: '12px', background: 'var(--black)', border: '1px solid var(--border)', color: 'var(--white)', fontSize: '13px', outline: 'none' }}
                    required
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', color: 'var(--muted)', display: 'block' }}>Rating *</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: star <= reviewForm.rating ? 'var(--gold)' : 'var(--border)',
                          fontSize: '24px',
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', color: 'var(--muted)', display: 'block' }}>Your Feedback *</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="Share your experience with the ping, balance, pickup, or grain alignment..."
                    style={{ width: '100%', padding: '12px', background: 'var(--black)', border: '1px solid var(--border)', color: 'var(--white)', fontSize: '13px', minHeight: '80px', outline: 'none' }}
                    required
                  />
                </div>

                <button type="submit" className="btn-secondary" style={{ width: '100%', padding: '12px', fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: '700' }}>
                  Submit Review
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Product Q&A Section */}
        <div className="reviews-container" style={{ marginTop: '40px', borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
          <div className="reviews-header" style={{ marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem', color: 'var(--white)', marginBottom: '4px' }}>Product Q&As</h2>
              <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Got questions? Get answers directly from VK workshops.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px', textAlign: 'left' }}>
            
            {/* Q&A List */}
            <div>
              {db.getQA().filter(q => q.productId === product.id).length === 0 ? (
                <div style={{ padding: '40px 20px', border: '1px dashed var(--border)', textAlign: 'center', color: 'var(--muted)' }}>
                  No questions asked about this bat yet. Feel free to ask a question!
                </div>
              ) : (
                db.getQA().filter(q => q.productId === product.id).map(q => (
                  <div key={q.id} style={{
                    padding: '20px',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    marginBottom: '16px',
                    background: 'var(--dark)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--gold)' }}>
                      <strong>Q: Asked by {q.user}</strong>
                      <span>{q.date}</span>
                    </div>
                    <p style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px' }}>{q.question}</p>
                    
                    {q.answer ? (
                      <div style={{ borderLeft: '2px solid var(--gold)', paddingLeft: '12px', marginTop: '10px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Answer from VK Craftsman:</span>
                        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>{q.answer}</p>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontStyle: 'italic' }}>Pending answer from workshop...</span>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Ask a Question Form */}
            <div style={{ background: 'var(--dark)', border: '1px solid var(--border)', padding: '30px 24px', borderRadius: '6px', alignSelf: 'flex-start' }}>
              <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--white)', marginBottom: '20px', fontWeight: '700' }}>
                Ask a Question
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const qText = e.target.questionText.value.trim();
                const qUser = e.target.questionUser.value.trim() || 'Guest Player';
                if (!qText) {
                  alert("Question cannot be empty!");
                  return;
                }
                db.addQA(product.id, qText, qUser);
                alert("Question submitted to VK workshops! It will appear once answered by our craftsmen.");
                e.target.reset();
                onClose(); // Close the modal to refresh database and show feedback
              }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', color: 'var(--muted)', display: 'block' }}>Your Name</label>
                  <input
                    type="text"
                    name="questionUser"
                    placeholder="e.g. Kunal G."
                    style={{ width: '100%', padding: '12px', background: 'var(--black)', border: '1px solid var(--border)', color: 'var(--white)', fontSize: '13px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', color: 'var(--muted)', display: 'block' }}>Your Question *</label>
                  <textarea
                    name="questionText"
                    placeholder="Ask about handle shock absorption, custom weights, linseed oiling, grains, etc..."
                    style={{ width: '100%', padding: '12px', background: 'var(--black)', border: '1px solid var(--border)', color: 'var(--white)', fontSize: '13px', minHeight: '80px', outline: 'none' }}
                    required
                  />
                </div>

                <button type="submit" className="btn-secondary" style={{ width: '100%', padding: '12px', fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: '700' }}>
                  Submit Question
                </button>
              </form>
            </div>

          </div>
        </div>

        {/* Similar Weapons Grid */}
        {relatedProducts.length > 0 && (
          <div className="related-products-section" style={{ marginTop: '60px', borderTop: '1px solid var(--border)', paddingTop: '40px', textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.8rem', color: 'var(--white)', marginBottom: '30px', fontFamily: 'Playfair Display' }}>
              Similar Weapons
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              {relatedProducts.map(rel => (
                <div
                  key={rel.id}
                  onClick={() => {
                    onProductClick(rel);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{
                    background: 'var(--dark)',
                    border: '1px solid var(--border)',
                    padding: '24px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--gold)'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <img
                    src={rel.images?.[0] || "/assets/bat_single.png"}
                    alt={rel.name}
                    style={{ height: '180px', objectFit: 'contain', marginBottom: '16px' }}
                    onError={(e) => { e.target.src = "/assets/bat_single.png"; }}
                  />
                  <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--white)', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rel.name}</h4>
                  <div style={{ fontSize: '14px', color: 'var(--gold)', fontWeight: 800 }}>₹{rel.price.toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

