import React, { useState } from 'react';
import { X, User, Mail, Lock, LogIn, UserPlus, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { db } from '../data/db';

export default function AuthModal({ onClose, onLoginSuccess, currentUser, onLogout }) {
  const [activeTab, setActiveTab] = useState('login'); // login, register, profile
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    if (!formData.name || !formData.email || !formData.password) {
      setAlert({ type: 'error', message: 'Please fill in all required fields!' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setAlert({ type: 'error', message: 'Passwords do not match!' });
      return;
    }

    const res = db.registerCustomer(formData.name, formData.email, formData.password);
    if (!res.success) {
      setAlert({ type: 'error', message: res.message });
      return;
    }

    // Success! Log them in immediately
    db.setCurrentUser(res.user);
    setAlert({ type: 'success', message: 'Account created successfully! Logging you in...' });
    setTimeout(() => {
      onLoginSuccess(res.user);
      onClose();
    }, 1500);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    if (!formData.email || !formData.password) {
      setAlert({ type: 'error', message: 'Please fill in all fields!' });
      return;
    }

    const res = db.loginCustomer(formData.email, formData.password);
    if (!res.success) {
      setAlert({ type: 'error', message: res.message });
      return;
    }

    // Success! Log them in
    db.setCurrentUser(res.user);
    setAlert({ type: 'success', message: 'Welcome back! Login successful.' });
    setTimeout(() => {
      onLoginSuccess(res.user);
      onClose();
    }, 1500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content admin-form-modal animate-fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px', padding: '30px', background: 'var(--card)', border: '1px solid var(--border)' }}>
        <button className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>

        {currentUser ? (
          /* Profile Mode */
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'rgba(227, 27, 35, 0.08)',
              border: '2px solid var(--gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: 'var(--gold)'
            }}>
              <User size={36} />
            </div>
            <h3 style={{ color: 'var(--white)', marginBottom: '8px', fontSize: '1.4rem' }}>{currentUser.name}</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '24px' }}>{currentUser.email}</p>

            <div style={{
              background: 'var(--dark)',
              border: '1px solid var(--border)',
              padding: '16px',
              marginBottom: '30px',
              fontSize: '0.9rem',
              color: 'var(--white)',
              textAlign: 'left'
            }}>
              ⭐ <strong>Customer Type:</strong> Registered Player<br />
              ❤️ <strong>Wishlist:</strong> {currentUser.wishlist?.length || 0} bats saved
            </div>

            <button
              onClick={() => {
                db.setCurrentUser(null);
                onLogout();
                onClose();
              }}
              className="btn btn-accent"
              style={{ width: '100%' }}
            >
              Sign Out Account
            </button>
          </div>
        ) : (
          /* Login/Register Tabs */
          <div>
            <div className="auth-switch-header">
              <button
                onClick={() => { setActiveTab('login'); setAlert({ type: '', message: '' }); }}
                className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
              >
                Log In
              </button>
              <button
                onClick={() => { setActiveTab('register'); setAlert({ type: '', message: '' }); }}
                className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
              >
                Sign Up
              </button>
            </div>

            {alert.message && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                marginBottom: '20px',
                fontSize: '0.85rem',
                border: '1px solid',
                background: alert.type === 'success' ? 'rgba(46,204,113,0.1)' : 'rgba(231,76,60,0.1)',
                color: alert.type === 'success' ? '#2ecc71' : '#e74c3c',
                borderColor: alert.type === 'success' ? '#2ecc71' : '#e74c3c'
              }}>
                {alert.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                <span>{alert.message}</span>
              </div>
            )}

            {activeTab === 'login' ? (
              /* Login Form */
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--muted)' }} />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email"
                      className="form-control"
                      style={{ paddingLeft: '44px' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--muted)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter password"
                      className="form-control"
                      style={{ paddingLeft: '44px', paddingRight: '44px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '14px',
                        top: '12px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0
                      }}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                  <LogIn size={16} /> Authenticate
                </button>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--muted)' }} />
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Full Name"
                      className="form-control"
                      style={{ paddingLeft: '44px' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--muted)' }} />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email"
                      className="form-control"
                      style={{ paddingLeft: '44px' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Create Password *</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--muted)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Password"
                      className="form-control"
                      style={{ paddingLeft: '44px', paddingRight: '44px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '14px',
                        top: '12px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0
                      }}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Password *</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--muted)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Retype password"
                      className="form-control"
                      style={{ paddingLeft: '44px', paddingRight: '44px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '14px',
                        top: '12px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0
                      }}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                  <UserPlus size={16} /> Create Account
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
