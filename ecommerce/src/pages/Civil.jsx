import React, { useState, useEffect, useRef } from 'react';
import './Civil.css';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Building2, Sparkles, Plus, Upload, Lightbulb,
  MapPin, CheckCircle, PieChart, HardHat, NotepadText, Image as ImageIcon, Search,
  Download, FileText, X, Printer, Calendar, Ruler, Layers
} from 'lucide-react';
import {
  BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, PieChart as RechartsPieChart, Pie, Cell
} from 'recharts';

export default function Civil() {
  const projectProgressData = [
    { name: 'Jan', Progress: 30, Target: 40 },
    { name: 'Feb', Progress: 45, Target: 50 },
    { name: 'Mar', Progress: 55, Target: 60 },
    { name: 'Apr', Progress: 65, Target: 70 },
    { name: 'May', Progress: 80, Target: 85 },
  ];

  const [metrics, setMetrics] = useState({ totalProjects: 0, activeSites: 0, totalBudget: 0, totalExpenses: 0 });
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [siteImages, setSiteImages] = useState([]);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [newMaterial, setNewMaterial] = useState({ material: '', totalStock: '', unit: '' });
  const [newInvoice, setNewInvoice] = useState({ description: '', vendor: '', amount: '', date: new Date().toISOString().split('T')[0] });
  const [showSearch, setShowSearch] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [manualProject, setManualProject] = useState({
    projectName: '',
    clientName: '',
    location: '',
    budget: '',
    siteArea: '',
    floors: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });
  const projectReportRef = useRef(null);

  const expenseData = [
    { name: 'Material', value: 850200 },
    { name: 'Labour', value: 420500 },
    { name: 'Machinery', value: 250800 },
    { name: 'Misc', value: 120000 },
  ];
  const COLORS = ['#00f2ff', '#00ff9d', '#ccff00', '#ff0055']; // Neon palette for white theme

  useEffect(() => {
    fetchCivilData();
  }, []);

  const fetchCivilData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };

      const metricsRes = await axios.get('/api/civil/dashboard', config);
      const projectsRes = await axios.get('/api/civil/projects', config);

      setMetrics(metricsRes.data);
      setProjects(projectsRes.data);
      // NOTE: Do NOT auto-set selectedProject here - let callers control that
    } catch (err) {
      console.error('Failed to fetch civil data:', err);
    }
  };

  // On first load, pick first project if none selected
  useEffect(() => {
    fetchCivilData().then(() => setSelectedProject(prev => prev));
  }, []);
  // Just store the file - don't upload yet
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
  };

  const handleAiAnalyze = async (autoFile = null) => {
    try {
      const token = localStorage.getItem('token');
      setUploading(true);
      const fileToSend = autoFile || selectedFile;

      // Ensure budget is clean numeric
      const cleanBudget = String(manualProject.budget || "5000000").replace(/[^\d]/g, '');
      const payloadMeta = { ...manualProject, budget: cleanBudget };

      console.log('Sending Analysis Request with Budget:', cleanBudget);

      let res;
      if (fileToSend) {
        const formData = new FormData();
        formData.append('blueprint', fileToSend);
        formData.append('manualMetadata', JSON.stringify(payloadMeta));
        res = await axios.post('/api/civil/ai-analyze', formData, {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        res = await axios.post('/api/civil/ai-analyze', {
          manualMetadata: JSON.stringify(payloadMeta)
        }, {
          headers: { 'x-auth-token': token }
        });
      }

      await fetchCivilData();
      setSelectedProject(res.data);
      if (!autoFile) setSelectedFile(null);
      if (autoFile) {
        setShowProjectModal(false);
        setManualProject({
          projectName: '',
          clientName: '',
          location: '',
          siteArea: '',
          floors: '',
          budget: '',
          notes: '',
          date: new Date().toISOString().split('T')[0]
        });
      }
    } catch (err) {
      console.error('Failed to run AI analysis:', err);
      alert('Analysis failed: ' + (err.response?.data || err.message));
    } finally {
      setUploading(false);
    }
  };

  const generateProjectPdf = async (shouldAnalyze = false) => {
    if (!manualProject.projectName) return alert('Please enter project name');

    // Switch to report view temporarily if needed? 
    // We'll use the hidden ref approach
    const element = projectReportRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      const fileName = `${manualProject.projectName.replace(/\s+/g, '_')}_Design_Report.pdf`;

      if (shouldAnalyze) {
        const pdfBlob = pdf.output('blob');
        const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
        handleAiAnalyze(pdfFile);
      } else {
        pdf.save(fileName);
      }
    } catch (err) {
      console.error('PDF Generation failed:', err);
    }
  };

  const handleClearProjects = async () => {
    if (!window.confirm('Delete ALL projects from the database? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete('/api/civil/projects/clear', {
        headers: { 'x-auth-token': token }
      });
      setProjects([]);
      setSelectedProject(null);
      setMetrics({ totalProjects: 0, activeSites: 0, totalBudget: 0, totalExpenses: 0 });
    } catch (err) {
      alert('Clear failed: ' + err.message);
    }
  };

  // Site image upload handler
  const handleSiteImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => setSiteImages(prev => [...prev, { url: ev.target.result, name: file.name, date: new Date().toLocaleDateString('en-IN') }]);
      reader.readAsDataURL(file);
    });
    e.target.value = null;
  };

  const handleAddMaterial = () => {
    if (!newMaterial.material || !newMaterial.totalStock) return;
    setSelectedProject(prev => ({
      ...prev,
      materials: [...(prev?.materials || []), { material: newMaterial.material, totalStock: Number(newMaterial.totalStock), used: 0, unit: newMaterial.unit || 'units' }]
    }));
    setNewMaterial({ material: '', totalStock: '', unit: '' });
    setShowMaterialModal(false);
  };

  const handleAddInvoice = () => {
    if (!newInvoice.description || !newInvoice.amount) return;
    setInvoices(prev => [...prev, { ...newInvoice, id: Date.now() }]);
    setNewInvoice({ description: '', vendor: '', amount: '', date: new Date().toISOString().split('T')[0] });
    setShowInvoiceModal(false);
  };

  const filteredMaterials = (selectedProject?.materials || []).filter(m =>
    m.material.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="civil-container">

      {/* ===== ZOOM LIGHTBOX MODAL ===== */}
      {/* ===== NEW PROJECT MANUAL FORM MODAL ===== */}
      {showProjectModal && (
        <div className="modal-overlay">
          <div className="modal-card project-modal">
            <div className="modal-header">
              <h2 className="modal-title"><FileText size={20} /> Create New Civil Project</h2>
              <button className="close-btn" onClick={() => setShowProjectModal(false)}><X size={20} /></button>
            </div>

            <div className="modal-body project-form-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Project Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Skyline Residency"
                    value={manualProject.projectName}
                    onChange={(e) => setManualProject({ ...manualProject, projectName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Client Name</label>
                  <input
                    type="text"
                    placeholder="Client Name"
                    value={manualProject.clientName}
                    onChange={(e) => setManualProject({ ...manualProject, clientName: e.target.value })}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Site Location</label>
                  <div className="input-with-icon">
                    <MapPin size={16} className="input-icon" />
                    <input
                      type="text"
                      placeholder="Address..."
                      value={manualProject.location}
                      onChange={(e) => setManualProject({ ...manualProject, location: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Site Area (sq. ft.)</label>
                  <div className="input-with-icon">
                    <Ruler size={16} className="input-icon" />
                    <input
                      type="number"
                      placeholder="e.g. 2400"
                      value={manualProject.siteArea}
                      onChange={(e) => setManualProject({ ...manualProject, siteArea: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Number of Floors</label>
                  <div className="input-with-icon">
                    <Layers size={16} className="input-icon" />
                    <input
                      type="number"
                      placeholder="e.g. 2"
                      value={manualProject.floors}
                      onChange={(e) => setManualProject({ ...manualProject, floors: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Estimated Budget (₹)</label>
                  <input
                    type="number"
                    placeholder="₹"
                    value={manualProject.budget}
                    onChange={(e) => setManualProject({ ...manualProject, budget: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Entry Date</label>
                  <div className="input-with-icon">
                    <Calendar size={16} className="input-icon" />
                    <input
                      type="date"
                      value={manualProject.date}
                      onChange={(e) => setManualProject({ ...manualProject, date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>Design Notes & Requirements</label>
                  <textarea
                    placeholder="Specific requirements for AI to consider..."
                    rows={4}
                    value={manualProject.notes}
                    onChange={(e) => setManualProject({ ...manualProject, notes: e.target.value })}
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="modal-footer project-modal-footer">
              <button className="btn-secondary" onClick={() => setShowProjectModal(false)}>Cancel</button>
              <div className="action-buttons">
                <button className="btn-outline-neon" onClick={() => generateProjectPdf(false)}>
                  <Download size={18} /> Download Report
                </button>
                <button className="btn-primary-neon pulse-shadow" onClick={() => generateProjectPdf(true)}>
                  <Sparkles size={18} /> Save & AI Analyze
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== HIDDEN REPORT SECTION for PDF Capture ===== */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div ref={projectReportRef} className="pdf-report-container">
          <div className="pdf-header">
            <div className="flex-spread">
              <div>
                <h1 className="pdf-main-title">CIVIL CONSTRUCTION DESIGN REPORT</h1>
                <p className="pdf-subtitle">JUPITER CONSTRUCTION MANAGEMENT SYSTEMS</p>
              </div>
              <div className="pdf-date-box">
                <p>Date: {manualProject.date}</p>
                <p>Report ID: {Math.floor(Math.random() * 90000) + 10000}</p>
              </div>
            </div>
          </div>

          <div className="pdf-section">
            <h2 className="pdf-section-title">PROJECT SUMMARY</h2>
            <div className="pdf-grid">
              <div className="pdf-info-item">
                <span className="label">PROJECT NAME:</span>
                <span className="value">{manualProject.projectName || 'N/A'}</span>
              </div>
              <div className="pdf-info-item">
                <span className="label">CLIENT:</span>
                <span className="value">{manualProject.clientName || 'N/A'}</span>
              </div>
              <div className="pdf-info-item">
                <span className="label">LOCATION:</span>
                <span className="value">{manualProject.location || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="pdf-section">
            <h2 className="pdf-section-title">TECHNICAL SPECIFICATIONS</h2>
            <div className="pdf-grid grid-3">
              <div className="pdf-info-item">
                <span className="label">TOTAL SITE AREA:</span>
                <span className="value">{manualProject.siteArea || 'N/A'} sq. ft.</span>
              </div>
              <div className="pdf-info-item">
                <span className="label">LEVELS/FLOORS:</span>
                <span className="value">{manualProject.floors || 'N/A'}</span>
              </div>
              <div className="pdf-info-item">
                <span className="label">ESTIMATED BUDGET:</span>
                <span className="value">₹ {manualProject.budget || '0'}</span>
              </div>
            </div>
          </div>

          <div className="pdf-section">
            <h2 className="pdf-section-title">DESIGN REQUIREMENTS & NOTES</h2>
            <div className="pdf-textbox">
              {manualProject.notes || 'No additional project notes provided.'}
            </div>
          </div>

          <div className="pdf-section">
            <h2 className="pdf-section-title">AI ANALYSIS PRE-REQUISITES</h2>
            <p className="pdf-disclaimer">
              This document is generated for JUPITER AI analysis. All manual parameters defined above will be processed
              by the AI construction engine to generate optimized architectural renders, BOQ schedules, and resource planning.
            </p>
            <div className="pdf-footer-branding">
              <div className="brand-line"></div>
              <p>CONFIDENTIAL | JUPITER CONSTRUCTION PRO</p>
            </div>
          </div>
        </div>
      </div>

      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out', animation: 'fadeIn 0.2s ease'
          }}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <img
              src={zoomedImage}
              alt="AI Architectural Render"
              style={{ maxWidth: '90vw', maxHeight: '82vh', borderRadius: '12px', boxShadow: '0 25px 80px rgba(0,0,0,0.6)', objectFit: 'contain' }}
            />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
              <a
                href={zoomedImage}
                download="AI_Architectural_Render.png"
                style={{ background: '#7c3aed', color: '#fff', padding: '0.6rem 1.4rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}
                onClick={e => e.stopPropagation()}
              >⬇ Download Image</a>
              <button
                onClick={() => setZoomedImage(null)}
                style={{ background: '#334155', color: '#fff', padding: '0.6rem 1.4rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}
              >✕ Close</button>
            </div>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.75rem' }}>Click anywhere outside to close</p>
        </div>
      )}
      {/* Header */}
      <div className="civil-header">
        <div className="civil-title-group">
          <h1 className="civil-title">Civil Construction Management</h1>
          <div className="ai-badge neon-border">
            <Sparkles size={14} color="#00f2ff" /> AI Intelligence
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-primary neon-border-white" onClick={() => setShowProjectModal(true)}>
            <Plus size={18} /> New Project
          </button>
          <button className="btn-ai neon-pulse" onClick={handleAiAnalyze}>
            <Lightbulb size={18} /> AI Design Focus
          </button>
          <button className="btn-clear" onClick={handleClearProjects}>
            🗑 Clear Projects
          </button>
        </div>
      </div>

      <div className="civil-layout">

        {/* LEFT COLUMN (Main Data) */}
        <div className="civil-main">

          <div className="metrics-grid">
            <div className="metric-box">
              <div className="metric-header"><Building2 size={16} /> Total Projects</div>
              <div className="metric-value">{metrics.totalProjects}</div>
              <div className="mini-chart-spark">
                <div style={{ flex: 1, backgroundColor: '#00f2ff', height: '40%', borderRadius: '2px', boxShadow: '0 0 5px #00f2ff' }}></div>
                <div style={{ flex: 1, backgroundColor: '#00f2ff', height: '60%', opacity: 0.6, borderRadius: '2px' }}></div>
                <div style={{ flex: 1, backgroundColor: '#00f2ff', height: '50%', opacity: 0.8, borderRadius: '2px' }}></div>
                <div style={{ flex: 1, backgroundColor: '#00f2ff', height: '80%', borderRadius: '2px', boxShadow: '0 0 8px #00f2ff' }}></div>
              </div>
            </div>
            <div className="metric-box">
              <div className="metric-header"><MapPin size={16} /> Active Sites</div>
              <div className="metric-value">{metrics.activeSites}</div>
              <div className="mini-chart-spark">
                <div style={{ flex: 1, backgroundColor: '#00ff9d', height: '30%', opacity: 0.5, borderRadius: '2px' }}></div>
                <div style={{ flex: 1, backgroundColor: '#00ff9d', height: '50%', opacity: 0.8, borderRadius: '2px' }}></div>
                <div style={{ flex: 1, backgroundColor: '#00ff9d', height: '90%', borderRadius: '2px', boxShadow: '0 0 8px #00ff9d' }}></div>
                <div style={{ flex: 1, backgroundColor: '#00ff9d', height: '60%', opacity: 0.6, borderRadius: '2px' }}></div>
              </div>
            </div>
            <div className="metric-box">
              <div className="metric-header"><PieChart size={16} /> Total Budget</div>
              <div className="metric-value">₹{metrics.totalBudget.toLocaleString('en-IN')}</div>
              <div style={{ height: '30px', marginTop: '10px' }}>
                <svg viewBox="0 0 100 30" width="100%" height="100%" preserveAspectRatio="none">
                  <path d="M0,30 L20,15 L40,20 L60,10 L80,18 L100,5" fill="none" stroke="#ccff00" strokeWidth="3" />
                </svg>
              </div>
            </div>
            <div className="metric-box">
              <div className="metric-header"><PieChart size={16} /> Total Expenses</div>
              <div className="metric-value">₹{metrics.totalExpenses.toLocaleString('en-IN')}</div>
              <div style={{ height: '30px', marginTop: '10px' }}>
                <svg viewBox="0 0 100 30" width="100%" height="100%" preserveAspectRatio="none">
                  <path d="M0,30 L25,22 L50,15 L75,8 L100,0" fill="none" stroke="#ff0055" strokeWidth="3" />
                </svg>
              </div>
            </div>
          </div>

          <div className="civil-card">
            <div className="civil-card-header">
              <h2 className="civil-card-title">Project Overview</h2>
              <div className="search-wrapper">
                <Search className="search-icon" size={18} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search Projects..."
                />
                <button className="btn-primary" style={{ marginLeft: '1rem', background: '#000', color: '#fff' }} onClick={() => setShowProjectModal(true)}>
                  <Plus size={16} /> New Project
                </button>
              </div>
            </div>
            <div className="civil-table-wrapper">
              <table className="civil-table">
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Client</th>
                    <th>Location</th>
                    <th>Budget</th>
                    <th>Status</th>
                    <th>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No projects found. Use AI Design to generate one!</td></tr>
                  ) : projects.map((proj) => (
                    <tr key={proj._id} onClick={() => setSelectedProject(proj)} className={selectedProject?._id === proj._id ? 'active-row' : ''}>
                      <td className="highlight-text">{proj.projectName}</td>
                      <td>{proj.clientName}</td>
                      <td>{proj.location}</td>
                      <td>₹{proj.budget.toLocaleString('en-IN')}</td>
                      <td><span className={`status-pill ${proj.status.toLowerCase()}`}>{proj.status}</span></td>
                      <td>
                        <div className="progress-container">
                          <div className="progress-track">
                            <div className="progress-fill neon-progress" style={{ width: `${proj.progress}%` }}></div>
                          </div>
                          <div className="progress-text">{proj.progress}%</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Grid: BOQ & Material Stack */}
          <div className="civil-subgrid">
            {/* BOQ */}
            <div className="civil-card">
              <div className="civil-card-header">
                <h2 className="civil-card-title">BOQ (Bill of Quantity)</h2>
                <button className="btn-primary" style={{ backgroundColor: '#16a34a', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}>+ Add Item</button>
              </div>
              <table className="civil-table">
                <thead>
                  <tr>
                    <th>Item</th><th>Quantity</th><th>Rate</th><th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProject && selectedProject.boq && selectedProject.boq.map((item, idx) => {
                    const colors = ["blue", "yellow", "green", "red"];
                    return (
                      <tr key={idx}>
                        <td className="highlight-text"><span className={`dot ${colors[idx % colors.length]}`}></span>{item.item}</td>
                        <td>{item.quantityStr}</td>
                        <td>-</td>
                        <td className="highlight-text">₹{item.amount.toLocaleString('en-IN')}</td>
                      </tr>
                    );
                  })}
                  {(!selectedProject || !selectedProject.boq || selectedProject.boq.length === 0) && (
                    <tr><td colSpan="4" style={{ textAlign: 'center', color: '#94a3b8' }}>Run AI Design to extract BoQ automatically</td></tr>
                  )}
                </tbody>
              </table>
              <div className="b2b-total-expense-row">
                Total Expenses: <span className="b2b-total-expense-val">₹{selectedProject?.totalExpenses?.toLocaleString('en-IN') || 0}</span>
              </div>
            </div>

            {/* Material Stack */}
            <div className="civil-card">
              <div className="civil-card-header">
                <h2 className="civil-card-title">Material Stack</h2>
                <button className="btn-primary" style={{ backgroundColor: '#16a34a', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}>+ Add Material</button>
              </div>
              <table className="civil-table">
                <thead>
                  <tr>
                    <th>Material</th><th>Stock</th><th>Used</th><th>Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProject && selectedProject.materials && selectedProject.materials.map((mat, idx) => {
                    const remaining = mat.totalStock - mat.used;
                    const perc = (remaining / mat.totalStock) * 100;
                    return (
                      <tr key={idx}>
                        <td className="highlight-text">{mat.material}</td>
                        <td>{mat.totalStock} {mat.unit}</td>
                        <td>{mat.used}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {remaining}
                            <div style={{ width: `${Math.max(10, Math.min(100, perc))}px`, height: '4px', background: perc > 50 ? '#22c55e' : perc > 20 ? '#eab308' : '#dc2626' }}></div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {(!selectedProject || !selectedProject.materials || selectedProject.materials.length === 0) && (
                    <tr><td colSpan="4" style={{ textAlign: 'center', color: '#94a3b8' }}>No materials tracked for this project.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Grid: Contractors & Site Images */}
          <div className="civil-subgrid">
            {/* Workforce */}
            <div className="civil-card">
              <div className="civil-card-header">
                <h2 className="civil-card-title"><HardHat size={18} /> Workforce Estimation</h2>
                <span className="status planning" style={{ fontSize: '0.8rem' }}>AI Generated</span>
              </div>
              {selectedProject?.workforce ? (
                <table className="civil-table">
                  <tbody>
                    <tr>
                      <td><span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><HardHat size={16} color="#64748b" /> Engineers</span></td>
                      <td className="dim-text">{selectedProject.workforce.engineers || 0} personnel</td>
                      <td><span className="status completed" style={{ backgroundColor: '#bbf7d0' }}>Core Team</span></td>
                    </tr>
                    <tr>
                      <td><span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Building2 size={16} color="#64748b" /> Laborers</span></td>
                      <td className="dim-text">{selectedProject.workforce.laborers || 0} personnel</td>
                      <td><span className="status ongoing" style={{ backgroundColor: '#fef3c7' }}>On-Site</span></td>
                    </tr>
                    <tr>
                      <td><span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><HardHat size={16} color="#64748b" /> Supervisors</span></td>
                      <td className="dim-text">{selectedProject.workforce.supervisors || 0} personnel</td>
                      <td><span className="status completed" style={{ backgroundColor: '#bbf7d0' }}>Management</span></td>
                    </tr>
                    <tr style={{ borderTop: '2px solid #f1f5f9' }}>
                      <td style={{ fontWeight: 700 }}>Est. Duration</td>
                      <td className="highlight-text" colSpan="2">{selectedProject.workforce.estimatedDays || 0} working days</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '1.5rem' }}>Upload a blueprint to get AI workforce estimates</div>
              )}
            </div>

            {/* Site Images & Reports */}
            <div className="civil-card">
              <div className="civil-card-header">
                <h2 className="civil-card-title">Site Images & Reports</h2>
                <label className="site-upload-label">
                  Upload Project File
                  <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleSiteImageUpload} />
                </label>
              </div>

              {/* Image Grid */}
              <div className="site-images-grid">
                {siteImages.length === 0 ? (
                  <>
                    <label style={{ cursor: 'pointer' }}>
                      <div className="site-img-upload-placeholder">
                        <Upload size={24} />
                        <span>Upload Photo</span>
                      </div>
                      <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleSiteImageUpload} />
                    </label>
                    <div className="site-img" style={{ background: '#f1f5f9' }} />
                    <div className="site-img" style={{ background: '#f1f5f9' }} />
                  </>
                ) : (
                  siteImages.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setZoomedImage(img.url)}
                      title={img.name}
                      style={{ cursor: 'zoom-in', borderRadius: '8px', overflow: 'hidden', aspectRatio: '4/3', background: '#e2e8f0', position: 'relative' }}
                    >
                      <img src={img.url} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '0.65rem', padding: '2px 6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{img.date}</div>
                    </div>
                  ))
                )}
              </div>

              {/* Invoices list */}
              {invoices.length > 0 && (
                <div style={{ marginTop: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>Invoices</div>
                  {invoices.map(inv => (
                    <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '4px 0', borderBottom: '1px solid #f8fafc' }}>
                      <span style={{ color: '#0f172a', fontWeight: 500 }}>{inv.description}</span>
                      <span style={{ color: '#dc2626', fontWeight: 700 }}>₹{Number(inv.amount).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                    Total: ₹{invoices.reduce((s, i) => s + Number(i.amount), 0).toLocaleString('en-IN')}
                  </div>
                </div>
              )}

              <div className="site-action-group">
                <button className="site-btn neon-btn-yellow" onClick={() => setShowMaterialModal(true)}>+ Material</button>
                <button className="site-btn neon-btn-blue" onClick={() => setShowSearch(s => !s)}>🔍 Search</button>
                <button className="site-btn neon-btn-red" onClick={() => setShowInvoiceModal(true)}>+ Invoice</button>
              </div>

              {/* Search bar */}
              {showSearch && (
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search materials..."
                  style={{ marginTop: '0.6rem', width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                />
              )}
              {showSearch && searchQuery && (
                <div style={{ marginTop: '0.4rem', background: '#f8fafc', borderRadius: '6px', padding: '0.5rem', fontSize: '0.82rem' }}>
                  {filteredMaterials.length === 0
                    ? <span style={{ color: '#94a3b8' }}>No materials found</span>
                    : filteredMaterials.map((m, i) => (
                      <div key={i} style={{ padding: '3px 0', borderBottom: '1px solid #f1f5f9', color: '#0f172a' }}>
                        <strong>{m.material}</strong> — {m.totalStock} {m.unit}
                      </div>
                    ))
                  }
                </div>
              )}
            </div>

            {/* ===== ADD MATERIAL MODAL ===== */}
            {showMaterialModal && (
              <div onClick={() => setShowMaterialModal(false)} style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', width: '340px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                  <h3 style={{ margin: '0 0 1rem', color: '#0f172a', fontSize: '1rem' }}>➕ Add Material</h3>
                  {[['Material Name', 'material', 'e.g. River Sand'], ['Quantity / Stock', 'totalStock', 'e.g. 500'], ['Unit', 'unit', 'e.g. bags, tons, cbm']].map(([label, key, ph]) => (
                    <div key={key} style={{ marginBottom: '0.75rem' }}>
                      <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '3px' }}>{label}</label>
                      <input value={newMaterial[key]} onChange={e => setNewMaterial(p => ({ ...p, [key]: e.target.value }))} placeholder={ph}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button onClick={handleAddMaterial} style={{ flex: 1, background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.6rem', fontWeight: 700, cursor: 'pointer' }}>Add</button>
                    <button onClick={() => setShowMaterialModal(false)} style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', padding: '0.6rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              </div>
            )}

            {/* ===== ADD INVOICE MODAL ===== */}
            {showInvoiceModal && (
              <div onClick={() => setShowInvoiceModal(false)} style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', width: '360px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                  <h3 style={{ margin: '0 0 1rem', color: '#0f172a', fontSize: '1rem' }}>🧾 Add Invoice</h3>
                  {[['Description', 'description', 'e.g. Steel delivery'], ['Vendor / Supplier', 'vendor', 'e.g. JSW Steel Ltd'], ['Amount (₹)', 'amount', 'e.g. 250000'], ['Date', 'date', '']].map(([label, key, ph]) => (
                    <div key={key} style={{ marginBottom: '0.75rem' }}>
                      <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '3px' }}>{label}</label>
                      <input type={key === 'date' ? 'date' : key === 'amount' ? 'number' : 'text'} value={newInvoice[key]} onChange={e => setNewInvoice(p => ({ ...p, [key]: e.target.value }))} placeholder={ph}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button onClick={handleAddInvoice} style={{ flex: 1, background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.6rem', fontWeight: 700, cursor: 'pointer' }}>Add Invoice</button>
                    <button onClick={() => setShowInvoiceModal(false)} style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', padding: '0.6rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN (AI & Analytics Sidebar) */}
        <div className="civil-sidebar">

          {/* AI Design Focus Card */}
          <div className="civil-card ai-focus-card">
            <h2 className="civil-card-title"><Sparkles size={18} color="#7c3aed" fill="#7c3aed" /> AI Design to 3D/Image</h2>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0.5rem 0 1rem' }}>Transform your PDF or image blueprints into hyper-realistic 3D renders using AI.</p>

            <input
              type="file"
              id="blueprintUpload"
              style={{ display: 'none' }}
              accept=".pdf,image/*"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            <label htmlFor="blueprintUpload">
              <div className="ai-upload-box" style={{
                opacity: uploading ? 0.5 : 1,
                borderColor: selectedFile ? '#7c3aed' : '#cbd5e1',
                backgroundColor: selectedFile ? '#f5f3ff' : '#f8fafc'
              }}>
                <Upload size={24} color={selectedFile ? '#7c3aed' : '#94a3b8'} />
                <span style={{
                  color: selectedFile ? '#7c3aed' : '#64748b',
                  fontWeight: selectedFile ? 600 : 400,
                  fontSize: '0.8rem',
                  textAlign: 'center',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  padding: '0 10px'
                }}>
                  {uploading ? 'Analyzing...' : selectedFile ? `✅ ${selectedFile.name}` : 'Click to Upload Design (PDF/IMG)'}
                </span>
                {selectedFile && !uploading && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Click Generate to analyze</span>}
              </div>
            </label>

            <button className="btn-ai-fill" onClick={handleAiAnalyze} disabled={uploading || !selectedFile} style={{
              opacity: uploading || !selectedFile ? 0.5 : 1,
              background: uploading ? '#7c3aed' : '#000'
            }}>
              <Sparkles size={16} /> {uploading ? 'Thinking Architecture...' : selectedFile ? `ANALYZE: ${selectedFile.name.substring(0, 15)}...` : 'Analyze Design'}
            </button>

            <div className="ai-image-grid">
              {selectedProject?.renderUrls && selectedProject.renderUrls.length > 0 ? (
                selectedProject.renderUrls.map((url, idx) => (
                  <div
                    key={idx}
                    onClick={() => setZoomedImage(url)}
                    title="Click to zoom"
                    style={{
                      position: 'relative', width: '100%', aspectRatio: '4/3',
                      borderRadius: '8px', overflow: 'hidden', background: '#e2e8f0',
                      cursor: 'zoom-in', transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(124,58,237,0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <img
                      src={url}
                      alt={`AI Render ${idx + 1}`}
                      onLoad={(e) => {
                        e.currentTarget.style.opacity = 1;
                        if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.opacity = 0;
                      }}
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1503387762-592dea58ef23?w=800&q=80';
                        if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.opacity = 0;
                      }}
                      style={{
                        width: '100%', height: '100%', objectFit: 'cover',
                        borderRadius: '8px', zIndex: 2, position: 'relative'
                      }}
                    />
                    <div style={{
                      position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '0.75rem', color: '#64748b',
                      background: '#f1f5f9', zIndex: 1, transition: 'opacity 0.3s'
                    }}>
                      Generating architecture...
                    </div>
                    {/* Zoom hint overlay */}
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                      padding: '0.5rem', textAlign: 'center',
                      color: '#fff', fontSize: '0.7rem', fontWeight: 600, zIndex: 3
                    }}>
                      🔍 Click to zoom · AI Generated
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div style={{ width: '100%', aspectRatio: '4/3', borderRadius: '8px', overflow: 'hidden', background: '#e2e8f0' }}>
                    <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop" alt="Sample" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%)', opacity: 0.5 }} />
                  </div>
                  <div style={{ width: '100%', aspectRatio: '4/3', borderRadius: '8px', overflow: 'hidden', background: '#e2e8f0' }}>
                    <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=400&auto=format&fit=crop" alt="Sample" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%)', opacity: 0.5 }} />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Project Progress Graph */}
          <div className="civil-card">
            <h2 className="civil-card-title">Project Progress</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', marginTop: '0.5rem' }}>
              <div style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>Overall Progress: <span style={{ color: '#16a34a', fontWeight: 700 }}>65%</span></div>
              {/* Circular gauge placeholder */}
              <div style={{ width: '45px', height: '45px', borderRadius: '50%', border: '4px solid #f1f5f9', borderTopColor: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>65%</div>
            </div>

            <div className="mini-chart-container" style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={projectProgressData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                  <Bar dataKey="Progress" barSize={15} fill="#00f2ff" radius={[2, 2, 0, 0]} />
                  <Line type="monotone" dataKey="Target" stroke="#ccff00" strokeWidth={3} dot={{ r: 5, fill: '#ccff00', strokeWidth: 0 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Expenses vs Budget Pie Chart */}
          <div className="civil-card">
            <h2 className="civil-card-title">Expenses vs Budget</h2>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>Budget vs Expense</div>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>₹{metrics.totalBudget ? (metrics.totalBudget / 100000).toFixed(1) + 'L' : '0'}</div>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '20px', marginTop: '5px' }}>
                  {/* Fake bar chart for budget */}
                  <div style={{ width: '6px', height: '15px', background: '#22c55e', borderRadius: '1px' }}></div>
                  <div style={{ width: '6px', height: '10px', background: '#22c55e', borderRadius: '1px' }}></div>
                  <div style={{ width: '6px', height: '20px', background: '#22c55e', borderRadius: '1px' }}></div>
                </div>
              </div>
              <div style={{ width: '90px', height: '90px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={40}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Legend Mapping */}
            <div>
              {expenseData.map((item, index) => (
                <div key={item.name} className="legend-item">
                  <div className="legend-name">
                    <span className="dot" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span> {item.name}
                  </div>
                  <div className="legend-val">${item.value.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

        </div> {/* civil-sidebar */}
      </div> {/* civil-layout */}
    </div >
  );
}
