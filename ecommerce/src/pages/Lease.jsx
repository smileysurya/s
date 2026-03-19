import React, { useState, useRef, useEffect } from 'react';
import './Lease.css';
import {
  ChevronDown,
  MapPin,
  Home,
  Building,
  Handshake,
  Check,
  Printer,
  Download,
  FileSignature,
  PenTool,
  User,
  Calendar
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import SignatureCanvas from 'react-signature-canvas';

const LEASE_CONFIG = {
  'Property & Rental': {
    icon: <Home size={18} />,
    partyALabel: 'Landlord / Lessor Name',
    partyBLabel: 'Tenant / Lessee Name',
    fields: [
      { name: 'propertyAddress', label: 'Property Address', type: 'text', placeholder: 'Full address' },
      { name: 'propertyType', label: 'Property Type', type: 'select', options: ['Residential Flat', 'Independent House', 'Villa', 'Other'] },
      { name: 'rentAmount', label: 'Monthly Rent (₹)', type: 'text', placeholder: 'e.g. ₹25,000' },
      { name: 'securityDeposit', label: 'Security Deposit (₹)', type: 'text', placeholder: 'e.g. ₹1,50,000' },
      { name: 'noticePeriod', label: 'Notice Period', type: 'select', options: ['1 Month', '2 Months', '3 Months'] },
    ],
  },
  'Commercial Lease': {
    icon: <Building size={18} />,
    partyALabel: 'Lessor / Owner Name',
    partyBLabel: 'Lessee / Business Name',
    fields: [
      { name: 'propertyAddress', label: 'Commercial Premises', type: 'text', placeholder: 'Address of the unit' },
      { name: 'monthlyRent', label: 'Monthly Lease Amount (₹)', type: 'text', placeholder: 'e.g. ₹75,000' },
      { name: 'securityDeposit', label: 'Interest-Free Deposit (₹)', type: 'text', placeholder: 'e.g. ₹5,00,000' },
      { name: 'leaseTerm', label: 'Lease Duration', type: 'select', options: ['11 Months', '3 Years', '5 Years', '9 Years'] },
    ],
  },
  'Service Level': {
    icon: <Handshake size={18} />,
    partyALabel: 'Client Name',
    partyBLabel: 'Service Provider Name',
    fields: [
      { name: 'scope', label: 'Scope of Services', type: 'text', placeholder: 'Description of engagement' },
      { name: 'serviceFee', label: 'Service Fee (₹)', type: 'text', placeholder: 'e.g. ₹50,000 per month' },
      { name: 'paymentCycle', label: 'Payment Terms', type: 'select', options: ['Monthly', 'Quarterly', 'Milestone-Based'] },
    ],
  },
};

const LEASE_KEYS = Object.keys(LEASE_CONFIG);

export default function Lease() {
  const [selectedType, setSelectedType] = useState(LEASE_KEYS[0]);
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

  const config = LEASE_CONFIG[selectedType];
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
          pdf.save(`${selectedType.replace(/[^a-zA-Z0-9]/g, '_')}_Agreement.pdf`);
        } catch (e) { alert('PDF failed: ' + e.message); }
        finally { setIsGeneratingPdf(false); setSig1Data(null); setSig2Data(null); }
      }, 150);
    } catch (e) { alert(e.message); }
  };

  const renderClauses = () => {
    const f = { ...formData };
    const blank = (v) => v || '___________';

    switch (selectedType) {
      case 'Property & Rental': return (<>
        <div className="doc-section">
          <div className="doc-section-title">1. DEMISED PREMISES</div>
          <p>The Landlord agrees to lease the property located at <b>{blank(f.propertyAddress)}</b> (Type: <b>{blank(f.propertyType)}</b>) to the Tenant for residential purposes.</p>
        </div>
        <div className="doc-section">
          <div className="doc-section-title">2. RENT & DEPOSIT</div>
          <p>Monthly Rent: <b>{blank(f.rentAmount)}</b>. Security Deposit: <b>{blank(f.securityDeposit)}</b>, interest-free and refundable upon vacation.</p>
        </div>
        <div className="doc-section">
          <div className="doc-section-title">3. NOTICE PERIOD</div>
          <p>Termination notice of <b>{blank(f.noticePeriod)}</b> is required by either party.</p>
        </div>
      </>);
      case 'Commercial Lease': return (<>
        <div className="doc-section">
          <div className="doc-section-title">1. LEASED PREMISES</div>
          <p>The Lessor grants the Lessee rights to occupy <b>{blank(f.propertyAddress)}</b> for commercial operations for a term of <b>{blank(f.leaseTerm)}</b>.</p>
        </div>
        <div className="doc-section">
          <div className="doc-section-title">2. COMMERCIAL TERMS</div>
          <p>Monthly Lease: <b>{blank(f.monthlyRent)}</b>. Security Deposit: <b>{blank(f.securityDeposit)}</b>.</p>
        </div>
      </>);
      case 'Service Level': return (<>
        <div className="doc-section">
          <div className="doc-section-title">1. SERVICE SCOPE</div>
          <p>The Service Provider shall execute <b>{blank(f.scope)}</b> for the Client as per agreed standards.</p>
        </div>
        <div className="doc-section">
          <div className="doc-section-title">2. COMPENSATION</div>
          <p>Service Fee: <b>{blank(f.serviceFee)}</b> payable on a <b>{blank(f.paymentCycle)}</b> basis.</p>
        </div>
      </>);
      default: return null;
    }
  };

  return (
    <div className="agreement-container">
      <header className="agreement-header-top">
        <h1>Agreement Generation</h1>
      </header>

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
              {LEASE_KEYS.map(key => (
                <div key={key} className="custom-dropdown-option" onClick={() => handleTypeChange(key)}>
                  {LEASE_CONFIG[key].icon}
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
              <div className="agreement-form-group">
                <label className="agreement-form-label">Agreement Date</label>
                <div className="agreement-form-row">
                  <select className="agreement-select" value={day} onChange={e => setDay(e.target.value)}>{[...Array(31)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}</select>
                  <select className="agreement-select" value={month} onChange={e => setMonth(e.target.value)}>{['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => <option key={m}>{m}</option>)}</select>
                  <select className="agreement-select" value={year} onChange={e => setYear(e.target.value)}>{['2024', '2025', '2026'].map(y => <option key={y}>{y}</option>)}</select>
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
                <div key={field.name} className="agreement-form-group">
                  <label className="agreement-form-label">{field.label}</label>
                  {field.type === 'select' ? (
                    <select className="agreement-select" value={get(field.name)} onChange={e => handleField(field.name, e.target.value)}>
                      <option value="">Select Option</option>
                      {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input className="agreement-input" value={get(field.name)} onChange={e => handleField(field.name, e.target.value)} placeholder={field.placeholder} />
                  )}
                </div>
              ))}

              <div className="agreement-actions">
                <button className="agreement-btn agreement-btn-orange" onClick={() => window.print()}>Print Draft</button>
                <button className="agreement-btn agreement-btn-blue" onClick={handleDownloadPDF}>
                  <Download size={18} />
                  Sign & Download
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="agreement-preview-container">
          <div className="agreement-document" ref={documentRef}>
            <div className="agreement-doc-banner">
              <h2>{selectedType.toUpperCase()} AGREEMENT</h2>
            </div>

            <div className="agreement-doc-body">
              <p>This <b>{selectedType} Agreement</b> is executed on <b>{day}th {month}, {year}</b> between:</p>

              <div className="agreement-doc-section">
                <p><b>PARTY A:</b> <span className="agreement-doc-party-value">{partyA || config.partyALabel}</span></p>
                <p><b>PARTY B:</b> <span className="agreement-doc-party-value">{partyB || config.partyBLabel}</span></p>
              </div>

              <hr className="agreement-doc-divider" />

              {renderClauses()}

              <div className="agreement-doc-signatures">
                <div className="agreement-sig-block">
                  <div style={{ borderBottom: '2px solid #000', height: '60px', position: 'relative' }}>
                    {isGeneratingPdf && sig1Data ? <img src={sig1Data} alt="sig1" height="60" /> : <SignatureCanvas ref={sigPad1} penColor='black' canvasProps={{ width: 250, height: 60, className: 'sigCanvas' }} />}
                  </div>
                  <div className="agreement-sig-name">Authorized Signatory: {partyA || config.partyALabel}</div>
                </div>
                <div className="agreement-sig-block">
                  <div style={{ borderBottom: '2px solid #000', height: '60px', position: 'relative' }}>
                    {isGeneratingPdf && sig2Data ? <img src={sig2Data} alt="sig2" height="60" /> : <SignatureCanvas ref={sigPad2} penColor='black' canvasProps={{ width: 250, height: 60, className: 'sigCanvas' }} />}
                  </div>
                  <div className="agreement-sig-name">Authorized Signatory: {partyB || config.partyBLabel}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
