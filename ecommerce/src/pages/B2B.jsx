import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './B2B.css';
import {
  Building2, FileText, TrendingUp, Search, Plus, Eye, Edit2, Trash2,
  CheckSquare, Square, CreditCard, Wallet, Percent, Clock, ShoppingBag, Package,
  Bell, Star, Zap, CheckCircle, Circle, BarChart2, MessageSquare, Tag, Users, RefreshCw, X
} from 'lucide-react';
import {
  BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, AreaChart, Area
} from 'recharts';
import ModuleHeader from '../components/ModuleHeader';
import RegistrationForm from '../components/RegistrationForm';
import ProductCatalog from '../components/ProductCatalog';
import AddProductForm from '../components/AddProductForm';
import SourcingDiscovery from '../components/SourcingDiscovery';

const TABS = ['Dashboard', 'Marketplace', 'Vendors', 'Inquiries', 'Finance'];

export default function B2B() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationRole, setRegistrationRole] = useState(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [catalogKey, setCatalogKey] = useState(0);
  const [dashboardKey, setDashboardKey] = useState(0);
  const [registrationKey, setRegistrationKey] = useState(0);
  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem('b2b_active_role') || null;
  });
  const [availableRoles, setAvailableRoles] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('b2b_available_roles') || '[]');
    } catch { return []; }
  });
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [discoveryFilters, setDiscoveryFilters] = useState(null);
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('b2b_cart') || '[]');
    } catch { return []; }
  });
  const [showCheckout, setShowCheckout] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const sellerMenu = [
    { id: 'Dashboard', icon: <TrendingUp size={20} />, label: 'Overview' },
    { id: 'Orders', icon: <Package size={20} />, label: 'Orders' },
    { id: 'Products', icon: <ShoppingBag size={20} />, label: 'Products' },
    { id: 'Inventory', icon: <CheckSquare size={20} />, label: 'Inventory' },
    { id: 'Inquiries', icon: <MessageSquare size={20} />, label: 'Buyer Inquiries' },
    { id: 'Payments', icon: <CreditCard size={20} />, label: 'Payments' },
    { id: 'Analytics', icon: <BarChart2 size={20} />, label: 'Analytics' },
  ];

  useEffect(() => {
    localStorage.setItem('b2b_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item._id === product._id);
      if (exists) {
        return prev.map(item => item._id === product._id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item);
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
    alert('Item added to Procurement Cart!');
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(item => item._id !== id));
  const updateCartQuantity = (id, q) => setCart(prev => prev.map(item => item._id === id ? { ...item, cartQuantity: q } : item));
  const clearCart = () => setCart([]);

  useEffect(() => {
    const fetchMinimalRoles = async () => {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      const p = JSON.parse(localStorage.getItem('b2b_partner') || '{}');
      const email = u.email || p.email;
      if (email) {
        try {
          const res = await fetch(`http://localhost:5000/api/partners/my-roles/b2b/${email}`);
          if (res.ok) {
            const data = await res.json();
            const roles = data.map(r => r.role);
            setAvailableRoles(roles);
            localStorage.setItem('b2b_available_roles', JSON.stringify(roles));

            // If activeRole is not set or not in available roles, set it to the first one
            if (!activeRole || !roles.includes(activeRole)) {
              if (roles.length > 0) {
                setActiveRole(roles[0]);
                localStorage.setItem('b2b_active_role', roles[0]);
              }
            }
          }
        } catch (e) {
          console.error('Minimal role fetch failed:', e);
        }
      }
    };
    fetchMinimalRoles();
  }, [dashboardKey]);

  const [registrationLoginMode, setRegistrationLoginMode] = useState(false);

  const openRegistration = (role, isLogin = false) => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (!token || !user) {
      alert('Please use the main login page first. B2B role setup works after app login.');
      navigate('/login');
      return;
    }
    setRegistrationRole(role || null);
    setRegistrationLoginMode(isLogin);
    setRegistrationKey(prev => prev + 1);
    setShowRegistration(true);
  };

  const renderContent = () => {
    if (activeRole === 'seller') {
      switch (activeTab) {
        case 'Dashboard': return <SellerOverview />;
        case 'Orders': return <SellerOrdersPanel />;
        case 'Products': return <SellerProductsTab onEdit={(p) => { setEditingProduct(p); setShowAddProduct(true); }} />;
        case 'Inventory': return <SellerInventoryPanel />;
        case 'Inquiries': return <SellerInquiriesPanel />;
        case 'Payments': return <SellerPaymentsPanel />;
        case 'Analytics': return <SellerAnalyticsPanel />;
        default: return <SellerOverview />;
      }
    }

    switch (activeTab) {
      case 'Dashboard': return <DashboardTab
        key={dashboardKey}
        availableRoles={availableRoles}
        setAvailableRoles={setAvailableRoles}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        onTabChange={setActiveTab}
        onOpenDiscovery={() => setShowDiscovery(true)}
        onAddProduct={() => {
          const p = (() => { try { return JSON.parse(localStorage.getItem('b2b_partner')); } catch { return null; } })();
          if (!p || p.role !== 'seller') { alert('Only registered sellers can list products. Please register as a Seller first.'); return; }
          setShowAddProduct(true);
        }}
        onOpenRegistration={(role) => openRegistration(role, true)}
      />;
      case 'Marketplace': return <ProductCatalog
        key={catalogKey}
        activeRole={activeRole}
        onAddToCart={addToCart}
        initialFilters={discoveryFilters}
        onAddProduct={() => {
          const _ps = (() => { try { return JSON.parse(localStorage.getItem('b2b_partner')); } catch { return null; } })();
          if (!_ps || _ps.role !== 'seller') { alert('Only registered sellers can list products. Please register as a Seller first.'); return; }
          setShowAddProduct(true);
        }} />;
      case 'Vendors': return <VendorsTab />;
      case 'Inquiries': return <InquiriesTab activeRole={activeRole} />;
      case 'My Cart': return <CartTab cart={cart} removeFromCart={removeFromCart} updateQuantity={updateCartQuantity} clearCart={clearCart} onProceedCheckout={() => setShowCheckout(true)} />;
      case 'Finance': return <FinanceTab />;
      default: return <DashboardTab />;
    }
  };

  return (
    <div className={`b2b-container ${activeRole === 'seller' ? 'seller-mode' : ''}`}>
      {activeRole === 'seller' && (
        <aside className={`b2b-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            <Building2 size={24} color="#3b82f6" />
            {!sidebarCollapsed && <span>Seller Central</span>}
          </div>
          <nav className="sidebar-nav">
            {sellerMenu.map(item => (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                {item.icon}
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            ))}
            <div className="nav-divider" />
            <button className="nav-item role-switch" onClick={() => { setActiveRole('buyer'); setActiveTab('Dashboard'); }}>
              <Users size={20} />
              {!sidebarCollapsed && <span>Switch to Buyer</span>}
            </button>
          </nav>
          <button className="collapse-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <RefreshCw size={16} />
          </button>
        </aside>
      )}

      <div className="b2b-main">
        <ModuleHeader
          title={activeRole === 'seller' ? `Seller Dashboard: ${activeTab}` : "B2B Management Module"}
          subtitle={activeRole === 'seller' ? "Manage your products, orders and inquiries" : "Vendor Relations, RFQs & Bulk Procurement"}
        >
          {activeRole === 'buyer' && (
            <div className="b2b-tabs">
              {TABS.map(tab => (
                <button
                  key={tab}
                  className={`b2b-tab-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                  style={tab === 'Marketplace' ? { display: 'flex', alignItems: 'center', gap: '5px' } : {}}
                >
                  {tab === 'Marketplace' && <ShoppingBag size={14} />}{tab}
                </button>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {activeRole === 'buyer' ? (
              <>
                <button className="cart-btn" onClick={() => setActiveTab('My Cart')}>
                  <ShoppingBag size={20} />
                  {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
                </button>
                <button className="btn-ai" onClick={() => openRegistration(null)} style={{ background: '#3b82f6' }}>
                  <Building2 size={18} /> Marketplace Register
                </button>
              </>
            ) : (
              <div className="seller-badge">
                <div className="dot online"></div>
                <span>Verified Seller</span>
              </div>
            )}
          </div>
        </ModuleHeader>

        <div className="b2b-content">
          {renderContent()}
        </div>
      </div>

      {showRegistration && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowRegistration(false)}
              style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#fff', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
            >✕</button>
            <RegistrationForm
              key={registrationKey}
              moduleType="b2b"
              initialRole={registrationRole}
              availableRoles={availableRoles}
              isLoginMode={registrationLoginMode}
              onRegistrationSuccess={(data) => {
                if (data?.partner) {
                  localStorage.setItem('b2b_partner', JSON.stringify(data.partner));
                  localStorage.setItem('b2b_active_role', data.partner.role);

                  const currentRoles = JSON.parse(localStorage.getItem('b2b_available_roles') || '[]');
                  if (!currentRoles.includes(data.partner.role)) {
                    const newRoles = [...currentRoles, data.partner.role];
                    localStorage.setItem('b2b_available_roles', JSON.stringify(newRoles));
                    setAvailableRoles(newRoles);
                  }
                }
                setDashboardKey(prev => prev + 1);
                setTimeout(() => setShowRegistration(false), 2000);
              }} />
          </div>
        </div>
      )}

      {(showAddProduct || editingProduct) && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1200, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AddProductForm
            product={editingProduct}
            onClose={() => { setShowAddProduct(false); setEditingProduct(null); }}
            onSuccess={() => { setCatalogKey(k => k + 1); setShowAddProduct(false); setEditingProduct(null); }}
          />
        </div>
      )}

      {showCheckout && <CheckoutModal cart={cart} onClearCart={clearCart} onClose={() => setShowCheckout(false)} onOrderSuccess={() => { setShowCheckout(false); setActiveTab('Finance'); }} />}

      {showDiscovery && (
        <SourcingDiscovery
          onClose={() => setShowDiscovery(false)}
          onSelectDiscovery={(filters) => {
            setDiscoveryFilters(filters);
            setShowDiscovery(false);
            setActiveTab('Marketplace');
            setCatalogKey(prev => prev + 1);
          }}
        />
      )}
    </div>
  );
}

// --- SUB-COMPONENTS FOR DIFFERENT TABS ---

function DashboardTab({ onAddProduct, onOpenRegistration, availableRoles, setAvailableRoles, activeRole, setActiveRole, onTabChange, onOpenDiscovery }) {
  const [myProducts, setMyProducts] = useState([]);
  const [myInquiries, setMyInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = (() => { try { return JSON.parse(localStorage.getItem('user')) || {}; } catch { return {}; } })();
  const partner = (() => { try { return JSON.parse(localStorage.getItem('b2b_partner')) || {}; } catch { return {}; } })();

  const isSeller = activeRole === 'seller';
  const isBuyer = activeRole === 'buyer';

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const email = user?.email || partner?.email;
        if (!email) { setLoading(false); return; }

        // 1. Fetch available roles
        const rolesRes = await fetch(`http://localhost:5000/api/partners/my-roles/b2b/${email}`);
        let roles = [];
        if (rolesRes.ok) {
          const partners = await rolesRes.json();
          roles = partners.map(p => p.role);
          setAvailableRoles(roles);
        }

        if (roles.length === 0) { setLoading(false); return; }

        // 2. Set active role if not set or invalid
        let currentRole = activeRole;
        if (!currentRole || !roles.includes(currentRole)) {
          currentRole = roles[0];
          setActiveRole(currentRole);
          localStorage.setItem('b2b_active_role', currentRole);
        }

        // 3. Fetch data based on active role
        if (currentRole === 'buyer') {
          // No specific buyer data to fetch for dashboard currently
        } else {
          const [pr, ir] = await Promise.all([
            fetch('http://localhost:5000/api/b2b/products/my/' + email),
            fetch('http://localhost:5000/api/b2b/inquiries/seller/' + email)
          ]);
          if (pr.ok) setMyProducts(await pr.json());
          if (ir.ok) setMyInquiries(await ir.json());
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchDashboardData();
  }, [activeRole]);

  const toggleRole = () => {
    const newRole = activeRole === 'buyer' ? 'seller' : 'buyer';
    setActiveRole(newRole);
    localStorage.setItem('b2b_active_role', newRole);
  };

  // CASE 1: NOT REGISTERED
  if (availableRoles.length === 0 && !loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '4.5rem', marginBottom: '1.5rem', animation: 'bounce 2s infinite' }}>🏗️</div>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '1rem' }}>Join the B2B Marketplace</h2>
        <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '550px', marginBottom: '2.5rem', lineHeight: 1.6 }}>
          Connect with verified industrial buyers and sellers across India.
          Trade bulk materials, manage RFQs, and grow your business today.
        </p>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => {
              if (availableRoles.includes('buyer')) {
                setActiveRole('buyer');
                localStorage.setItem('b2b_active_role', 'buyer');
              } else {
                onOpenRegistration('buyer', true);
              }
            }}
            style={{ padding: '1rem 2.5rem', background: 'linear-gradient(135deg, #3b82f6, #1e40af)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(59,130,246,0.4)', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {availableRoles.includes('buyer') ? 'Switch to Buyer' : 'Join as Buyer'}
          </button>
          <button
            onClick={() => {
              if (availableRoles.includes('seller')) {
                setActiveRole('seller');
                localStorage.setItem('b2b_active_role', 'seller');
              } else {
                onOpenRegistration('seller', true);
              }
            }}
            style={{ padding: '1rem 2.5rem', background: 'linear-gradient(135deg, #10b981, #065f46)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(16,185,129,0.4)', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {availableRoles.includes('seller') ? 'Switch to Seller' : 'Join as Seller'}
          </button>
        </div>
        <div style={{ marginTop: '4rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', maxWidth: '800px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#3b82f6', marginBottom: '0.5rem' }}><CheckCircle size={24} style={{ margin: '0 auto' }} /></div>
            <div style={{ fontWeight: 700, color: '#1e293b' }}>Verified Partners</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Every business is manually verified for trust.</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#10b981', marginBottom: '0.5rem' }}><Package size={24} style={{ margin: '0 auto' }} /></div>
            <div style={{ fontWeight: 700, color: '#1e293b' }}>Bulk Orders</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Simplified logistics for large quantity trades.</div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>Initializing your dashboard...</div>;
  }

  const sellerTiles = [
    { title: 'List a Product', desc: 'Add new goods to catalog', icon: <Plus size={20} />, bg: '#ecfdf5', color: '#10b981', action: onAddProduct },
  ];

  const buyerTiles = [
    { title: 'Browse Products', desc: 'Find industrial materials', icon: <Search size={20} />, bg: '#eff6ff', color: '#3b82f6', action: () => onOpenDiscovery() },
    { title: 'My Cart', desc: 'Review selected items', icon: <ShoppingBag size={20} />, bg: '#f1f5f9', color: '#475569', action: () => onTabChange('My Cart') },
  ];

  return (
    <div className="dashboard-tab-content">
      {/* 1. Header Section */}
      <div style={{ background: activeRole === 'seller' ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' : 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', borderRadius: '16px', padding: '2rem', color: '#fff', marginBottom: '2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 800 }}>Welcome back{user?.name ? `, ${user.name}` : ''}</h2>
              {activeRole === 'seller' && (
                <span style={{ background: '#10b981', color: '#fff', padding: '3px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  {activeRole}
                </span>
              )}
            </div>
            <p style={{ margin: 0, opacity: 0.8, fontSize: '0.95rem' }}>
              Profile: <strong>{activeRole === 'buyer' ? 'Buyer Account' : (partner?.companyName || 'Seller Account')}</strong>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => {
                const nextRole = activeRole === 'buyer' ? 'seller' : 'buyer';
                // IF already registered for this role, just switch (Login style)
                if (availableRoles.includes(nextRole)) {
                  setActiveRole(nextRole);
                  localStorage.setItem('b2b_active_role', nextRole);
                } else {
                  // ELSE open registration form
                  onOpenRegistration(nextRole);
                }
              }}
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
            >
              {availableRoles.length === 2 ? <RefreshCw size={16} /> : <Plus size={16} />}
              {availableRoles.length === 2 ? `Switch to ${activeRole === 'buyer' ? 'Seller' : 'Buyer'}` : `Join as ${availableRoles.includes('buyer') ? 'Seller' : 'Buyer'}`}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Action Tiles Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {(isSeller ? sellerTiles : buyerTiles).map((tile, i) => (
          <div key={i} onClick={tile.action} style={{ background: '#fff', padding: '1.5rem', borderRadius: '18px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'; }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: tile.bg, color: tile.color, padding: '12px', borderRadius: '14px' }}>{tile.icon}</div>
              <div>
                <div style={{ fontWeight: 700, color: '#1e293b' }}>{tile.title}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{tile.desc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Content Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '2rem' }}>
        <div className="b2b-card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <h3 style={{ margin: '0 0 1.5rem 0' }}>{isSeller ? 'My Listed Products' : 'Verified Marketplace Vendors'}</h3>
          {isSeller ? (
            myProducts.length === 0 ? <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No products listed yet.</div> : (
              <div className="b2b-table-container">
                <table className="b2b-table">
                  <thead><tr><th>Name</th><th>Category</th><th>Price</th></tr></thead>
                  <tbody>{myProducts.map(p => <tr key={p._id}><td>{p.name}</td><td>{p.category}</td><td style={{ fontWeight: 700, color: '#10b981' }}>₹{p.price.toLocaleString()}</td></tr>)}</tbody>
                </table>
              </div>
            )
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { name: 'Kushal Engineering', type: 'Cast Iron Supply', rating: 4.8 },
                { name: 'Techno Power Ltd', type: 'Electrical Components', rating: 4.5 },
                { name: 'Industrial Fabrics Co', type: 'Textile/Raw Materials', rating: 4.7 }
              ].map((v, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{v.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{v.type}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontSize: '0.9rem', fontWeight: 700 }}>★ {v.rating}</div>
                    <button style={{ marginTop: '0.5rem', background: '#3b82f6', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>View Catalog</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VendorsTab() {
  const [sellers, setSellers] = React.useState([]);
  const [search, setSearch] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('http://localhost:5000/api/b2b/sellers-with-products', {
      headers: { 'x-auth-token': localStorage.getItem('token') }
    })
      .then(res => res.json())
      .then(data => { setSellers(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const filtered = sellers.filter(s =>
    s.companyName?.toLowerCase().includes(search.toLowerCase()) ||
    s.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="b2b-card">
      <div className="table-header-controls">
        <div style={{ position: 'relative' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', top: '10px', left: '10px' }} />
          <input
            type="text"
            className="search-input"
            placeholder="Search sellers..."
            style={{ paddingLeft: '2rem' }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Loading sellers...</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
          <Building2 size={40} style={{ opacity: 0.2, marginBottom: '0.75rem' }} />
          <p style={{ margin: 0, fontWeight: 600 }}>No sellers found.</p>
        </div>
      ) : (
        <table className="b2b-table">
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Contact Person</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Products</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(seller => (
              <tr key={seller._id}>
                <td style={{ fontWeight: 600 }}>{seller.companyName}</td>
                <td>{seller.name}</td>
                <td>{seller.email}</td>
                <td>{seller.phone}</td>
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '300px' }}>
                    {seller.listedProducts && seller.listedProducts.length > 0 ? (
                      <>
                        {seller.listedProducts.slice(0, 3).map((p, i) => (
                          <span key={i} style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, border: '1px solid #e2e8f0' }}>
                            {p}
                          </span>
                        ))}
                        {seller.listedProducts.length > 3 && (
                          <span style={{ color: '#94a3b8', fontSize: '0.7rem', alignSelf: 'center' }}>
                            +{seller.listedProducts.length - 3} more
                          </span>
                        )}
                      </>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>No products listed</span>
                    )}
                  </div>
                </td>
                <td><span className="status-badge active">Active</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}



function InquiriesTab({ activeRole }) {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const b2bPartner = JSON.parse(localStorage.getItem('b2b_partner') || '{}');
  const email = user.email || b2bPartner.email;

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const endpoint = activeRole === 'buyer'
        ? `http://localhost:5000/api/b2b/inquiries/buyer/${email}`
        : `http://localhost:5000/api/b2b/inquiries/seller/${email}`;
      const res = await fetch(endpoint);
      if (res.ok) {
        setInquiries(await res.json());
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchInquiries(); }, [activeRole]);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    try {
      const res = await fetch(`http://localhost:5000/api/b2b/inquiries/${replyTo._id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerEmail: email,
          sellerName: user.name || b2bPartner.companyName || 'Verified Seller',
          message: replyMessage
        })
      });
      if (res.ok) {
        setReplyTo(null);
        setReplyMessage('');
        fetchInquiries();
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="b2b-card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h3 style={{ margin: 0 }}>{activeRole === 'buyer' ? 'My Product Inquiries' : 'Customer Inquiries'}</h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
            {activeRole === 'buyer' ? 'Track replies from sellers for your product questions.' : 'Respond to potential buyers interested in your products.'}
          </p>
        </div>
        <button className="btn-ai" onClick={fetchInquiries} style={{ padding: '6px 16px', fontSize: '0.85rem' }}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Sync
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading inquiries...</div>
      ) : inquiries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <MessageSquare size={48} style={{ opacity: 0.1, margin: '0 auto 1rem' }} />
          <p style={{ color: '#64748b' }}>No {activeRole === 'buyer' ? 'sent' : 'received'} inquiries found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {inquiries.map(inq => (
            <div key={inq._id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{inq.status}</span>
                  <h4 style={{ margin: '4px 0', fontSize: '1.1rem' }}>{inq.productName}</h4>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    {activeRole === 'buyer' ? `To: ${inq.sellerName || inq.sellerEmail}` : `From: ${inq.buyerName} (${inq.buyerCompany || 'Individual'})`}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(inq.createdAt).toLocaleDateString()}</div>
                  {activeRole === 'seller' && inq.status === 'pending' && (
                    <button onClick={() => setReplyTo(inq)} style={{ marginTop: '0.5rem', background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Reply</button>
                  )}
                </div>
              </div>

              <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.9rem', color: '#334155' }}>
                <strong>Message:</strong> {inq.message}
              </div>

              {inq.replies && inq.replies.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                  {inq.replies.map((reply, rid) => (
                    <div key={rid} style={{ background: '#ecfdf5', padding: '1rem', borderRadius: '12px', marginLeft: '2rem', fontSize: '0.9rem', border: '1px solid #d1fae5' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 800, color: '#065f46' }}>Reply from {reply.sellerName}</span>
                        <span style={{ fontSize: '0.7rem', color: '#10b981' }}>{new Date(reply.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div style={{ color: '#064e3b' }}>{reply.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {replyTo && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1400, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '20px', width: '450px', maxWidth: '95%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Reply to Inquiry</h3>
              <X size={20} style={{ cursor: 'pointer' }} onClick={() => setReplyTo(null)} />
            </div>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Buyer: {replyTo.buyerName}</p>
            <textarea
              value={replyMessage}
              onChange={e => setReplyMessage(e.target.value)}
              placeholder="Write your response..."
              style={{ width: '100%', height: '120px', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '1rem', marginBottom: '1.5rem', outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setReplyTo(null)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleReplySubmit} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Send Reply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SELLER DASHBOARD SUB-COMPONENTS ---

function SellerOverview() {
  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, revenue: 0, pendingInquiries: 0, monthlySales: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const pStr = localStorage.getItem('b2b_partner');
        if (!pStr) return;
        const partner = JSON.parse(pStr);
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/b2b/analytics/seller/${partner.email}`, {
          headers: { 'x-auth-token': token }
        });
        if (res.ok) setStats(await res.json());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  if (loading) return <div>Loading Analytics...</div>;

  const cardStyle = { background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        <div style={cardStyle}>
          <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Products</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.totalProducts}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Orders</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.totalOrders}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Revenue</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>₹{stats.revenue.toLocaleString()}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Pending Inquiries</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b' }}>{stats.pendingInquiries}</div>
        </div>
      </div>

      <div style={{ ...cardStyle, height: '400px' }}>
        <h3 style={{ margin: '0 0 1.5rem 0' }}>Revenue Trends</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={stats.monthlySales}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <Tooltip />
            <Area type="monotone" dataKey="sales" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSales)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SellerOrdersPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const pStr = localStorage.getItem('b2b_partner');
      if (!pStr) return;
      const partner = JSON.parse(pStr);
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/b2b/orders/seller/${partner.email}`, {
        headers: { 'x-auth-token': token }
      });
      if (res.ok) setOrders(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/b2b/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchOrders();
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="b2b-card">Loading Orders...</div>;

  return (
    <div className="b2b-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Recent Orders</h2>
        <button onClick={fetchOrders} className="btn-ai" style={{ width: 'auto', padding: '8px 16px' }}><RefreshCw size={16} /> Refresh</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="b2b-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>
              <th style={{ padding: '1rem' }}>Order ID</th>
              <th style={{ padding: '1rem' }}>Buyer</th>
              <th style={{ padding: '1rem' }}>Value</th>
              <th style={{ padding: '1rem' }}>Payment</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem', fontWeight: 700 }}>{order.orderId}</td>
                <td style={{ padding: '1rem' }}>{order.client}</td>
                <td style={{ padding: '1rem', fontWeight: 700 }}>₹{Number(order.orderValue).toLocaleString()}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '20px', fontSize: '0.75rem', background: order.paymentStatus === 'Success' ? '#f0fdf4' : '#fff7ed', color: order.paymentStatus === 'Success' ? '#166534' : '#9a3412', border: '1px solid' }}>
                    {order.paymentStatus}
                  </span>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>{order.paymentMethod}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    style={{ padding: '4px 8px', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: '#fff' }}
                  >
                    {['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: '1rem' }}>
                  <button className="icon-btn"><Eye size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SellerProductsTab({ onEdit }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const pStr = localStorage.getItem('b2b_partner');
      if (!pStr) return;
      const partner = JSON.parse(pStr);
      const res = await fetch(`http://localhost:5000/api/b2b/products/my/${partner.email}`);
      if (res.ok) setProducts(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/b2b/products/${id}`, { method: 'DELETE' });
      if (res.ok) fetchProducts();
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="b2b-card">Loading Products...</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
      {products.map(p => (
        <div key={p._id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '24px', overflow: 'hidden', transition: 'transform 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ height: '180px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #f1f5f9' }}>
            {p.images?.[0] ? <img src={p.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={48} color="#cbd5e1" />}
          </div>
          <div style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.4rem' }}>{p.category}</div>
            <h3 style={{ margin: '0 0 0.8rem 0', fontSize: '1.1rem', color: '#1e293b' }}>{p.name}</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981' }}>₹{p.price.toLocaleString()}</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '8px' }}>Stock: {p.stock}</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => onEdit(p)} className="btn-secondary" style={{ flex: 1, padding: '10px' }}><Edit2 size={16} /> Edit</button>
              <button onClick={() => deleteProduct(p._id)} style={{ padding: '10px', borderRadius: '12px', border: '1.5px solid #fee2e2', background: '#fef2f2', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SellerInventoryPanel() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const pStr = localStorage.getItem('b2b_partner');
      if (!pStr) return;
      const partner = JSON.parse(pStr);
      const res = await fetch(`http://localhost:5000/api/b2b/products/my/${partner.email}`);
      if (res.ok) setProducts(await res.json());
    };
    fetchProducts();
  }, []);

  return (
    <div className="b2b-card" style={{ padding: '2rem' }}>
      <h2 style={{ margin: '0 0 1.5rem 0' }}>Inventory Management</h2>
      <table className="b2b-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>
            <th style={{ padding: '1rem' }}>Product</th>
            <th style={{ padding: '1rem' }}>Stock</th>
            <th style={{ padding: '1rem' }}>MOQ</th>
            <th style={{ padding: '1rem' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '1rem', fontWeight: 600 }}>{p.name}</td>
              <td style={{ padding: '1rem' }}>
                <span style={{ color: p.stock < 10 ? '#ef4444' : 'inherit', fontWeight: p.stock < 10 ? 800 : 400 }}>
                  {p.stock}
                </span>
                {p.stock < 10 && <span style={{ marginLeft: '10px', fontSize: '0.7rem', color: '#ef4444', background: '#fef2f2', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>LOW STOCK</span>}
              </td>
              <td style={{ padding: '1rem' }}>{p.moq}</td>
              <td style={{ padding: '1rem' }}>
                <span style={{ padding: '4px 8px', borderRadius: '8px', fontSize: '0.8rem', background: p.stock > 0 ? '#f0fdf4' : '#fef2f2', color: p.stock > 0 ? '#166534' : '#ef4444', fontWeight: 700 }}>
                  {p.stock > 0 ? 'ACTIVE' : 'OUT OF STOCK'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SellerInquiriesPanel() {
  const [inquiries, setInquiries] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [activeInquiry, setActiveInquiry] = useState(null);

  const fetchInquiries = async () => {
    const pStr = localStorage.getItem('b2b_partner');
    if (!pStr) return;
    const partner = JSON.parse(pStr);
    const res = await fetch(`http://localhost:5000/api/b2b/inquiries/seller/${partner.email}`);
    if (res.ok) setInquiries(await res.json());
  };

  useEffect(() => { fetchInquiries(); }, []);

  const sendReply = async (id) => {
    if (!replyText.trim()) return;
    try {
      const pStr = localStorage.getItem('b2b_partner');
      if (!pStr) return;
      const partner = JSON.parse(pStr);
      const res = await fetch(`http://localhost:5000/api/b2b/inquiries/${id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerEmail: partner.email,
          sellerName: partner.name,
          message: replyText
        })
      });
      if (res.ok) {
        setReplyText('');
        setActiveInquiry(null);
        fetchInquiries();
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      {inquiries.map(inq => (
        <div key={inq._id} className="b2b-card" style={{ border: inq.status === 'pending' ? '2px solid #3b82f6' : '1px solid #e2e8f0', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{inq.productName}</h3>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>From: {inq.buyerName} ({inq.buyerEmail})</div>
            </div>
            <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', background: inq.status === 'replied' ? '#f0fdf4' : '#fff7ed', color: inq.status === 'replied' ? '#166534' : '#9a3412', fontWeight: 700 }}>
              {inq.status.toUpperCase()}
            </span>
          </div>
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.2rem', color: '#334155', fontStyle: 'italic' }}>
            "{inq.message}"
          </div>

          {inq.replies?.map((r, i) => (
            <div key={i} style={{ marginLeft: '1.5rem', marginTop: '0.8rem', padding: '1rem', background: '#fff', borderRadius: '12px', border: '1px solid #f1f5f9', borderLeft: '4px solid #3b82f6' }}>
              <div style={{ fontWeight: 800, fontSize: '0.8rem', color: '#3b82f6' }}>{r.sellerName.toUpperCase()}</div>
              <div style={{ marginTop: '4px' }}>{r.message}</div>
            </div>
          ))}

          {activeInquiry === inq._id ? (
            <div style={{ marginTop: '1.5rem' }}>
              <textarea
                placeholder="Type your reply to the buyer..."
                style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '2px solid #e2e8f0', minHeight: '120px', outline: 'none', transition: 'border 0.2s', resize: 'vertical' }}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
              ></textarea>
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button onClick={() => sendReply(inq._id)} className="btn-ai" style={{ flex: 2 }}>Send Reply Now</button>
                <button onClick={() => setActiveInquiry(null)} className="btn-secondary" style={{ flex: 1 }}>Discard</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setActiveInquiry(inq._id)}
              className="btn-ai"
              style={{ marginTop: '1rem', width: 'auto', padding: '8px 24px', background: '#fff', color: '#334155', border: '1.5px solid #e2e8f0' }}
            >
              Reply to Inquiry
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function SellerPaymentsPanel() {
  const [finance, setFinance] = useState([]);

  useEffect(() => {
    const fetchFinance = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/b2b/finance', {
          headers: { 'x-auth-token': token }
        });
        if (res.ok) setFinance(await res.json());
      } catch (e) { console.error(e); }
    };
    fetchFinance();
  }, []);

  return (
    <div className="b2b-card">
      <h2 style={{ marginBottom: '1.5rem' }}>Transaction History</h2>
      <table className="b2b-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>
            <th style={{ padding: '1rem' }}>Date</th>
            <th style={{ padding: '1rem' }}>Transaction ID</th>
            <th style={{ padding: '1rem' }}>Party/Order</th>
            <th style={{ padding: '1rem' }}>Amount</th>
            <th style={{ padding: '1rem' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {finance.map(f => (
            <tr key={f._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '1rem' }}>{new Date(f.date).toLocaleDateString()}</td>
              <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>{f.transactionId}</td>
              <td style={{ padding: '1rem' }}>
                <div style={{ fontWeight: 600 }}>{f.partyName}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Order: {f.orderId}</div>
              </td>
              <td style={{ padding: '1rem', fontWeight: 800, color: f.type === 'Credit' ? '#10b981' : '#ef4444' }}>
                {f.type === 'Credit' ? '+' : '-'}₹{f.amount?.toLocaleString()}
              </td>
              <td style={{ padding: '1rem' }}><span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 800 }}>COMPLETED</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SellerAnalyticsPanel() {
  return <SellerOverview />;
}


function FinanceTab() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchFinance = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/b2b/finance', {
          headers: { 'x-auth-token': token }
        });
        if (res.ok) {
          const data = await res.json();
          setTransactions(Array.isArray(data) ? data : []);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchFinance();
  }, []);

  const totalCredit = transactions.filter(t => t.type === 'Credit').reduce((acc, t) => acc + t.amount, 0);
  const totalDebit = transactions.filter(t => t.type === 'Debit').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalCredit - totalDebit;

  const filtered = filter === 'All' ? transactions : transactions.filter(t => t.type === filter);

  return (
    <div className="finance-tab-content">
      {/* 1. Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div style={{ background: '#fff', padding: '1.75rem', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
            <div style={{ background: '#ecfdf5', color: '#10b981', padding: '10px', borderRadius: '12px' }}><TrendingUp size={20} /></div>
            <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Total Credits</div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b' }}>₹{totalCredit.toLocaleString()}</div>
        </div>
        <div style={{ background: '#fff', padding: '1.75rem', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
            <div style={{ background: '#fef2f2', color: '#ef4444', padding: '10px', borderRadius: '12px' }}><CreditCard size={20} /></div>
            <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Total Debits</div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b' }}>₹{totalDebit.toLocaleString()}</div>
        </div>
        <div style={{ background: balance >= 0 ? 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' : 'linear-gradient(135deg, #991b1b 0%, #ef4444 100%)', padding: '1.75rem', borderRadius: '20px', color: '#fff', boxShadow: '0 10px 20px -5px rgba(59,130,246,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px' }}><Wallet size={20} /></div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9, fontWeight: 600 }}>Available Balance</div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>₹{balance.toLocaleString()}</div>
        </div>
      </div>

      {/* 2. Transactions Section */}
      <div className="b2b-card" style={{ padding: '2rem', borderRadius: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Recent Transactions</h3>
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px', gap: '4px' }}>
            {['All', 'Credit', 'Debit'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{ padding: '6px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, background: filter === f ? '#fff' : 'transparent', color: filter === f ? '#1e293b' : '#64748b', boxShadow: filter === f ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
              >{f}</button>
            ))}
          </div>
        </div>

        {loading ? <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading financial records...</div> : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#f8fafc', borderRadius: '18px', border: '2px dashed #e2e8f0' }}>
            <BarChart2 size={40} style={{ margin: '0 auto 1rem', opacity: 0.1 }} />
            <p style={{ margin: 0, color: '#64748b' }}>No transactions found for this period.</p>
          </div>
        ) : (
          <div className="b2b-table-container">
            <table className="b2b-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Transaction ID</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t._id}>
                    <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.85rem' }}>{t.transactionId}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{t.partyName || 'Marketplace Transaction'}</div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Ref: {t.orderId}</div>
                    </td>
                    <td>
                      <span style={{
                        background: t.type === 'Credit' ? '#dcfce7' : '#fee2e2',
                        color: t.type === 'Credit' ? '#166534' : '#991b1b',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {t.type === 'Credit' ? '↓ Credit' : '↑ Debit'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: t.type === 'Credit' ? '#10b981' : '#ef4444', fontSize: '1rem' }}>
                      {t.type === 'Credit' ? '+' : '-'}₹{t.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckoutModal({ cart, onClearCart, onClose, onOrderSuccess }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  const user = (() => { try { return JSON.parse(localStorage.getItem('user')) || {}; } catch { return {}; } })();
  const partner = (() => { try { return JSON.parse(localStorage.getItem('b2b_partner')) || {}; } catch { return {}; } })();
  const email = user.email || partner.email;

  const [addressData, setAddressData] = useState({
    fullName: user.name || '',
    companyName: partner.companyName || '',
    country: 'India',
    houseDetails: '',
    areaDetails: '',
    landmark: '',
    pincode: '',
    city: '',
    state: '',
    mobile: user.phone || partner.phone || '',
    email: email
  });

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.cartQuantity), 0);
  const mrpTotal = cart.reduce((acc, item) => acc + ((item.mrp || item.price * 1.2) * item.cartQuantity), 0);
  const discountTotal = mrpTotal - subtotal;
  const taxableAmount = subtotal / 1.18;
  const totalGst = subtotal - taxableAmount;
  const deliveryCharges = 0;
  const total = subtotal + deliveryCharges;

  const handleRazorpayPayment = (orderData) => {
    return new Promise((resolve, reject) => {
      const options = {
        key: 'rzp_test_placeholder', // Should be from .env but for frontend demo
        amount: orderData.amount,
        currency: 'INR',
        name: 'UniMart B2B',
        description: 'Bulk Order Payment',
        order_id: orderData.id,
        handler: async (response) => {
          try {
            const token = localStorage.getItem('token');
            const verifyRes = await fetch('http://localhost:5000/api/b2b/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
              body: JSON.stringify(response)
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              resolve(response.razorpay_payment_id);
            } else {
              reject(new Error('Payment verification failed'));
            }
          } catch (e) {
            reject(e);
          }
        },
        prefill: {
          name: addressData.fullName,
          email: addressData.email,
          contact: addressData.mobile
        },
        theme: { color: '#3b82f6' }
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        reject(new Error(response.error.description));
      });
      rzp.open();
    });
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let transactionId = null;

      if (paymentMethod === 'UPI' || paymentMethod === 'Card') {
        // 1. Create Razorpay Order
        const rzpOrderRes = await fetch('http://localhost:5000/api/b2b/razorpay/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
          body: JSON.stringify({ amount: total })
        });
        const rzpOrderData = await rzpOrderRes.json();
        if (!rzpOrderRes.ok) throw new Error(rzpOrderData.message);

        // 2. Open Razorpay Checkout
        transactionId = await handleRazorpayPayment(rzpOrderData);
      }

      // 3. Finalize Order
      const res = await fetch('http://localhost:5000/api/b2b/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ cart, total, paymentMethod, addressData, transactionId })
      });
      if (res.ok) {
        alert('Order Placed Successfully!');
        onClearCart();
        onOrderSuccess();
      } else {
        const err = await res.json();
        alert('Checkout failed: ' + err.message);
      }
    } catch (e) {
      console.error(e);
      alert('Checkout failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1500, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
      <div style={{ background: '#fff', width: '500px', maxWidth: '95%', borderRadius: '28px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        {/* Header */}
        <div style={{ padding: '2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Business Checkout</h3>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              {[1, 2, 3].map(s => (
                <div key={s} style={{ width: s === step ? '20px' : '8px', height: '8px', borderRadius: '4px', background: s === step ? '#3b82f6' : '#e2e8f0', transition: 'all 0.3s' }}></div>
              ))}
            </div>
          </div>
          <X size={24} style={{ cursor: 'pointer', color: '#94a3b8' }} onClick={onClose} />
        </div>

        {/* Content */}
        <div style={{ padding: '2rem', maxHeight: '60vh', overflowY: 'auto' }}>
          {step === 1 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <h4 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>1. Address & Contact Details</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px', color: '#64748b' }}>Full Name</label>
                  <input value={addressData.fullName} onChange={e => setAddressData({ ...addressData, fullName: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0' }} placeholder="Enter full name" />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px', color: '#64748b' }}>Company Name (Optional)</label>
                  <input value={addressData.companyName} onChange={e => setAddressData({ ...addressData, companyName: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0' }} placeholder="Enter company name" />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px', color: '#64748b' }}>Country / Region</label>
                  <select value={addressData.country} onChange={e => setAddressData({ ...addressData, country: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff' }}>
                    <option value="India">India</option>
                    <option value="USA">USA</option>
                    <option value="UAE">UAE</option>
                    <option value="Singapore">Singapore</option>
                  </select>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px', color: '#64748b' }}>House No / Flat / Building / Apartment</label>
                  <input value={addressData.houseDetails} onChange={e => setAddressData({ ...addressData, houseDetails: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0' }} placeholder="e.g. Flat 101, Galaxy Apts" />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px', color: '#64748b' }}>Area / Village / Sector / Street</label>
                  <input value={addressData.areaDetails} onChange={e => setAddressData({ ...addressData, areaDetails: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0' }} placeholder="e.g. Bandra West, Hill Road" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px', color: '#64748b' }}>Landmark</label>
                  <input value={addressData.landmark} onChange={e => setAddressData({ ...addressData, landmark: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0' }} placeholder="e.g. Near City Mall" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px', color: '#64748b' }}>Pincode</label>
                  <input value={addressData.pincode} onChange={e => setAddressData({ ...addressData, pincode: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0' }} placeholder="6 digits" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px', color: '#64748b' }}>Town / City</label>
                  <input value={addressData.city} onChange={e => setAddressData({ ...addressData, city: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0' }} placeholder="City" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px', color: '#64748b' }}>State</label>
                  <input value={addressData.state} onChange={e => setAddressData({ ...addressData, state: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0' }} placeholder="State" />
                </div>
                <div style={{ gridColumn: 'span 2', borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <h5 style={{ margin: '0 0 1rem 0' }}>Contact Details</h5>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px', color: '#64748b' }}>Mobile Number</label>
                  <input value={addressData.mobile} onChange={e => setAddressData({ ...addressData, mobile: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0' }} placeholder="10 digits" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px', color: '#64748b' }}>Email ID</label>
                  <input value={addressData.email} onChange={e => setAddressData({ ...addressData, email: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0' }} placeholder="email@example.com" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <h4 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>2. Order Summary</h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                {cart.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: idx === cart.length - 1 ? 'none' : '1px solid #e2e8f0' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Qty: {item.cartQuantity} x ₹{item.price?.toLocaleString()}</div>
                    </div>
                    <div style={{ textAlign: 'right', fontWeight: 700 }}>₹{(item.price * item.cartQuantity).toLocaleString()}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <span style={{ color: '#64748b' }}>Total MRP</span>
                  <span style={{ textDecoration: 'line-through', color: '#94a3b8' }}>₹{mrpTotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <span style={{ color: '#64748b' }}>Discount on MRP</span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>- ₹{discountTotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <span style={{ color: '#64748b' }}>Taxable Amount</span>
                  <span style={{ fontWeight: 600 }}>₹{taxableAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <span style={{ color: '#64748b' }}>GST (18%)</span>
                  <span style={{ fontWeight: 600 }}>₹{totalGst.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <span style={{ color: '#64748b' }}>Delivery Charges</span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>FREE</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px dashed #e2e8f0', paddingTop: '1rem', marginTop: '1rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Total Payable Amount</span>
                  <span style={{ fontWeight: 800, color: '#10b981', fontSize: '1.3rem' }}>₹{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <h4 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>3. Select Payment Method</h4>
              <div style={{ background: '#f0f9ff', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #bae6fd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#0369a1' }}>Total to Pay:</span>
                <span style={{ fontWeight: 800, color: '#0369a1', fontSize: '1.2rem' }}>₹{total.toLocaleString()}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { id: 'UPI', label: 'UPI Payments', sub: 'Google Pay, PhonePe, BHIM', icon: '📱' },
                  { id: 'Card', label: 'Credit / Debit / ATM Card', sub: 'Visa, Mastercard, RuPay', icon: '💳' },
                  { id: 'Wallet', label: 'B2B Credit Wallet', sub: 'Instant pay from your balance', icon: '💰' },
                  { id: 'COD', label: 'Cash on Delivery (COD)', sub: 'Pay when you receive', icon: '🚛' },
                  { id: 'EMI', label: 'EMI Option', sub: 'Flexible monthly installments', icon: '🗓️' }
                ].map(opt => (
                  <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', borderRadius: '16px', border: paymentMethod === opt.id ? '2px solid #3b82f6' : '1px solid #e2e8f0', background: paymentMethod === opt.id ? '#eff6ff' : '#fff', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <input type="radio" value={opt.id} checked={paymentMethod === opt.id} onChange={() => setPaymentMethod(opt.id)} style={{ width: '18px', height: '18px' }} />
                    <div style={{ fontSize: '1.5rem' }}>{opt.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>{opt.label}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{opt.sub}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '2rem', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '1rem' }}>
          {step > 1 && <button onClick={() => setStep(step - 1)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', fontWeight: 700, cursor: 'pointer' }}>Back</button>}
          {step < 3 ? (
            <button onClick={() => setStep(step + 1)} style={{ flex: 2, padding: '12px', borderRadius: '12px', border: 'none', background: '#0f172a', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Next Step</button>
          ) : (
            <button onClick={handleCheckout} disabled={loading} style={{ flex: 2, padding: '12px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
              {loading ? 'Processing...' : 'Complete Bulk Order'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


function CartTab({ cart, removeFromCart, updateQuantity, clearCart, onProceedCheckout }) {
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.cartQuantity), 0);
  const totalGst = cart.reduce((acc, item) => acc + (item.price * item.cartQuantity * (item.gstPercent || 0) / 100), 0);
  const total = subtotal + totalGst;

  return (
    <div className="b2b-card" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3 style={{ margin: 0 }}>Procurement Cart</h3>
        <button onClick={clearCart} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>Clear Cart</button>
      </div>

      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <ShoppingBag size={48} style={{ opacity: 0.1, margin: '0 auto 1.5rem' }} />
          <p style={{ color: '#64748b' }}>Your cart is empty.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cart.map(item => (
              <div key={item._id} style={{ display: 'flex', gap: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ width: '80px', height: '80px', background: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={32} color="#94a3b8" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e293b' }}>{item.name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{item.sellerCompany}</div>
                  <div style={{ marginTop: '0.5rem', fontWeight: 800, color: '#10b981' }}>₹{item.price?.toLocaleString()}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', padding: '5px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <button onClick={() => updateQuantity(item._id, Math.max(1, item.cartQuantity - 1))} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>-</button>
                    <span style={{ fontWeight: 700 }}>{item.cartQuantity}</span>
                    <button onClick={() => updateQuantity(item._id, item.cartQuantity + 1)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>+</button>
                  </div>
                  <button onClick={() => removeFromCart(item._id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '24px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>₹{subtotal.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Estimated GST</span>
              <span style={{ fontWeight: 600 }}>₹{totalGst.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px dashed #e2e8f0', paddingTop: '1rem', marginBottom: '2rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Grand Total</span>
              <span style={{ fontWeight: 800, fontSize: '1.3rem', color: '#10b981' }}>₹{total.toLocaleString()}</span>
            </div>

            <button onClick={onProceedCheckout} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', color: '#fff', fontWeight: 800, cursor: 'pointer', marginBottom: '1rem', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
              Proceed to Checkout
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1.5px solid #64748b', background: '#fff', color: '#64748b', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
                Save Quote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
