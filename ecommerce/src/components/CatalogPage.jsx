import { useEffect, useMemo, useState } from "react";
import { BarChart3, ClipboardList, Filter, PackageCheck, Search, ShieldCheck, ShoppingBag, Store, Truck, Users, Wallet, X } from "lucide-react";
import { createLocalOrder, getStoredUser } from "../utils/localData";

const emptyFilterState = { query: "", category: "All", size: "All", color: "All", maxPrice: "" };
const buyerTabs = ["Dashboard", "Marketplace", "Orders"];
const sellerTabs = ["Dashboard", "Listings", "Leads", "Performance"];

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const money = (value) => `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;

const buildSnapshot = (catalog) => {
  const top = catalog.items.slice(0, 3);
  return {
    listings: top.map((item, index) => ({
      id: `${catalog.key}-listing-${item.id}`,
      name: item.name,
      category: item.category,
      stock: item.stock,
      price: item.price,
      moq: Math.max(5, Math.min(50, item.stock)),
      status: index === 0 ? "Live" : index === 1 ? "Ready to quote" : "Low stock",
    })),
    leads: top.map((item, index) => ({
      id: `${catalog.key}-lead-${item.id}`,
      buyer: ["Northstar Retail", "Apex Procurement", "BlueGrid Projects"][index] || "Growth Partner",
      request: item.name,
      quantity: `${Math.max(20, item.stock * 2)} units`,
      city: item.color,
      stage: index === 0 ? "Hot lead" : index === 1 ? "Quoted" : "Negotiation",
    })),
  };
};

export default function CatalogPage({ catalog }) {
  const storageKey = `catalog_workspace_${catalog.key}`;
  const roleKey = `catalog_role_${catalog.key}`;
  const snapshot = useMemo(() => buildSnapshot(catalog), [catalog]);
  const [filters, setFilters] = useState(emptyFilterState);
  const [message, setMessage] = useState("");
  const [paymentItem, setPaymentItem] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [activeRole, setActiveRole] = useState(() => localStorage.getItem(roleKey) || "buyer");
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [workspace, setWorkspace] = useState(() => {
    const stored = readJson(storageKey, null);
    return stored || { listings: snapshot.listings, leads: snapshot.leads, buyerOrders: [] };
  });

  useEffect(() => {
    localStorage.setItem(roleKey, activeRole);
  }, [activeRole, roleKey]);

  useEffect(() => {
    writeJson(storageKey, workspace);
  }, [storageKey, workspace]);

  useEffect(() => {
    setWorkspace((current) => ({
      listings: current?.listings?.length ? current.listings : snapshot.listings,
      leads: current?.leads?.length ? current.leads : snapshot.leads,
      buyerOrders: current?.buyerOrders || [],
    }));
  }, [snapshot]);

  const categories = useMemo(() => ["All", ...new Set(catalog.items.map((item) => item.category))], [catalog.items]);
  const sizes = useMemo(() => ["All", ...new Set(catalog.items.map((item) => item.size))], [catalog.items]);
  const colors = useMemo(() => ["All", ...new Set(catalog.items.map((item) => item.color))], [catalog.items]);
  const tabs = activeRole === "buyer" ? buyerTabs : sellerTabs;

  const filteredItems = useMemo(() => {
    return catalog.items.filter((item) => {
      const search = filters.query.toLowerCase();
      const matchesQuery = item.name.toLowerCase().includes(search) || item.description.toLowerCase().includes(search);
      const matchesCategory = filters.category === "All" || item.category === filters.category;
      const matchesSize = filters.size === "All" || item.size === filters.size;
      const matchesColor = filters.color === "All" || item.color === filters.color;
      const matchesPrice = !filters.maxPrice || item.price <= Number(filters.maxPrice);
      return matchesQuery && matchesCategory && matchesSize && matchesColor && matchesPrice;
    });
  }, [catalog.items, filters]);

  const sellerValue = useMemo(
    () => workspace.listings.reduce((sum, item) => sum + item.price * Math.max(item.stock, 1), 0),
    [workspace.listings]
  );

  const buyerMetrics = [
    { label: "Results ready", value: String(filteredItems.length), note: "Matching products for this module." },
    { label: "Module orders", value: String(workspace.buyerOrders.length), note: "Orders created in this workspace." },
    { label: "Fast sourcing", value: catalog.metrics[1]?.value || "Live", note: "Keeps the flow simple and usable." },
  ];

  const sellerMetrics = [
    { label: "Live listings", value: String(workspace.listings.length), note: "Products visible to buyers." },
    { label: "Lead queue", value: String(workspace.leads.length), note: "Requests waiting for action." },
    { label: "Portfolio value", value: money(sellerValue), note: "Stock x price snapshot." },
  ];

  const performanceCards = [
    { label: "Conversion", value: "31%", note: "Quote-to-order movement" },
    { label: "Repeat buyers", value: "12", note: "Returning accounts this month" },
    { label: "Fulfillment SLA", value: "96%", note: "On-time service reliability" },
  ];

  const handleOrder = (item) => {
    const user = getStoredUser();
    if (!user) {
      setMessage("Please login first to create an order.");
      return;
    }

    setPaymentItem(item);
    setPaymentMethod("UPI");
  };

  const confirmPayment = () => {
    const item = paymentItem;
    if (!item) return;
    const user = getStoredUser();
    if (!user) {
      setMessage("Please login first to create an order.");
      setPaymentItem(null);
      return;
    }

    const order = createLocalOrder({
      userId: user.id,
      module: catalog.title,
      itemName: item.name,
      price: item.price,
      quantity: 1,
    });

    setWorkspace((current) => ({
      ...current,
      buyerOrders: [
        {
          id: order._id,
          itemName: item.name,
          status: paymentMethod === "COD" ? "Order placed" : "Payment successful",
          createdAt: order.createdAt,
          price: item.price,
          paymentMethod,
          paymentStatus: paymentMethod === "COD" ? "Pay on delivery" : "Paid",
        },
        ...current.buyerOrders,
      ],
    }));
    setMessage(`${item.name} ordered successfully with ${paymentMethod}.`);
    setPaymentItem(null);
    setActiveRole("buyer");
    setActiveTab("Orders");
  };

  const switchRole = (role) => {
    setActiveRole(role);
    setActiveTab("Dashboard");
    setMessage("");
  };

  return (
    <div style={styles.page}>
      <section style={{ ...styles.hero, background: `linear-gradient(135deg, ${catalog.accent}18, #ffffff 60%, #f8fafc 100%)` }}>
        <div style={styles.heroMain}>
          <div style={{ ...styles.badge, borderColor: `${catalog.accent}55`, color: catalog.accent }}>
            <ShoppingBag size={14} />
            {catalog.title}
          </div>
          <h1 style={styles.title}>{catalog.title}</h1>
          <p style={styles.subtitle}>{catalog.subtitle}</p>

          {(catalog.reference || catalog.buyerFeatures || catalog.sellerFeatures) && (
            <div style={styles.referenceBlock}>
              {catalog.reference ? <div style={styles.referenceText}>Reference inspiration: {catalog.reference}</div> : null}
              <div style={styles.featureWrap}>
                {(catalog.buyerFeatures || []).map((feature) => (
                  <span key={feature} style={styles.featurePill}>{feature}</span>
                ))}
                {(catalog.sellerFeatures || []).slice(0, 2).map((feature) => (
                  <span key={feature} style={{ ...styles.featurePill, background: "#eff6ff", borderColor: "#bfdbfe", color: "#1d4ed8" }}>{feature}</span>
                ))}
              </div>
            </div>
          )}

          <div style={styles.roleRow}>
            <button type="button" onClick={() => switchRole("buyer")} style={{ ...styles.roleButton, ...(activeRole === "buyer" ? { background: catalog.accent, color: "#fff" } : {}) }}>
              <Users size={16} />
              Buyer Workspace
            </button>
            <button type="button" onClick={() => switchRole("seller")} style={{ ...styles.roleButton, ...(activeRole === "seller" ? { background: "#0f172a", color: "#fff" } : {}) }}>
              <Store size={16} />
              Seller Workspace
            </button>
          </div>

          <div style={styles.tabRow}>
            {tabs.map((tab) => (
              <button key={tab} type="button" onClick={() => setActiveTab(tab)} style={{ ...styles.tabButton, ...(activeTab === tab ? styles.tabButtonActive : {}) }}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.heroSide}>
          <div style={styles.sideHeader}>
            <div style={styles.sideHeaderTitle}>
              <ShieldCheck size={18} color={catalog.accent} />
              <strong>{activeRole === "buyer" ? "Buyer overview" : "Seller overview"}</strong>
            </div>
            <span style={styles.sideTag}>{activeRole === "buyer" ? "B2B-style buyer flow" : "B2B-style seller flow"}</span>
          </div>

          <div style={styles.metricsGrid}>
            {(activeRole === "buyer" ? buyerMetrics : sellerMetrics).map((metric) => (
              <div key={metric.label} style={styles.metricCard}>
                <div style={styles.metricValue}>{metric.value}</div>
                <div style={styles.metricLabel}>{metric.label}</div>
                <div style={styles.metricNote}>{metric.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {message ? <div style={styles.message}>{message}</div> : null}

      {activeRole === "buyer" ? (
        <>
          {activeTab === "Dashboard" && <BuyerDashboard accent={catalog.accent} metrics={buyerMetrics} latestOrder={workspace.buyerOrders[0]} onOpenMarketplace={() => setActiveTab("Marketplace")} onOpenOrders={() => setActiveTab("Orders")} />}
          {activeTab === "Marketplace" && (
            <>
              <FilterPanel filters={filters} setFilters={setFilters} categories={categories} sizes={sizes} colors={colors} />
              <div style={styles.resultRow}>
                <strong style={styles.resultCount}>{filteredItems.length} results</strong>
                <span style={styles.resultHint}>Upgraded to feel complete without changing your app identity.</span>
              </div>
              <ProductGrid items={filteredItems} accent={catalog.accent} onOrder={handleOrder} />
            </>
          )}
          {activeTab === "Orders" && <BuyerOrders orders={workspace.buyerOrders} accent={catalog.accent} />}
        </>
      ) : (
        <>
          {activeTab === "Dashboard" && <SellerDashboard metrics={sellerMetrics} leads={workspace.leads} performance={performanceCards} />}
          {activeTab === "Listings" && <SellerListings listings={workspace.listings} accent={catalog.accent} />}
          {activeTab === "Leads" && <SellerLeads leads={workspace.leads} accent={catalog.accent} />}
          {activeTab === "Performance" && <SellerPerformance cards={performanceCards} />}
        </>
      )}

      {paymentItem && (
        <PaymentModal
          item={paymentItem}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          onClose={() => setPaymentItem(null)}
          onConfirm={confirmPayment}
        />
      )}
    </div>
  );
}

function BuyerDashboard({ accent, metrics, latestOrder, onOpenMarketplace, onOpenOrders }) {
  const actions = [
    { icon: <Search size={18} />, title: "Explore catalog", text: "Use filters and pricing to shortlist faster.", action: "Open Marketplace", onClick: onOpenMarketplace },
    { icon: <ClipboardList size={18} />, title: "Track orders", text: "Keep sample orders visible inside the same module.", action: "Open Orders", onClick: onOpenOrders },
    { icon: <Truck size={18} />, title: "Plan sourcing", text: "Stay close to stock, pricing, and supplier readiness.", action: "Buyer ready" },
  ];

  return (
    <section style={styles.contentGrid}>
      <div style={styles.panel}>
        <h3 style={styles.panelTitle}>Buyer command center</h3>
        <p style={styles.panelText}>This module now has a clearer buyer journey instead of only showing a basic catalog.</p>
        <div style={styles.cardGridSmall}>
          {actions.map((item) => (
            <button key={item.title} type="button" onClick={item.onClick} style={styles.quickCard}>
              <div style={{ ...styles.iconWrap, color: accent }}>{item.icon}</div>
              <strong>{item.title}</strong>
              <span style={styles.quickText}>{item.text}</span>
              <span style={{ ...styles.quickLink, color: accent }}>{item.action}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={styles.panel}>
        <h3 style={styles.panelTitle}>Workspace snapshot</h3>
        <div style={styles.stack}>
          {metrics.map((metric) => (
            <div key={metric.label} style={styles.rowCard}>
              <span style={styles.rowLabel}>{metric.label}</span>
              <strong>{metric.value}</strong>
            </div>
          ))}
          <div style={styles.rowCard}>
            <span style={styles.rowLabel}>Latest order</span>
            <strong>{latestOrder?.itemName || "No orders yet"}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

function FilterPanel({ filters, setFilters, categories, sizes, colors }) {
  return (
    <section style={styles.panel}>
      <div style={styles.filterHeader}>
        <div style={styles.filterTitle}>
          <Filter size={16} />
          Marketplace Filters
        </div>
        <button type="button" onClick={() => setFilters(emptyFilterState)} style={styles.resetButton}>
          Reset
        </button>
      </div>

      <div style={styles.filterGrid}>
        <label style={styles.inputWrap}>
          <span style={styles.inputLabel}>Search</span>
          <div style={styles.searchBox}>
            <Search size={16} color="#64748b" />
            <input value={filters.query} onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))} placeholder="Search by name or description" style={styles.input} />
          </div>
        </label>

        <SelectField label="Category" value={filters.category} options={categories} onChange={(value) => setFilters((current) => ({ ...current, category: value }))} />
        <SelectField label="Size" value={filters.size} options={sizes} onChange={(value) => setFilters((current) => ({ ...current, size: value }))} />
        <SelectField label="Color / City" value={filters.color} options={colors} onChange={(value) => setFilters((current) => ({ ...current, color: value }))} />

        <label style={styles.inputWrap}>
          <span style={styles.inputLabel}>Max Price</span>
          <input type="number" value={filters.maxPrice} onChange={(event) => setFilters((current) => ({ ...current, maxPrice: event.target.value }))} placeholder="Any" style={styles.field} />
        </label>
      </div>
    </section>
  );
}

function ProductGrid({ items, accent, onOrder }) {
  return (
    <section style={styles.productGrid}>
      {items.map((item) => (
        <article key={item.id} style={styles.productCard}>
          <div style={{ ...styles.cardTopAccent, background: `linear-gradient(135deg, ${accent}, #111827)` }} />
          <div style={styles.productBody}>
            <div style={styles.productHeader}>
              <div>
                <div style={styles.productMeta}>{item.category} • {item.size}</div>
                <h3 style={styles.productTitle}>{item.name}</h3>
              </div>
              <span style={styles.rating}>{item.rating}</span>
            </div>
            <p style={styles.productText}>{item.description}</p>
            <div style={styles.chipRow}>
              <span style={styles.chip}>{item.color}</span>
              <span style={styles.chip}>Stock {item.stock}</span>
            </div>
            <div style={styles.productFooter}>
              <div>
                <strong style={styles.price}>{money(item.price)}</strong>
                <div style={styles.muted}>Ready for quick ordering</div>
              </div>
              <button type="button" onClick={() => onOrder(item)} style={{ ...styles.primaryButton, background: accent }}>
                Pay Now
              </button>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

function BuyerOrders({ orders, accent }) {
  return (
    <section style={styles.panel}>
      <div style={styles.sectionHeader}>
        <div>
          <h3 style={styles.panelTitle}>Module orders</h3>
          <p style={styles.panelText}>Buyer-side order tracking now lives inside every simple module.</p>
        </div>
        <span style={{ ...styles.countBadge, color: accent }}>{orders.length} active</span>
      </div>
      {orders.length === 0 ? (
        <div style={styles.emptyState}>No sample orders yet. Add an item from Marketplace to populate this section.</div>
      ) : (
        <div style={styles.stack}>
          {orders.map((order) => (
            <div key={order.id} style={styles.rowCardLarge}>
              <div>
                <strong>{order.itemName}</strong>
                <div style={styles.muted}>Created {new Date(order.createdAt).toLocaleDateString("en-IN")}</div>
                <div style={styles.muted}>{order.paymentMethod || "UPI"} • {order.paymentStatus || "Paid"}</div>
              </div>
              <div style={styles.rightCol}>
                <span style={styles.status}>{order.status}</span>
                <strong>{money(order.price)}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function PaymentModal({ item, paymentMethod, setPaymentMethod, onClose, onConfirm }) {
  const methods = [
    { id: "UPI", label: "UPI" },
    { id: "Card", label: "Card" },
    { id: "Wallet", label: "Wallet" },
    { id: "COD", label: "Cash on Delivery" },
  ];

  return (
    <div style={styles.paymentOverlay}>
      <div style={styles.paymentModal}>
        <div style={styles.paymentHeader}>
          <div>
            <h3 style={styles.panelTitle}>Complete payment</h3>
            <p style={styles.panelText}>Choose a payment option for {item.name}.</p>
          </div>
          <button type="button" onClick={onClose} style={styles.closeBtn}>
            <X size={18} />
          </button>
        </div>

        <div style={styles.rowCardLarge}>
          <div>
            <strong>{item.name}</strong>
            <div style={styles.muted}>{item.category} • Stock {item.stock}</div>
          </div>
          <strong>{money(item.price)}</strong>
        </div>

        <div style={styles.stack}>
          {methods.map((method) => (
            <label key={method.id} style={{ ...styles.paymentOption, ...(paymentMethod === method.id ? styles.paymentOptionActive : {}) }}>
              <input type="radio" checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} />
              <span style={styles.paymentLabel}><Wallet size={16} /> {method.label}</span>
            </label>
          ))}
        </div>

        <div style={styles.actionsRow}>
          <button type="button" onClick={onClose} style={styles.secondaryBtn}>Cancel</button>
          <button type="button" onClick={onConfirm} style={styles.primaryCta}>Pay {money(item.price)}</button>
        </div>
      </div>
    </div>
  );
}

function SellerDashboard({ metrics, leads, performance }) {
  return (
    <section style={styles.contentGrid}>
      <div style={styles.panel}>
        <h3 style={styles.panelTitle}>Seller command center</h3>
        <p style={styles.panelText}>A simple B2B-like seller model for all catalog modules.</p>
        <div style={styles.cardGridSmall}>
          {metrics.map((metric) => (
            <div key={metric.label} style={styles.metricPanel}>
              <strong style={styles.bigValue}>{metric.value}</strong>
              <span>{metric.label}</span>
              <span style={styles.quickText}>{metric.note}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.panel}>
        <h3 style={styles.panelTitle}>Lead highlights</h3>
        <div style={styles.stack}>
          {leads.map((lead) => (
            <div key={lead.id} style={styles.rowCardLarge}>
              <div>
                <strong>{lead.buyer}</strong>
                <div style={styles.muted}>{lead.request} • {lead.quantity}</div>
              </div>
              <span style={styles.status}>{lead.stage}</span>
            </div>
          ))}
        </div>
        <div style={styles.cardGridSmall}>
          {performance.map((card) => (
            <div key={card.label} style={styles.metricPanel}>
              <strong style={styles.bigValue}>{card.value}</strong>
              <span>{card.label}</span>
              <span style={styles.quickText}>{card.note}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SellerListings({ listings, accent }) {
  return (
    <section style={styles.panel}>
      <div style={styles.sectionHeader}>
        <div>
          <h3 style={styles.panelTitle}>Seller listings</h3>
          <p style={styles.panelText}>A stronger supplier-facing view for stock and price visibility.</p>
        </div>
        <span style={{ ...styles.countBadge, color: accent }}>{listings.length} listings</span>
      </div>
      <div style={styles.stack}>
        {listings.map((listing) => (
          <div key={listing.id} style={styles.rowCardLarge}>
            <div>
              <strong>{listing.name}</strong>
              <div style={styles.muted}>{listing.category} • MOQ {listing.moq} • Stock {listing.stock}</div>
            </div>
            <div style={styles.rightCol}>
              <span style={styles.status}>{listing.status}</span>
              <strong>{money(listing.price)}</strong>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SellerLeads({ leads, accent }) {
  return (
    <section style={styles.panel}>
      <div style={styles.sectionHeader}>
        <div>
          <h3 style={styles.panelTitle}>Buyer leads</h3>
          <p style={styles.panelText}>Visible demand makes the seller side feel complete, not empty.</p>
        </div>
        <span style={{ ...styles.countBadge, color: accent }}>{leads.length} leads</span>
      </div>
      <div style={styles.stack}>
        {leads.map((lead) => (
          <div key={lead.id} style={styles.rowCardLarge}>
            <div>
              <strong>{lead.buyer}</strong>
              <div style={styles.muted}>{lead.request} • {lead.city} • {lead.quantity}</div>
            </div>
            <span style={styles.status}>{lead.stage}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function SellerPerformance({ cards }) {
  const notes = [
    { icon: <BarChart3 size={18} />, title: "Sales momentum", text: "Track movement from views to quote-ready demand." },
    { icon: <PackageCheck size={18} />, title: "Fulfillment health", text: "Keep service quality visible for every module." },
    { icon: <Truck size={18} />, title: "Operational clarity", text: "Give sellers a clear action surface instead of a plain list." },
  ];

  return (
    <section style={styles.contentGrid}>
      <div style={styles.panel}>
        <h3 style={styles.panelTitle}>Performance overview</h3>
        <div style={styles.cardGridSmall}>
          {cards.map((card) => (
            <div key={card.label} style={styles.metricPanel}>
              <strong style={styles.bigValue}>{card.value}</strong>
              <span>{card.label}</span>
              <span style={styles.quickText}>{card.note}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.panel}>
        <h3 style={styles.panelTitle}>Module readiness</h3>
        <div style={styles.stack}>
          {notes.map((item) => (
            <div key={item.title} style={styles.rowCardLarge}>
              <div style={styles.iconWrap}>{item.icon}</div>
              <div>
                <strong>{item.title}</strong>
                <div style={styles.muted}>{item.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <label style={styles.inputWrap}>
      <span style={styles.inputLabel}>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} style={styles.field}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

const styles = {
  page: { display: "grid", gap: "24px" },
  hero: { borderRadius: "28px", padding: "28px", border: "1px solid #e5e7eb", display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(300px, 0.9fr)", gap: "20px" },
  heroMain: { display: "grid", gap: "16px" },
  heroSide: { background: "rgba(255,255,255,0.86)", border: "1px solid #e2e8f0", borderRadius: "24px", padding: "18px" },
  sideHeader: { display: "grid", gap: "8px", marginBottom: "16px" },
  sideHeaderTitle: { display: "inline-flex", alignItems: "center", gap: "8px", color: "#0f172a" },
  sideTag: { color: "#64748b", fontSize: "0.82rem", fontWeight: 700 },
  referenceBlock: { display: "grid", gap: "10px" },
  referenceText: { color: "#0f172a", fontWeight: 700, fontSize: "0.88rem" },
  featureWrap: { display: "flex", flexWrap: "wrap", gap: "8px" },
  featurePill: { padding: "7px 10px", borderRadius: "999px", border: "1px solid #e2e8f0", background: "#f8fafc", color: "#334155", fontSize: "0.78rem", fontWeight: 700 },
  badge: { display: "inline-flex", alignItems: "center", gap: "8px", border: "1px solid", borderRadius: "999px", padding: "8px 12px", fontSize: "0.85rem", fontWeight: 600, width: "fit-content", background: "#ffffffcc" },
  title: { margin: 0, fontSize: "2.4rem", lineHeight: 1.05, color: "#0f172a" },
  subtitle: { margin: 0, color: "#475569", lineHeight: 1.7, maxWidth: "680px" },
  roleRow: { display: "flex", flexWrap: "wrap", gap: "10px" },
  roleButton: { border: "1px solid #cbd5e1", background: "#fff", color: "#0f172a", borderRadius: "999px", padding: "10px 14px", cursor: "pointer", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "8px" },
  tabRow: { display: "flex", flexWrap: "wrap", gap: "10px" },
  tabButton: { border: "1px solid #dbe3ef", background: "#ffffff", color: "#334155", borderRadius: "14px", padding: "10px 14px", cursor: "pointer", fontWeight: 700 },
  tabButtonActive: { background: "#0f172a", color: "#fff", borderColor: "#0f172a" },
  metricsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "12px" },
  metricCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "20px", padding: "18px" },
  metricValue: { fontSize: "1.2rem", fontWeight: 800, color: "#111827" },
  metricLabel: { marginTop: "6px", color: "#334155", fontWeight: 700, fontSize: "0.85rem" },
  metricNote: { marginTop: "6px", color: "#64748b", fontSize: "0.8rem", lineHeight: 1.5 },
  message: { background: "#ecfeff", border: "1px solid #a5f3fc", color: "#0f766e", borderRadius: "16px", padding: "14px 16px", fontWeight: 600 },
  contentGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "18px" },
  panel: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "24px", padding: "22px", display: "grid", gap: "18px" },
  panelTitle: { margin: 0, fontSize: "1.2rem", color: "#0f172a" },
  panelText: { margin: "6px 0 0", color: "#64748b", lineHeight: 1.6 },
  cardGridSmall: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" },
  quickCard: { border: "1px solid #e2e8f0", background: "#f8fafc", borderRadius: "20px", padding: "18px", display: "grid", gap: "10px", textAlign: "left", cursor: "pointer" },
  metricPanel: { border: "1px solid #e2e8f0", background: "#f8fafc", borderRadius: "20px", padding: "18px", display: "grid", gap: "8px" },
  iconWrap: { width: "40px", height: "40px", borderRadius: "12px", background: "#fff", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" },
  quickText: { color: "#64748b", fontSize: "0.88rem", lineHeight: 1.55 },
  quickLink: { fontWeight: 700, fontSize: "0.88rem" },
  bigValue: { fontSize: "1.35rem", color: "#0f172a" },
  stack: { display: "grid", gap: "12px" },
  rowCard: { display: "flex", justifyContent: "space-between", gap: "12px", padding: "14px 16px", borderRadius: "16px", border: "1px solid #e2e8f0", background: "#f8fafc" },
  rowCardLarge: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "16px", borderRadius: "18px", border: "1px solid #e2e8f0", background: "#f8fafc" },
  rowLabel: { color: "#64748b", fontWeight: 600 },
  muted: { marginTop: "6px", color: "#64748b", fontSize: "0.88rem", lineHeight: 1.5 },
  rightCol: { display: "grid", justifyItems: "end", gap: "6px" },
  status: { display: "inline-flex", alignItems: "center", padding: "7px 10px", borderRadius: "999px", background: "#e2e8f0", color: "#0f172a", fontSize: "0.78rem", fontWeight: 700, whiteSpace: "nowrap" },
  filterHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" },
  filterTitle: { display: "inline-flex", alignItems: "center", gap: "8px", color: "#0f172a", fontWeight: 700 },
  resetButton: { border: "none", background: "#f1f5f9", color: "#0f172a", borderRadius: "999px", padding: "8px 14px", cursor: "pointer", fontWeight: 600 },
  filterGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" },
  inputWrap: { display: "grid", gap: "8px" },
  inputLabel: { fontSize: "0.8rem", color: "#475569", fontWeight: 600 },
  searchBox: { display: "flex", alignItems: "center", gap: "8px", border: "1px solid #cbd5e1", borderRadius: "14px", padding: "0 12px", background: "#fff" },
  input: { width: "100%", border: "none", padding: "12px 0", outline: "none", background: "transparent" },
  field: { width: "100%", border: "1px solid #cbd5e1", borderRadius: "14px", padding: "12px 14px", outline: "none", background: "#fff" },
  resultRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" },
  resultCount: { color: "#334155" },
  resultHint: { color: "#64748b", fontSize: "0.86rem" },
  productGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "18px" },
  productCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "24px", overflow: "hidden", boxShadow: "0 12px 30px rgba(15, 23, 42, 0.04)" },
  cardTopAccent: { height: "90px" },
  productBody: { padding: "18px", display: "grid", gap: "14px" },
  productHeader: { display: "flex", justifyContent: "space-between", gap: "12px" },
  productMeta: { color: "#64748b", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" },
  productTitle: { margin: 0, fontSize: "1.15rem", color: "#0f172a" },
  rating: { minWidth: "40px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "999px", background: "#fff7ed", color: "#c2410c", fontWeight: 700 },
  productText: { margin: 0, color: "#475569", lineHeight: 1.55, minHeight: "48px" },
  chipRow: { display: "flex", gap: "8px", flexWrap: "wrap" },
  chip: { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "999px", padding: "6px 10px", fontSize: "0.78rem", color: "#334155", fontWeight: 600 },
  productFooter: { display: "flex", justifyContent: "space-between", alignItems: "end", gap: "12px" },
  price: { fontSize: "1.15rem", color: "#111827" },
  primaryButton: { border: "none", color: "#fff", padding: "10px 14px", borderRadius: "14px", cursor: "pointer", fontWeight: 700, minWidth: "110px" },
  countBadge: { border: "1px solid currentColor", borderRadius: "999px", padding: "8px 12px", fontWeight: 700 },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "start", gap: "12px", flexWrap: "wrap" },
  emptyState: { border: "1px dashed #cbd5e1", borderRadius: "18px", padding: "32px 20px", textAlign: "center", color: "#64748b", background: "#f8fafc" },
  paymentOverlay: { position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200 },
  paymentModal: { width: "min(520px, 92vw)", background: "#fff", borderRadius: "24px", padding: "22px", display: "grid", gap: "16px", border: "1px solid #e2e8f0" },
  paymentHeader: { display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start" },
  closeBtn: { border: "1px solid #cbd5e1", background: "#fff", borderRadius: "12px", width: "38px", height: "38px", cursor: "pointer" },
  paymentOption: { display: "flex", alignItems: "center", gap: "10px", padding: "14px", borderRadius: "16px", border: "1px solid #dbe3ef", background: "#fff", cursor: "pointer" },
  paymentOptionActive: { borderColor: "#2563eb", background: "#eff6ff" },
  paymentLabel: { display: "inline-flex", alignItems: "center", gap: "8px", fontWeight: 700, color: "#0f172a" },
  actionsRow: { display: "flex", justifyContent: "end", gap: "10px" },
  secondaryBtn: { border: "1px solid #cbd5e1", background: "#fff", borderRadius: "12px", padding: "11px 14px", cursor: "pointer", fontWeight: 700 },
  primaryCta: { border: "none", background: "#2563eb", color: "#fff", borderRadius: "12px", padding: "11px 14px", cursor: "pointer", fontWeight: 800 },
};
