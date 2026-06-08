import React, { useState } from 'react';
import { db } from '../data/db';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CheckoutView({ cart, onBackToShop, onClearCart }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    notes: ''
  });
  
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const totalGst = cart.reduce((acc, item) => acc + Math.round(item.product.price * (item.product.gst / 100) * item.quantity), 0);
  const grandTotal = subtotal + totalGst;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    
    // Create detailed specs string from cart
    const specsString = cart.map(item => 
      `${item.quantity}x ${item.product.name} (Weight: ${item.weight}, Handle: ${item.handle})`
    ).join(' | ');

    const order = {
      customerName: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
      batName: cart.length > 1 ? "Multiple Items" : cart[0].product.name,
      price: subtotal,
      gst: totalGst,
      total: grandTotal,
      status: "pending",
      specs: `${specsString}. Notes: ${formData.notes || 'None'}`
    };

    const newOrder = db.createOrder(order);
    
    // Also create a lead just in case
    db.addLead({
      name: order.customerName,
      email: order.email,
      phone: order.phone,
      message: `Checkout Order Placed. Total: ₹${grandTotal}. Items: ${specsString}`,
      type: "Checkout Order",
      status: "New"
    });

    setOrderId(newOrder.id);
    setOrderPlaced(true);
    onClearCart();
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#d4af37', '#ffffff', '#e31b23']
    });
  };

  if (orderPlaced) {
    return (
      <section className="section-padding" style={{ background: 'var(--black)', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', background: 'var(--dark)', padding: '60px 40px', borderRadius: '12px', border: '1px solid var(--border)', maxWidth: '600px', width: '100%' }}>
          <CheckCircle2 size={64} style={{ color: '#2ecc71', margin: '0 auto 20px', display: 'block' }} />
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: '2.5rem', marginBottom: '16px', color: 'var(--white)' }}>Order Confirmed!</h1>
          <p style={{ color: 'var(--muted)', fontSize: '16px', marginBottom: '8px' }}>
            Thank you, {formData.firstName}. Your order has been successfully placed.
          </p>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '30px' }}>
            Order ID: <strong style={{ color: 'var(--gold)' }}>#{orderId}</strong>
          </p>
          <div style={{ background: 'var(--black)', padding: '20px', borderRadius: '8px', marginBottom: '30px', textAlign: 'left', border: '1px solid var(--border)' }}>
            <h4 style={{ color: 'var(--white)', marginBottom: '12px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>What happens next?</h4>
            <p style={{ color: 'var(--muted)', fontSize: '14px', margin: 0, lineHeight: 1.6 }}>
              Our workshop team will review your specifications. You will receive an email confirmation shortly, and Shailesh Bhai may contact you directly on {formData.phone} if any clarifications are needed for your custom bat profiles.
            </p>
          </div>
          <button onClick={onBackToShop} className="btn-primary">
            Return to Shop
          </button>
        </div>
      </section>
    );
  }

  if (cart.length === 0) {
    return (
      <section className="section-padding" style={{ background: 'var(--black)', flexGrow: 1, textAlign: 'center' }}>
        <h2 style={{ color: 'var(--white)' }}>Your Cart is Empty</h2>
        <button onClick={onBackToShop} className="btn-secondary" style={{ marginTop: '20px' }}>
          Back to Shop
        </button>
      </section>
    );
  }

  return (
    <section className="section-padding" style={{ background: 'var(--black)', flexGrow: 1 }}>
      <div className="container">
        <button onClick={onBackToShop} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '30px', fontSize: '14px' }}>
          <ArrowLeft size={16} /> Back to Shop
        </button>
        
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: '2.5rem', marginBottom: '40px', color: 'var(--white)' }}>Checkout</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px', alignItems: 'start' }} className="checkout-grid">
          
          {/* Form Side */}
          <div style={{ background: 'var(--dark)', padding: '30px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '24px', color: 'var(--white)', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>Shipping & Billing Information</h3>
            
            <form id="checkout-form" onSubmit={handleCheckoutSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>First Name *</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required style={{ width: '100%', padding: '12px', background: 'var(--black)', border: '1px solid var(--border)', color: 'var(--white)', borderRadius: '4px', outline: 'none' }} />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>Last Name *</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required style={{ width: '100%', padding: '12px', background: 'var(--black)', border: '1px solid var(--border)', color: 'var(--white)', borderRadius: '4px', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>Email Address *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} required style={{ width: '100%', padding: '12px', background: 'var(--black)', border: '1px solid var(--border)', color: 'var(--white)', borderRadius: '4px', outline: 'none' }} />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>Phone Number *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required style={{ width: '100%', padding: '12px', background: 'var(--black)', border: '1px solid var(--border)', color: 'var(--white)', borderRadius: '4px', outline: 'none' }} />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>Street Address *</label>
                <input type="text" name="address" value={formData.address} onChange={handleInputChange} required style={{ width: '100%', padding: '12px', background: 'var(--black)', border: '1px solid var(--border)', color: 'var(--white)', borderRadius: '4px', outline: 'none' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>City *</label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} required style={{ width: '100%', padding: '12px', background: 'var(--black)', border: '1px solid var(--border)', color: 'var(--white)', borderRadius: '4px', outline: 'none' }} />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>State *</label>
                  <input type="text" name="state" value={formData.state} onChange={handleInputChange} required style={{ width: '100%', padding: '12px', background: 'var(--black)', border: '1px solid var(--border)', color: 'var(--white)', borderRadius: '4px', outline: 'none' }} />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>PIN Code *</label>
                  <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} required style={{ width: '100%', padding: '12px', background: 'var(--black)', border: '1px solid var(--border)', color: 'var(--white)', borderRadius: '4px', outline: 'none' }} />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>Order Notes (Optional)</label>
                <textarea name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Special instructions for delivery or custom requests..." style={{ width: '100%', padding: '12px', background: 'var(--black)', border: '1px solid var(--border)', color: 'var(--white)', borderRadius: '4px', minHeight: '80px', outline: 'none' }} />
              </div>

              <div style={{ background: 'rgba(212, 175, 55, 0.05)', border: '1px solid var(--gold)', padding: '16px', borderRadius: '6px', marginBottom: '24px' }}>
                <h4 style={{ color: 'var(--gold)', fontSize: '14px', marginBottom: '8px' }}>Payment Method</h4>
                <p style={{ color: 'var(--white)', fontSize: '13px', margin: 0 }}>Pay via UPI / Bank Transfer upon confirmation.</p>
                <p style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '4px', margin: 0 }}>Our team will contact you with payment details to secure your custom order.</p>
              </div>

            </form>
          </div>

          {/* Order Summary Side */}
          <div style={{ background: 'var(--card)', padding: '30px', borderRadius: '8px', border: '1px solid var(--border)', position: 'sticky', top: '100px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '24px', color: 'var(--white)', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>Order Summary</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', maxHeight: '300px', overflowY: 'auto' }}>
              {cart.map(item => (
                <div key={item.cartId} style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ position: 'relative' }}>
                    <img src={item.product.images?.[0] || "/assets/bat_single.png"} alt={item.product.name} style={{ width: '60px', height: '60px', objectFit: 'contain', background: 'var(--black)', borderRadius: '4px', border: '1px solid var(--border)' }} onError={(e) => { e.target.src = "/assets/bat_single.png"; }} />
                    <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--gold)', color: '#000', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>{item.quantity}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ color: 'var(--white)', fontSize: '13px', marginBottom: '2px' }}>{item.product.name}</h4>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Wt: {item.weight} | Hdl: {item.handle}</div>
                  </div>
                  <div style={{ color: 'var(--white)', fontSize: '13px', fontWeight: 'bold' }}>
                    ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: 'var(--muted)' }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: 'var(--muted)' }}>
                <span>GST (Estimated)</span>
                <span>₹{totalGst.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: 'var(--muted)' }}>
                <span>Shipping</span>
                <span style={{ color: '#2ecc71' }}>Free</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '16px', color: 'var(--white)', fontWeight: 'bold' }}>Total</span>
              <span style={{ fontSize: '22px', color: 'var(--gold)', fontWeight: '900' }}>₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>

            <button type="submit" form="checkout-form" className="btn-primary" style={{ width: '100%', fontSize: '14px', padding: '16px' }}>
              Confirm Order
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
