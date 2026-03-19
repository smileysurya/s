import { useMemo, useState } from "react";
import { BriefcaseBusiness, Search, Users, Building2, Bookmark, Send, Target } from "lucide-react";
import { getCatalog } from "../data/marketplace";
import "./JobPortal.css";

const recruiterTabs = ["Dashboard", "Open Roles", "Candidates", "Pipeline"];
const seekerTabs = ["Dashboard", "Jobs", "Applications", "Saved"];

const candidates = [
  {
    id: "cand-1",
    name: "Aarav Mehta",
    role: "Sales Executive",
    experience: "4 years",
    location: "Bengaluru",
    skills: ["B2B Sales", "CRM", "Lead Gen"],
    match: 92,
    stage: "Interview ready",
  },
  {
    id: "cand-2",
    name: "Nisha Reddy",
    role: "Procurement Analyst",
    experience: "3 years",
    location: "Hyderabad",
    skills: ["Vendor Ops", "Excel", "Negotiation"],
    match: 87,
    stage: "Shortlisted",
  },
  {
    id: "cand-3",
    name: "Farhan Ali",
    role: "Fashion Merchandiser",
    experience: "5 years",
    location: "Mumbai",
    skills: ["Retail Planning", "Sourcing", "Assortment"],
    match: 84,
    stage: "Screening",
  },
];

const seekerApplications = [
  { id: "app-1", role: "Sales Executive", company: "Northstar B2B", status: "Interview", updated: "Today" },
  { id: "app-2", role: "Procurement Analyst", company: "Apex Sourcing", status: "Under Review", updated: "1 day ago" },
  { id: "app-3", role: "Fashion Merchandiser", company: "Urban Retail Labs", status: "Profile Shared", updated: "3 days ago" },
];

const savedRoles = [
  { id: "saved-1", role: "Regional Sales Manager", company: "MarketGrid", location: "Pune" },
  { id: "saved-2", role: "Category Buyer", company: "ProcureHub", location: "Chennai" },
];

export default function JobPortal() {
  const [activeRole, setActiveRole] = useState(() => localStorage.getItem("jobportal_active_role") || "recruiter");
  const [activeTab, setActiveTab] = useState("Dashboard");
  const catalog = getCatalog("jobportal");
  const jobs = catalog?.items || [];

  const tabs = activeRole === "recruiter" ? recruiterTabs : seekerTabs;

  const metrics = useMemo(() => {
    if (activeRole === "recruiter") {
      return [
        { label: "Open roles", value: jobs.length.toString(), note: "Roles currently live on your hiring board" },
        { label: "Active candidates", value: candidates.length.toString(), note: "Profiles already matched to your openings" },
        { label: "Fastest stage", value: "2 days", note: "Average time from review to shortlist" },
      ];
    }

    return [
      { label: "Recommended jobs", value: jobs.length.toString(), note: "Roles aligned to your recent searches" },
      { label: "Applications", value: seekerApplications.length.toString(), note: "Track progress without leaving the dashboard" },
      { label: "Saved roles", value: savedRoles.length.toString(), note: "Keep promising roles ready for later" },
    ];
  }, [activeRole, jobs.length]);

  const switchRole = (role) => {
    setActiveRole(role);
    setActiveTab("Dashboard");
    localStorage.setItem("jobportal_active_role", role);
  };

  const roleCopy = activeRole === "recruiter"
    ? {
        title: "Hire with a recruiter-first dashboard.",
        subtitle: "Post openings, review matched candidates, and manage your pipeline from one hiring workspace.",
        sideTitle: "Recruiter flow",
        sideCopy: "Everything a hiring team needs should live on this side: roles, candidates, screening, and pipeline visibility.",
        bullets: [
          "Create and manage open roles",
          "Review candidate quality and match score",
          "Move candidates through pipeline stages",
        ],
      }
    : {
        title: "Search jobs with a candidate-first dashboard.",
        subtitle: "Discover roles, track applications, and keep saved opportunities in a dedicated job-seeker experience.",
        sideTitle: "Job seeker flow",
        sideCopy: "Everything a candidate needs should live on this side: discover jobs, save roles, apply, and track progress.",
        bullets: [
          "Browse recommended job openings",
          "Track interview and review status",
          "Save roles and revisit them later",
        ],
      };

  return (
    <div className="job-portal">
      <section className="job-portal__hero">
        <div className="job-portal__hero-main">
          <div className="job-portal__eyebrow">
            <BriefcaseBusiness size={16} />
            Two-sided job portal
          </div>
          <h1 className="job-portal__title">{roleCopy.title}</h1>
          <p className="job-portal__subtitle">{roleCopy.subtitle}</p>

          <div className="job-portal__role-switch">
            <button
              className={`job-portal__role-btn ${activeRole === "recruiter" ? "active" : ""}`}
              onClick={() => switchRole("recruiter")}
            >
              Recruiter / HR
            </button>
            <button
              className={`job-portal__role-btn ${activeRole === "jobseeker" ? "active" : ""}`}
              onClick={() => switchRole("jobseeker")}
            >
              Job Seeker
            </button>
          </div>
        </div>

        <div className="job-portal__hero-side">
          <h2 className="job-portal__side-title">{roleCopy.sideTitle}</h2>
          <p className="job-portal__side-copy">{roleCopy.sideCopy}</p>
          <div className="job-portal__side-list">
            {roleCopy.bullets.map((bullet) => (
              <div key={bullet} className="job-portal__side-item">
                <strong>{bullet}</strong>
                <span className="job-portal__muted">Designed as a dedicated module area instead of mixing both users into one generic catalog.</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="job-portal__tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`job-portal__tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <section className="job-portal__metrics">
        {metrics.map((metric) => (
          <div key={metric.label} className="job-portal__metric">
            <div className="job-portal__metric-value">{metric.value}</div>
            <div className="job-portal__metric-label">{metric.label}</div>
            <div className="job-portal__metric-note">{metric.note}</div>
          </div>
        ))}
      </section>

      <section className="job-portal__content">
        <div className="job-portal__panel">
          {renderMainPanel(activeRole, activeTab, jobs)}
        </div>
        <div className="job-portal__panel">
          {renderSidePanel(activeRole)}
        </div>
      </section>
    </div>
  );
}

function renderMainPanel(activeRole, activeTab, jobs) {
  if (activeRole === "recruiter") {
    if (activeTab === "Candidates") {
      return (
        <>
          <h3>Matched Candidates</h3>
          <p>Review profiles that align with your active roles and move them into the next stage faster.</p>
          <div className="job-portal__stack">
            {candidates.map((candidate) => (
              <article key={candidate.id} className="job-portal__card">
                <div className="job-portal__card-top">
                  <div>
                    <h4 className="job-portal__card-title">{candidate.name}</h4>
                    <div className="job-portal__card-meta">{candidate.role} | {candidate.experience} | {candidate.location}</div>
                  </div>
                  <span className="job-portal__badge green">{candidate.match}% match</span>
                </div>
                <div className="job-portal__chips">
                  {candidate.skills.map((skill) => (
                    <span key={skill} className="job-portal__chip">{skill}</span>
                  ))}
                </div>
                <div className="job-portal__footer">
                  <span className="job-portal__muted">{candidate.stage}</span>
                  <button className="job-portal__action">View Candidate</button>
                </div>
              </article>
            ))}
          </div>
        </>
      );
    }

    if (activeTab === "Pipeline") {
      return (
        <>
          <h3>Hiring Pipeline</h3>
          <p>Keep the recruiter flow visible so your team can quickly understand candidate movement.</p>
          <div className="job-portal__pipeline">
            {[
              { stage: "Applications Received", count: "128", note: "New profiles waiting for screening." },
              { stage: "Shortlisted", count: "24", note: "Strong fit candidates ready for team review." },
              { stage: "Interview Scheduled", count: "11", note: "Candidates moved into active interviews." },
              { stage: "Offer Stage", count: "4", note: "Final candidates under compensation discussion." },
            ].map((item) => (
              <div key={item.stage} className="job-portal__pipeline-item">
                <strong>{item.stage}</strong>
                <div className="job-portal__metric-value">{item.count}</div>
                <span className="job-portal__muted">{item.note}</span>
              </div>
            ))}
          </div>
        </>
      );
    }

    return (
      <>
        <h3>{activeTab === "Open Roles" ? "Open Roles" : "Recruiter Dashboard"}</h3>
        <p>{activeTab === "Open Roles" ? "Manage live openings and keep role details visible to your hiring team." : "This is the recruiter side of the module, built separately from the job-seeker workflow."}</p>
        <div className="job-portal__stack">
          {jobs.map((job) => (
            <article key={job.id} className="job-portal__card">
              <div className="job-portal__card-top">
                <div>
                  <h4 className="job-portal__card-title">{job.name}</h4>
                  <div className="job-portal__card-meta">{job.category} | {job.color} | {job.size}</div>
                </div>
                <span className="job-portal__badge orange">{job.stock} spots</span>
              </div>
              <p>{job.description}</p>
              <div className="job-portal__footer">
                <span className="job-portal__muted">Annual CTC: Rs. {job.price.toLocaleString()}</span>
                <button className="job-portal__action">Manage Role</button>
              </div>
            </article>
          ))}
        </div>
      </>
    );
  }

  if (activeTab === "Applications") {
    return (
      <>
        <h3>Application Tracker</h3>
        <p>Job seekers should see their own progress clearly, without recruiter-only controls mixed into the same screen.</p>
        <div className="job-portal__stack">
          {seekerApplications.map((application) => (
            <article key={application.id} className="job-portal__card">
              <div className="job-portal__card-top">
                <div>
                  <h4 className="job-portal__card-title">{application.role}</h4>
                  <div className="job-portal__card-meta">{application.company}</div>
                </div>
                <span className="job-portal__badge blue">{application.status}</span>
              </div>
              <div className="job-portal__footer">
                <span className="job-portal__muted">Updated {application.updated}</span>
                <button className="job-portal__action">View Progress</button>
              </div>
            </article>
          ))}
        </div>
      </>
    );
  }

  if (activeTab === "Saved") {
    return (
      <>
        <h3>Saved Jobs</h3>
        <p>Keep promising roles ready for later review and let candidates return without losing context.</p>
        <div className="job-portal__stack">
          {savedRoles.map((role) => (
            <article key={role.id} className="job-portal__card">
              <div className="job-portal__card-top">
                <div>
                  <h4 className="job-portal__card-title">{role.role}</h4>
                  <div className="job-portal__card-meta">{role.company} | {role.location}</div>
                </div>
                <span className="job-portal__badge orange">Saved</span>
              </div>
              <div className="job-portal__footer">
                <span className="job-portal__muted">Ready when you want to apply</span>
                <button className="job-portal__action">Apply Now</button>
              </div>
            </article>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <h3>{activeTab === "Jobs" ? "Recommended Jobs" : "Job Seeker Dashboard"}</h3>
      <p>{activeTab === "Jobs" ? "Browse roles through a candidate-facing experience focused on discovery and fit." : "This is the candidate side of the module, separate from recruiter operations and hiring controls."}</p>
      <div className="job-portal__stack">
        {jobs.map((job) => (
          <article key={job.id} className="job-portal__card">
            <div className="job-portal__card-top">
              <div>
                <h4 className="job-portal__card-title">{job.name}</h4>
                <div className="job-portal__card-meta">{job.category} | {job.color} | {job.size}</div>
              </div>
              <span className="job-portal__badge blue">Match 88%</span>
            </div>
            <p>{job.description}</p>
            <div className="job-portal__chips">
              <span className="job-portal__chip">Hybrid</span>
              <span className="job-portal__chip">Full time</span>
              <span className="job-portal__chip">Rs. {job.price.toLocaleString()}</span>
            </div>
            <div className="job-portal__footer">
              <span className="job-portal__muted">{job.stock} openings live</span>
              <button className="job-portal__action">Apply</button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function renderSidePanel(activeRole) {
  if (activeRole === "recruiter") {
    return (
      <>
        <h3>Quick Actions</h3>
        <p>Recruiter-side tasks should push hiring work forward immediately.</p>
        <div className="job-portal__stack">
          <div className="job-portal__card">
            <h4 className="job-portal__card-title"><Building2 size={16} /> Post a New Role</h4>
            <div className="job-portal__card-meta">Create role requirements, location, and openings.</div>
          </div>
          <div className="job-portal__card">
            <h4 className="job-portal__card-title"><Users size={16} /> Review Candidate Batch</h4>
            <div className="job-portal__card-meta">Open today's matched applicants and shortlist faster.</div>
          </div>
          <div className="job-portal__card">
            <h4 className="job-portal__card-title"><Target size={16} /> Hiring Goal</h4>
            <div className="job-portal__card-meta">Fill 6 priority roles this month across 3 cities.</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <h3>Candidate Tools</h3>
      <p>Job-seeker-side actions should help discovery, applications, and follow-up.</p>
      <div className="job-portal__stack">
        <div className="job-portal__card">
          <h4 className="job-portal__card-title"><Search size={16} /> Search by role or city</h4>
          <div className="job-portal__card-meta">Focus your search on category, experience, and location.</div>
        </div>
        <div className="job-portal__card">
          <h4 className="job-portal__card-title"><Bookmark size={16} /> Save jobs</h4>
          <div className="job-portal__card-meta">Bookmark roles and compare them before applying.</div>
        </div>
        <div className="job-portal__card">
          <h4 className="job-portal__card-title"><Send size={16} /> Track submissions</h4>
          <div className="job-portal__card-meta">Stay updated on interviews, reviews, and next steps.</div>
        </div>
        <div className="job-portal__empty">
          Profile completion can be added here next, so candidates see resume strength before applying.
        </div>
      </div>
    </>
  );
}
