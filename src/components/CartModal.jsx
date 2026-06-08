import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartModal({ cart, onClose, onUpdateQuantity, onRemoveItem, onCheckout }) {
  const subtotal = cart.reduce((acc, item) => {
    return acc + (item.product.price * item.quantity);
  }, 0);
  
  const totalGst = cart.reduce((acc, item) => {
    return acc + Math.round(item.product.price * (item.product.gst / 100) * item.quantity);
  }, 0);
  
  const grandTotal = subtotal + totalGst;

  return (
    <div className="product-fullscreen-overlay" style={{ zIndex: 1000, justifyContent: 'flex-end', alignItems: 'stretch' }}>
      {/* Background click to close */}
      <div style={{ position: 'absolute', inset: 0 }} onClick={onClose}></div>

      {/* Slide-out Panel */}
      <div style={{ 
        position: 'relative',
        background: 'var(--black)',
        width: '100%',
        maxWidth: '450px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
        borderLeft: '1px solid var(--border)'
      }}>
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontFamily: 'Playfair Display', color: 'var(--white)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={24} color="var(--gold)" /> My Cart
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--white)', cursor: 'pointer', padding: '4px' }}>
            <X size={24} />
          </button>
        </div>

        {/* Cart Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--muted)', marginTop: '40px' }}>
              <ShoppingBag size={48} style={{ opacity: 0.2, margin: '0 auto 16px', display: 'block' }} />
              <p>Your cart is empty.</p>
              <button onClick={onClose} className="btn-secondary" style={{ marginTop: '20px' }}>
                Continue Shopping
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {cart.map((item) => (
                <div key={item.cartId} style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
                  <img 
                    src={item.product.images?.[0] || "/assets/bat_single.png"} 
                    alt={item.product.name} 
                    style={{ width: '80px', height: '80px', objectFit: 'contain', background: 'var(--dark)', borderRadius: '6px' }}
                    onError={(e) => { e.target.src = "/assets/bat_single.png"; }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ color: 'var(--white)', fontSize: '14px', marginBottom: '4px' }}>{item.product.name}</h4>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px' }}>
                      {item.weight && <span>Weight: {item.weight} | </span>}
                      {item.handle && <span>Handle: {item.handle}</span>}
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ color: 'var(--gold)', fontWeight: 'bold', fontSize: '14px' }}>
                        ₹{item.product.price.toLocaleString('en-IN')}
                      </div>
                      
                      {/* Quantity Controls */}
                      <div style={{ display: 'flex', alignItems: 'center', background: 'var(--dark)', borderRadius: '4px', border: '1px solid var(--border)' }}>
                        <button 
                          onClick={() => onUpdateQuantity(item.cartId, item.quantity - 1)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--white)', width: '28px', height: '28px', cursor: 'pointer' }}
                        >-</button>
                        <span style={{ color: 'var(--white)', fontSize: '13px', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item.cartId, item.quantity + 1)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--white)', width: '28px', height: '28px', cursor: 'pointer' }}
                        >+</button>
                      </div>
                      
                      {/* Remove */}
                      <button 
                        onClick={() => onRemoveItem(item.cartId)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: '4px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Summary */}
        {cart.length > 0 && (
          <div style={{ padding: '24px', background: 'var(--dark)', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: 'var(--muted)' }}>
              <span>Subtotal:</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '14px', color: 'var(--muted)' }}>
              <span>Estimated GST:</span>
              <span>₹{totalGst.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '18px', fontWeight: 'bold', color: 'var(--gold)' }}>
              <span>Total:</span>
              <span>₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
            
            <button 
              onClick={() => {
                onClose();
                onCheckout();
              }}
              className="btn-primary" 
              style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
