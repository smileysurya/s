import React, { useState, useRef, useEffect } from 'react';
import './Agreement.css';
import {
  ChevronDown,
  PenTool,
  Edit,
  Home,
  Key,
  Briefcase,
  Users,
  Construction,
  Paintbrush,
  UserRound,
  ShieldCheck,
  Handshake,
  Truck,
  Package,
  ShoppingCart,
  Check
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import SignatureCanvas from 'react-signature-canvas';

const STATES = ['Karnataka', 'Maharashtra', 'Tamil Nadu', 'Delhi', 'Telangana', 'Gujarat', 'Rajasthan', 'Kerala', 'West Bengal', 'Uttar Pradesh', 'Punjab', 'Haryana', 'Andhra Pradesh', 'Madhya Pradesh', 'Bihar'];

const AGREEMENT_CONFIG = {
  'Property': {
    icon: <Home size={18} />,
    partyALabel: 'Owner / Lessor Name',
    partyBLabel: 'Occupant Name',
    fields: [
      { name: 'propertyAddress', label: 'Property Address', type: 'text', placeholder: 'Full address' },
      { name: 'propertyType', label: 'Property Category', type: 'select', options: ['Plot', 'Building', 'Row House', 'Flat'] },
      { name: 'monthlyRent', label: 'Agreed Consideration (₹)', type: 'text', placeholder: 'e.g. ₹50,00,000' },
      { name: 'governingLaw', label: 'State Jurisdiction', type: 'select', options: STATES },
    ],
  },
  'Rental': {
    icon: <Key size={18} />,
    partyALabel: 'Landlord Name',
    partyBLabel: 'Tenant Name',
    fields: [
      { name: 'propertyAddress', label: 'Rental Address', type: 'text', placeholder: 'Address of the premises' },
      { name: 'monthlyRent', label: 'Monthly Rent (₹)', type: 'text', placeholder: 'e.g. ₹20,000' },
      { name: 'securityDeposit', label: 'Security Deposit (₹)', type: 'text', placeholder: 'e.g. ₹1,00,000' },
      { name: 'noticePeriod', label: 'Notice Period', type: 'select', options: ['1 Month', '2 Months', '3 Months'] },
    ],
  },
  'Business': {
    icon: <Briefcase size={18} />,
    partyALabel: 'Company Name',
    partyBLabel: 'Partner / Client Name',
    fields: [
      { name: 'scope', label: 'Business Objectives', type: 'text', placeholder: 'Nature of business engagement' },
      { name: 'contractValue', label: 'Venture Value (₹)', type: 'text', placeholder: 'e.g. ₹50,00,000' },
    ],
  },
  'Vendor': {
    icon: <Users size={18} />,
    partyALabel: 'Client / Buyer',
    partyBLabel: 'Vendor / Provider',
    fields: [
      { name: 'services', label: 'Services Description', type: 'text', placeholder: 'Scope of work' },
      { name: 'paymentTerms', label: 'Payment Schedule', type: 'select', options: ['Net 30', 'Net 60', 'Milestone based'] },
    ],
  },
  'Civil': {
    icon: <Construction size={18} />,
    partyALabel: 'Contracting Authority',
    partyBLabel: 'Civil Contractor',
    fields: [
      { name: 'projectName', label: 'Project Title', type: 'text', placeholder: 'e.g. Infrastructure Development' },
      { name: 'contractValue', label: 'Tender Value (₹)', type: 'text', placeholder: 'e.g. ₹10,00,00,000' },
    ],
  },
  'Interior': {
    icon: <Paintbrush size={18} />,
    partyALabel: 'Client / Owner',
    partyBLabel: 'Interior Designer/Firm',
    fields: [
      { name: 'scope', label: 'Design Scope', type: 'text', placeholder: 'Residential / Commercial Fit-out' },
      { name: 'contractValue', label: 'Project Budget (₹)', type: 'text', placeholder: 'Estimated cost' },
    ],
  },
  'Employment': {
    icon: <UserRound size={18} />,
    partyALabel: 'Employer / Organization',
    partyBLabel: 'Employee Name',
    fields: [
      { name: 'designation', label: 'Designation', type: 'text', placeholder: 'Position title' },
      { name: 'monthlyRent', label: 'Monthly Salary (₹)', type: 'text', placeholder: 'Gross CTC' },
    ],
  },
  'NDA': {
    icon: <ShieldCheck size={18} />,
    partyALabel: 'Disclosing Party',
    partyBLabel: 'Receiving Party',
    fields: [
      { name: 'scope', label: 'Protected Information', type: 'text', placeholder: 'Proprietary data definition' },
      { name: 'ndaDuration', label: 'Validity Period', type: 'select', options: ['1 Year', '3 Years', 'Indefinite'] },
    ],
  },
  'Partnership': {
    icon: <Handshake size={18} />,
    partyALabel: 'Partner A',
    partyBLabel: 'Partner B',
    fields: [
      { name: 'partnershipName', label: 'Firm Name', type: 'text', placeholder: 'Registered Name' },
      { name: 'profitSharing', label: 'Profit Ratio (%)', type: 'text', placeholder: 'e.g. 50:50' },
    ],
  },
  'Logistics': {
    icon: <Truck size={18} />,
    partyALabel: 'Consignor',
    partyBLabel: 'Carrier / Logistics Firm',
    fields: [
      { name: 'route', label: 'Transit Route', type: 'text', placeholder: 'Origin to Destination' },
      { name: 'penaltyClause', label: 'Transit Terms', type: 'text', placeholder: 'Liability limits' },
    ],
  },
  'Supply': {
    icon: <Package size={18} />,
    partyALabel: 'Purchaser',
    partyBLabel: 'Supplier',
    fields: [
      { name: 'productDesc', label: 'Inventory Details', type: 'text', placeholder: 'Goods description' },
      { name: 'quantity', label: 'Total Volume', type: 'text', placeholder: 'Quantity units' },
    ],
  },
  'Product': {
    icon: <Package size={18} />,
    partyALabel: 'Manufacturer',
    partyBLabel: 'Distributor',
    fields: [
      { name: 'productName', label: 'Product Range', type: 'text', placeholder: 'Brand/Categories' },
      { name: 'warranty', label: 'Warranty Terms', type: 'select', options: ['1 Year', '2 Years', 'Limited'] },
    ],
  },
  'Sales': {
    icon: <ShoppingCart size={18} />,
    partyALabel: 'Seller',
    partyBLabel: 'Buyer',
    fields: [
      { name: 'contractValue', label: 'Sale Price (₹)', type: 'text', placeholder: 'Total consideration' },
      { name: 'paymentTerms', label: 'Mode of Payment', type: 'select', options: ['Full Advance', 'EMI', 'Cash on Delivery'] },
    ],
  },
};

const TYPE_KEYS = Object.keys(AGREEMENT_CONFIG);

/* ─── MAIN COMPONENT ────────────────────────────────────────── */
export default function Agreement() {
  const [selectedType, setSelectedType] = useState(TYPE_KEYS[0]);
  const [partyA, setPartyA] = useState('');
  const [partyB, setPartyB] = useState('');
  const [day, setDay] = useState('10');
  const [month, setMonth] = useState('March');
  const [year, setYear] = useState('2025');
  const [formData, setFormData] = useState({});
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [sig1Data, setSig1Data] = useState(null);
  const [sig2Data, setSig2Data] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const documentRef = useRef();
  const sigPad1 = useRef({});
  const sigPad2 = useRef({});
  const dropdownRef = useRef(null);

  const config = AGREEMENT_CONFIG[selectedType];
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setFormData({});
    setPartyA(''); setPartyB('');
    setIsDropdownOpen(false);
  };

  const handleField = (name, value) => setFormData(p => ({ ...p, [name]: value }));
  const get = (name, fallback = '') => formData[name] ?? fallback;

  const handleDownloadPDF = async () => {
    try {
      const element = documentRef.current;
      let s1 = null, s2 = null;
      if (sigPad1.current?.isEmpty?.() === false) { s1 = sigPad1.current.getCanvas().toDataURL('image/png'); setSig1Data(s1); }
      if (sigPad2.current?.isEmpty?.() === false) { s2 = sigPad2.current.getCanvas().toDataURL('image/png'); setSig2Data(s2); }
      setIsGeneratingPdf(true);
      setTimeout(async () => {
        try {
          const canvas = await html2canvas(element, { scale: 2, useCORS: true });
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pw = pdf.internal.pageSize.getWidth();
          const ph = pdf.internal.pageSize.getHeight();
          let ih = (canvas.height * pw) / canvas.width;
          let fw = pw, fh = ih;
          if (ih > ph - 20) { fh = ph - 20; fw = (canvas.width * fh) / canvas.height; }
          pdf.addImage(imgData, 'PNG', (pw - fw) / 2, 10, fw, fh);
          pdf.save(`${selectedType.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
        } catch (e) { alert('PDF failed: ' + e.message); }
        finally { setIsGeneratingPdf(false); setSig1Data(null); setSig2Data(null); }
      }, 150);
    } catch (e) { alert(e.message); }
  };

  const renderClauses = () => {
    const f = { ...formData };
    const blank = (v) => v || '___________';

    switch (selectedType) {
      case 'Property': return (<>
        <Clause n="1" title="PROPERTY IDENTIFICATION">The Owner / Lessor grants the Occupant rights to the property located at <b>{blank(f.propertyAddress)}</b>, categorized as <b>{blank(f.propertyType)}</b>.</Clause>
        <Clause n="2" title="CONSIDERATION">The agreed consideration for this transaction is <b>{blank(f.monthlyRent)}</b>.</Clause>
        <Clause n="3" title="JURISDICTION">This Agreement is governed by the laws of the State of <b>{blank(f.governingLaw)}</b>.</Clause>
      </>);
      case 'Rental': return (<>
        <Clause n="1" title="DEMISED PREMISES">The Landlord hereby leases the premises at <b>{blank(f.propertyAddress)}</b> to the Tenant for residential/commercial purposes.</Clause>
        <Clause n="2" title="RENT & DEPOSIT">Monthly Rent: <b>{blank(f.monthlyRent)}</b>. Security Deposit: <b>{blank(f.securityDeposit)}</b>, interest-free and refundable upon vacation.</Clause>
        <Clause n="3" title="NOTICE PERIOD">Termination notice of <b>{blank(f.noticePeriod)}</b> is required by either party.</Clause>
      </>);
      case 'Business': return (<>
        <Clause n="1" title="COLLABORATION">The parties agree to collaborate for <b>{blank(f.scope)}</b>.</Clause>
        <Clause n="2" title="VALUATION">The estimated venture value is <b>{blank(f.contractValue)}</b>.</Clause>
      </>);
      case 'Vendor': return (<>
        <Clause n="1" title="PROVISION OF SERVICES">The Vendor agrees to provide <b>{blank(f.services)}</b> to the Client.</Clause>
        <Clause n="2" title="PAYMENT TERMS">Payments shall be made as per <b>{blank(f.paymentTerms)}</b> cycle.</Clause>
      </>);
      case 'Civil': return (<>
        <Clause n="1" title="CONSTRUCTION PROJECT">The Contractor is awarded the project: <b>{blank(f.projectName)}</b>.</Clause>
        <Clause n="2" title="CONTRACT SUM">The total tender value is <b>{blank(f.contractValue)}</b>.</Clause>
      </>);
      case 'Interior': return (<>
        <Clause n="1" title="DESIGN SCOPE">The Designer will execute <b>{blank(f.scope)}</b> for the Client.</Clause>
        <Clause n="2" title="PROJECT COST">The total designer/fit-out budget is <b>{blank(f.contractValue)}</b>.</Clause>
      </>);
      case 'Employment': return (<>
        <Clause n="1" title="APPOINTMENT">The Employee is appointed as <b>{blank(f.designation)}</b> starting from today.</Clause>
        <Clause n="2" title="REMUNERATION">The Monthly Fixed Salary (Gross) is <b>{blank(f.monthlyRent)}</b>.</Clause>
      </>);
      case 'NDA': return (<>
        <Clause n="1" title="CONFIDENTIAL INFORMATION">Confidential Information refers to <b>{blank(f.scope)}</b> disclosed during the term.</Clause>
        <Clause n="2" title="NON-DISCLOSURE">The Receiving Party shall not disclose the info for a period of <b>{blank(f.ndaDuration)}</b>.</Clause>
      </>);
      case 'Partnership': return (<>
        <Clause n="1" title="FIRM NAME">The Partnership shall operate under the name <b>{blank(f.partnershipName)}</b>.</Clause>
        <Clause n="2" title="PROFIT RATIO">Profits and losses shall be shared in the ratio: <b>{blank(f.profitSharing)}</b>.</Clause>
      </>);
      case 'Logistics': return (<>
        <Clause n="1" title="CARRIAGE">The Carrier agrees to transport goods via <b>{blank(f.route)}</b>.</Clause>
        <Clause n="2" title="LIABILITY">Liability for loss or damage is defined as per <b>{blank(f.penaltyClause)}</b>.</Clause>
      </>);
      case 'Supply': return (<>
        <Clause n="1" title="INVENTORY SUPPLY">The Supplier shall provide <b>{blank(f.productDesc)}</b>.</Clause>
        <Clause n="2" title="VOLUME">The total quantity to be supplied is <b>{blank(f.quantity)}</b>.</Clause>
      </>);
      case 'Product': return (<>
        <Clause n="1" title="DISTRIBUTION">The Manufacturer grants rights for <b>{blank(f.productName)}</b>.</Clause>
        <Clause n="2" title="WARRANTY">Total warranty period: <b>{blank(f.warranty)}</b>.</Clause>
      </>);
      case 'Sales': return (<>
        <Clause n="1" title="SALE TRANSACTION">The Seller transfers ownership for a price of <b>{blank(f.contractValue)}</b>.</Clause>
        <Clause n="2" title="SETTLEMENT">Payment mode: <b>{blank(f.paymentTerms)}</b>.</Clause>
      </>);
      default: return null;
    }
  };

  return (
    <div className="agreement-container">
      <div className="agreement-header-top">
        <h1>Agreement Generation</h1>
      </div>

      <div className="agreement-content">
        <div className="agreement-select-card">
          <label>Agreement Type</label>
          <div className="custom-dropdown-wrapper" ref={dropdownRef}>
            <div className="custom-dropdown-selected" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <div className="custom-dropdown-selected-left">
                {config.icon}
                <span>{selectedType} Agreement</span>
              </div>
              <ChevronDown size={18} />
            </div>
            {isDropdownOpen && (
              <div className="custom-dropdown-options">
                {TYPE_KEYS.map(key => (
                  <div
                    key={key}
                    className="custom-dropdown-option"
                    onClick={() => handleTypeChange(key)}
                  >
                    {AGREEMENT_CONFIG[key].icon}
                    <span>{key} Agreement</span>
                    {selectedType === key && <Check size={16} style={{ marginLeft: 'auto' }} />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="agreement-grid">
          <div className="agreement-card">
            <h2 className="agreement-card-title">{config.icon} Details</h2>
            <div className="agreement-card-body">
              <form className="agreement-form" onSubmit={e => e.preventDefault()}>
                <div className="agreement-form-label">Agreement Date</div>
                <div className="agreement-form-row">
                  <div className="agreement-form-group">
                    <SelectWrap label="Day" value={day} onChange={e => setDay(e.target.value)}>{[...Array(31)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}</SelectWrap>
                  </div>
                  <div className="agreement-form-group">
                    <SelectWrap label="Month" value={month} onChange={e => setMonth(e.target.value)}>{['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => <option key={m}>{m}</option>)}</SelectWrap>
                  </div>
                  <div className="agreement-form-group">
                    <SelectWrap label="Year" value={year} onChange={e => setYear(e.target.value)}>{['2024', '2025', '2026'].map(y => <option key={y}>{y}</option>)}</SelectWrap>
                  </div>
                </div>

                <div className="agreement-form-row">
                  <div className="agreement-form-group">
                    <label className="agreement-form-label">{config.partyALabel}</label>
                    <input className="agreement-input" value={partyA} onChange={e => setPartyA(e.target.value)} placeholder="Full legal name" />
                  </div>
                  <div className="agreement-form-group">
                    <label className="agreement-form-label">{config.partyBLabel}</label>
                    <input className="agreement-input" value={partyB} onChange={e => setPartyB(e.target.value)} placeholder="Full legal name" />
                  </div>
                </div>

                {config.fields.map(field => (
                  <div className="agreement-form-group" key={field.name}>
                    <label className="agreement-form-label">{field.label}</label>
                    {field.type === 'select' ? (
                      <SelectWrap value={get(field.name)} onChange={e => handleField(field.name, e.target.value)}>
                        <option value="">— Select —</option>
                        {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </SelectWrap>
                    ) : (
                      <input className="agreement-input" value={get(field.name)} onChange={e => handleField(field.name, e.target.value)} placeholder={field.placeholder} type={field.type} />
                    )}
                  </div>
                ))}

                <div className="agreement-actions">
                  <button className="agreement-btn agreement-btn-orange" onClick={() => alert('Draft Generated')}>Preview Draft</button>
                  <button className="agreement-btn agreement-btn-blue" onClick={handleDownloadPDF}><PenTool size={18} /> Sign & Download</button>
                </div>
              </form>
            </div>
          </div>

          <div className="agreement-card">
            <h2 className="agreement-card-title">Agreement Preview</h2>
            <div className="agreement-preview-container">
              <div className="agreement-document" ref={documentRef}>
                <div className="agreement-doc-banner">{config.emoji} {selectedType.toUpperCase()} AGREEMENT</div>
                <div className="agreement-doc-body">
                  <p>This <strong>{selectedType} Agreement</strong> is made on the <strong>{day}th day of {month}, {year}</strong> between:</p>
                  <div className="agreement-doc-parties">
                    <p><b>{config.partyALabel}:</b> <span className="agreement-doc-party-value">{partyA || '___________'}</span></p>
                    <p><b>{config.partyBLabel}:</b> <span className="agreement-doc-party-value">{partyB || '___________'}</span></p>
                  </div>
                  <hr className="agreement-doc-divider" />
                  {renderClauses()}
                  <div className="agreement-doc-signatures">
                    <div className="agreement-sig-block">
                      <div className="agreement-sig-line" style={{ borderBottom: '2px solid #000', height: '60px', position: 'relative' }}>
                        {isGeneratingPdf && sig1Data ? <img src={sig1Data} alt="sig1" height="60" /> : <SignatureCanvas ref={sigPad1} penColor='black' canvasProps={{ width: 250, height: 60, className: 'sigCanvas' }} />}
                      </div>
                      <div className="agreement-sig-name">Authorized Signatory: {partyA || config.partyALabel}</div>
                    </div>
                    <div className="agreement-sig-block">
                      <div className="agreement-sig-line" style={{ borderBottom: '2px solid #000', height: '60px', position: 'relative' }}>
                        {isGeneratingPdf && sig2Data ? <img src={sig2Data} alt="sig2" height="60" /> : <SignatureCanvas ref={sigPad2} penColor='black' canvasProps={{ width: 250, height: 60, className: 'sigCanvas' }} />}
                      </div>
                      <div className="agreement-sig-name">Authorized Signatory: {partyB || config.partyBLabel}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="agreement-edit-info"><Edit size={16} /> Fill the form to update live</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SelectWrap({ children, value, onChange }) {
  return (
    <div style={{ position: 'relative' }}>
      <select value={value} onChange={onChange} className="agreement-select" style={{ appearance: 'none', paddingRight: '2rem' }}>{children}</select>
      <ChevronDown size={14} color="#64748b" style={{ position: 'absolute', right: '10px', top: '12px', pointerEvents: 'none' }} />
    </div>
  );
}

function Clause({ n, title, children }) {
  return (
    <div className="agreement-doc-section">
      <div className="agreement-doc-section-title">{n}. {title}</div>
      <div className="agreement-doc-clause-text">{children}</div>
    </div>
  );
}
