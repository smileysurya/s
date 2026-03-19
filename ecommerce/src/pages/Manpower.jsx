import React, { useState, useRef } from 'react';
import './Manpower.css';
import { CheckCircle2, Search, FileText, ChevronDown, Upload, Briefcase } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const CANDIDATES = [
  {
    id: 1,
    name: 'John D.',
    role: 'Sales Manager',
    company: 'TechCorp Solutions',
    location: 'New York, NY',
    matchPct: 85,
    matchLevel: 'high',
    descMatches: 'Seeking an experienced sales manger to lead and grow our sales team.',
    descCands: 'Experienced in team leadership and strategic sales initiatives. Expert in CRM, negotiation, and client relations.',
    skillsMatch: 69,
    tags: ['CRM', 'Sales Strategy', 'Leadership'],
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d'
  },
  {
    id: 2,
    name: 'Emily S.',
    role: 'Marketing Specialist',
    company: 'Innovate Marketing',
    location: 'Los Angeles, CA',
    matchPct: 78,
    matchLevel: 'med',
    descMatches: 'Looking for a creative marketing specialist with digital marketing skills.',
    descCands: 'Skilled in digital marketing, content creation, and campaign management. Proficient in SEO, Google Analytics, and social media marketing.',
    skillsMatch: 78,
    tags: ['Digital Marketing', 'SEO', 'Google Analytics'],
    avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d'
  },
  {
    id: 3,
    name: 'Marco R.',
    role: 'Project Coordinator',
    company: 'Global Enterprises',
    location: 'Chicago, IL',
    matchPct: 75,
    matchLevel: 'med',
    descMatches: 'Effective in coordinating projects and cross-functional teams.',
    descCands: 'Effective in coordinating projects and cross-functional teams.',
    skillsMatch: 82,
    tags: ['Project Management', 'Jira', 'Agile'],
    avatar: 'https://i.pravatar.cc/150?u=a04258114e29026302d'
  }
];

export default function Manpower() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedData, setAnalyzedData] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [jobDescription, setJobDescription] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const apiKey = import.meta.env.VITE_GROQ_API_KEY;

    if (!apiKey) {
      alert("Groq API key is missing. Please add VITE_GROQ_API_KEY to your .env.local file.");
      return;
    }

    setIsAnalyzing(true);
    setAnalyzedData(null);
    setUploadProgress(10);

    try {
      // 1. Extract Text
      let text = '';
      if (file.name.toLowerCase().endsWith('.pdf')) {
        setUploadProgress(30);
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          fullText += content.items.map(item => item.str).join(' ') + '\n';
        }
        text = fullText;
      } else {
        text = await file.text();
      }

      setUploadProgress(50);
      if (!text.trim()) throw new Error("Could not extract text from the file. Try a different document.");

      // 2. Call Secure Backend API
      const response = await fetch('/api/generic/ai/analyze-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          jobDescription
        })
      });

      setUploadProgress(80);

      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error?.message || "Server Analysis Error");

      let content = data.result;
      content = content.replace(/```json/g, '').replace(/```/g, '').trim();

      const parsed = JSON.parse(content);

      setUploadProgress(100);
      setIsAnalyzing(false);

      setAnalyzedData({
        candidateName: file.name.split('.')[0] || 'Unknown Candidate',
        fitScore: parsed.fitScore || 50,
        roles: parsed.roles || []
      });

    } catch (err) {
      alert("Analysis Failed: " + err.message);
      setIsAnalyzing(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };


  const renderJobMatches = () => (
    <>
      <h2 className="mp-title">Job Matches</h2>
      <p className="mp-subtitle">Review matched job opportunities for candidates.</p>

      <div className="mp-filter-bar">
        <select className="mp-filter-select"><option>Candidate: All</option></select>
        <select className="mp-filter-select"><option>Location: All</option></select>
        <select className="mp-filter-select"><option>Job Category: All</option></select>
        <input type="text" className="mp-filter-input" placeholder="Search jobs..." />
        <button className="mp-btn-search">Search</button>
      </div>

      <div className="mp-cards-list">
        {CANDIDATES.map(c => (
          <div className="mp-card" key={c.id}>
            <div className={`mp-match-badge ${c.matchPct >= 80 ? 'high' : 'med'}`}>
              {c.matchPct}% Match
            </div>

            <div className="mp-job-header">
              <img src={c.avatar} alt={c.name} className="mp-avatar" />
              <div>
                <h3 className="mp-job-role">{c.role}</h3>
                <div className="mp-meta-line"><Briefcase size={14} /> {c.company}</div>
                <div className="mp-meta-line" style={{ marginTop: '2px' }}><span style={{ fontSize: '10px' }}>📍</span> {c.location}</div>
              </div>
            </div>

            <p className="mp-desc">{c.descMatches}</p>

            <div className="mp-card-footer">
              <div className="mp-cand-info">
                <CheckCircle2 fill="#cbd5e1" color="white" size={20} />
                <span>{c.name}</span>
                <span className={`mp-mini-badge ${c.matchPct >= 80 ? 'high' : 'med'}`} style={{ backgroundColor: c.matchPct >= 80 ? '#65a34e' : '#d1a535' }}>
                  {c.matchPct}%
                </span>

                <div className="mp-bar-container" style={{ marginLeft: '1rem' }}>
                  <span className="mp-bar-label">Skills Match: {c.skillsMatch}%</span>
                  <div className="mp-progress-track" style={{ width: '80px' }}>
                    <div className={`mp-progress-fill ${c.skillsMatch >= 80 ? 'high' : c.skillsMatch >= 70 ? 'med' : 'med'}`} style={{ width: `${c.skillsMatch}%` }}></div>
                  </div>
                </div>
              </div>

              <button className={`mp-btn-action ${c.matchPct >= 80 ? 'primary' : ''}`}>
                {c.matchPct >= 80 ? 'Apply Now' : 'View Details'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const renderCandidates = () => (
    <>
      <h2 className="mp-title">Candidates</h2>
      <p className="mp-subtitle">Browse and review potential candidates for job openings.</p>

      <div className="mp-filter-bar">
        <select className="mp-filter-select"><option>Location: All</option></select>
        <select className="mp-filter-select"><option>Job Category: All</option></select>
        <select className="mp-filter-select"><option>Experience Level: All</option></select>
        <input type="text" className="mp-filter-input" placeholder="Search roles..." />
        <button className="mp-btn-search">Search</button>
      </div>

      <div className="mp-cards-list">
        {CANDIDATES.map(c => (
          <div className="mp-card" key={c.id}>
            <div className={`mp-match-badge ${c.matchPct >= 80 ? 'high' : 'med'}`}>
              {c.matchPct}% Match
            </div>

            <div className="mp-job-header">
              <img src={c.avatar} alt={c.name} className="mp-avatar" />
              <div>
                <h3 className="mp-job-role">{c.name}</h3>
                <div className="mp-meta-line" style={{ fontWeight: 500, color: '#1e293b' }}>{c.role}</div>
                <div className="mp-meta-line" style={{ marginTop: '2px' }}><span style={{ fontSize: '10px' }}>📍</span> {c.location}</div>
              </div>
            </div>

            <p className="mp-desc">{c.descCands}</p>

            <div className="mp-card-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
              <div className="mp-tags">
                {c.tags.map(t => <span className="mp-tag" key={t}>{t}</span>)}
              </div>
              <button className="mp-btn-action primary">View Profile</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const renderDashboard = () => (
    <>
      <h2 className="mp-title">Resume Analysis</h2>

      <div className="mp-dash-top">
        {/* Left Upload */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="mp-upload-box" style={{ flex: 1 }}>
            {isAnalyzing ? (
              <div style={{ textAlign: 'center', width: '100%' }}>
                <div className="mp-spinner" style={{ marginBottom: '1rem', border: '4px solid #f3f3f3', borderTop: '4px solid #3b5998', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }}></div>
                <p className="mp-upload-text">Scanning Resume Details...</p>
                <div className="mp-progress-track" style={{ width: '100%', height: '8px' }}>
                  <div className="mp-progress-fill primary" style={{ width: `${Math.min(uploadProgress, 100)}%`, backgroundColor: '#3b5998', transition: 'width 0.3s' }}></div>
                </div>
              </div>
            ) : (
              <>
                <FileText size={64} color="#94a3b8" style={{ marginBottom: '1rem' }} />
                <p className="mp-upload-text">Upload a candidate's resume to analyze suitability for jobs.</p>
                <input type="file" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.doc,.docx,.txt" />
                <button className="mp-btn-search" style={{ padding: '0.75rem 0', width: '100%' }} onClick={() => fileInputRef.current?.click()}>Upload Resume</button>
              </>
            )}
          </div>
          <div style={{ background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b' }}>Target Job Description (Optional):</h3>
            <textarea
              placeholder="Paste custom JD here to score the resume against it..."
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              style={{ padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px', resize: 'vertical', minHeight: '80px', fontSize: '0.85rem', color: '#334155' }}
            />
          </div>
        </div>

        {/* Right Results */}
        <div>
          <h3 className="mp-dash-section-title">Resume Analysis Results</h3>

          {
            !analyzedData && !isAnalyzing && (
              <div style={{ padding: '2rem', textAlign: 'center', background: 'white', borderRadius: '6px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                No resume analyzed yet. Please upload a file to see AI match results.
              </div>
            )
          }

          {
            isAnalyzing && (
              <div style={{ padding: '2rem', textAlign: 'center', background: 'white', opacity: 0.6, borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                Extracting candidate skills and experience...
              </div>
            )
          }

          {
            analyzedData && !isAnalyzing && analyzedData.roles.map((role, idx) => {
              const isHigh = role.match >= 80;
              return (
                <div className="mp-results-card" key={idx}>
                  <div className="mp-result-header"><CheckCircle2 fill="#3b5998" color="white" size={20} /> {role.title}</div>
                  <div className="mp-result-grid">
                    <div className="mp-large-match">
                      <span className={`mp-match-pct-text ${isHigh ? 'high' : 'med'}`}>{role.match}% Match</span>
                      <div className="mp-large-track"><div className={`mp-progress-fill ${isHigh ? 'high' : 'med'}`} style={{ width: `${role.match}%` }}></div></div>
                    </div>
                    <div className="mp-checklist" style={isHigh ? { paddingTop: '1.2rem' } : {}}>
                      {!isHigh && (
                        <div className="mp-check-item">
                          <span className="mp-fit-square"></span> Moderate Fit
                        </div>
                      )}
                      <div className="mp-check-item">
                        <CheckCircle2 fill={isHigh ? "#65a34e" : "#65a34e"} color="white" size={16} /> Skills Match: {role.skills}%
                      </div>
                      <div className="mp-check-item">
                        <CheckCircle2 fill={isHigh ? "#65a34e" : "#d1a535"} color="white" size={16} /> Experience Match: {role.exp}%
                      </div>
                    </div>
                    <button className="mp-btn-action primary">View Details</button>
                  </div>
                </div>
              );
            })
          }
        </div >
      </div >

      <div className="mp-dash-bottom">
        <h3 className="mp-dash-section-title">Candidate Suitability Overview</h3>

        {analyzedData ? (
          <div className="mp-dash-overview-grid">
            {/* Donut Chart */}
            <div className="mp-donut-container" style={{ background: `conic-gradient(#65a34e 0% ${analyzedData.fitScore}%, #e2e8f0 ${analyzedData.fitScore}% 100%)` }}>
              <div className="mp-donut-hole">
                <span className="mp-donut-label">Candidate Fit Score</span>
                <span className="mp-donut-score">{analyzedData.fitScore}%</span>
              </div>
            </div>

            {/* Mini Cards (Showing current analyzed + historical example) */}
            <div className="mp-mini-results-grid">
              <div className="mp-mini-card">
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#3b5998', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  {analyzedData.candidateName.substring(0, 2).toUpperCase()}
                </div>
                <div className="mp-mini-details">
                  <span className="mp-mini-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{analyzedData.candidateName}</span>
                  <div className="mp-mini-bar-wrap">
                    <span className={`mp-mini-badge-pct ${analyzedData.fitScore >= 80 ? 'high' : ''}`}>{analyzedData.fitScore}%</span>
                    <div className="mp-progress-track" style={{ flex: 1, height: '6px' }}><div className={`mp-progress-fill ${analyzedData.fitScore >= 80 ? 'high' : 'med'}`} style={{ width: `${analyzedData.fitScore}%` }}></div></div>
                  </div>
                  <span className="mp-mini-msg"><CheckCircle2 fill={analyzedData.fitScore >= 80 ? "#65a34e" : "#d1a535"} color="white" size={14} /> Suitable for Position</span>
                </div>
              </div>

              <div className="mp-mini-card">
                <img src="https://i.pravatar.cc/150?u=a04258114e29026702d" alt="Emily" className="mp-mini-avatar" />
                <div className="mp-mini-details">
                  <span className="mp-mini-name">Emily S. (Saved)</span>
                  <div className="mp-mini-bar-wrap">
                    <span className="mp-mini-badge-pct high" style={{ color: '#65a34e', backgroundColor: '#f0fdf4' }}>80%</span>
                    <div className="mp-progress-track" style={{ flex: 1, height: '6px' }}><div className="mp-progress-fill high" style={{ width: '80%' }}></div></div>
                  </div>
                  <span className="mp-mini-msg"><CheckCircle2 fill="#65a34e" color="white" size={14} /> Suitable for Position</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ opacity: 0.5 }}>Upload a resume to generate the suitability overview chart.</div>
        )}
      </div>
    </>
  );

  return (
    <div className="mp-container">
      {/* Inner Header matching UI Design */}
      <div className="mp-header">
        <div className="mp-header-left">
          <div className="mp-logo">
            <Briefcase size={22} fill="white" /> Manpower Hire
          </div>
          <div className="mp-tabs">
            {['Dashboard', 'Job Matches', 'Candidates'].map(tab => (
              <button
                key={tab}
                className={`mp-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="mp-header-right">
          <span>Admin</span>
          <img src="https://i.pravatar.cc/150?img=11" alt="admin" className="mp-profile-pic" />
          <ChevronDown size={16} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mp-content">
        {activeTab === 'Dashboard' && renderDashboard()}
        {activeTab === 'Job Matches' && renderJobMatches()}
        {activeTab === 'Candidates' && renderCandidates()}
      </div>
    </div>
  );
}
