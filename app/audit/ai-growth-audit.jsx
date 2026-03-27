"use client";
import { useState } from "react";

const RS_ICON = "/RS_Only_Purple_Logo_Transparent.png";
const RSN_LOGO = "/RSN_Logo_Purple.png";

const QUESTIONS = [
  {
    id: "reactive",
    category: "TIME LEAKS",
    question: "How much of your week is spent reacting instead of leading?",
    subtitle: "Fires, interruptions, decisions only you can make.",
    options: [
      { label: "Almost none. I have systems in place.", value: 10 },
      { label: "Some, but it is manageable.", value: 7 },
      { label: "A lot. I am constantly pulled in.", value: 4 },
      { label: "Most of my week is reactive.", value: 1 },
    ],
  },
  {
    id: "followup",
    category: "FOLLOW-UP",
    question: "How consistently does your business follow up with leads?",
    subtitle: "Speed, frequency, and whether it happens without you.",
    options: [
      { label: "Automated and reliable.", value: 10 },
      { label: "Mostly consistent with some gaps.", value: 7 },
      { label: "Hit or miss depending on the week.", value: 4 },
      { label: "We lose leads regularly.", value: 1 },
    ],
  },
  {
    id: "owner_dep",
    category: "OWNER DEPENDENCY",
    question: "How much does the business depend on you personally to run?",
    subtitle: "If you disappeared for two weeks, what breaks?",
    options: [
      { label: "It runs without me.", value: 10 },
      { label: "Most things continue. A few stall.", value: 7 },
      { label: "A lot would slow down or stop.", value: 4 },
      { label: "Almost everything depends on me.", value: 1 },
    ],
  },
  {
    id: "sops",
    category: "SYSTEMS AND SOPS",
    question: "How documented are your core processes?",
    subtitle: "Could someone new follow your workflows without asking you?",
    options: [
      { label: "Fully documented and current.", value: 10 },
      { label: "Some documented, some tribal knowledge.", value: 7 },
      { label: "Very little is written down.", value: 4 },
      { label: "Everything lives in my head.", value: 1 },
    ],
  },
  {
    id: "lifecycle",
    category: "CUSTOMER LIFECYCLE",
    question: "How well does your business move customers from lead to loyal?",
    subtitle: "Lead generation through retention and ascension.",
    options: [
      { label: "Smooth end-to-end system.", value: 10 },
      { label: "Strong in some stages, weak in others.", value: 7 },
      { label: "Gaps everywhere. Things fall through.", value: 4 },
      { label: "No real system. It is all manual.", value: 1 },
    ],
  },
  {
    id: "tools",
    category: "TOOL FRAGMENTATION",
    question: "How connected are your business tools and platforms?",
    subtitle: "CRM, email, scheduling, invoicing, project management.",
    options: [
      { label: "Integrated and talking to each other.", value: 10 },
      { label: "Mostly connected with some silos.", value: 7 },
      { label: "Scattered. Lots of manual data entry.", value: 4 },
      { label: "Nothing connects. Total fragmentation.", value: 1 },
    ],
  },
  {
    id: "automation",
    category: "AI AND AUTOMATION",
    question: "How much repetitive work has been automated in your business?",
    subtitle: "Scheduling, follow-ups, reporting, onboarding, reminders.",
    options: [
      { label: "Heavily automated. AI handles a lot.", value: 10 },
      { label: "Some automation in place.", value: 7 },
      { label: "Very little. Mostly manual.", value: 4 },
      { label: "Nothing is automated.", value: 1 },
    ],
  },
  {
    id: "kpis",
    category: "MEASUREMENT",
    question: "Do you know your key numbers without digging for them?",
    subtitle: "Revenue, conversion, response time, retention, costs.",
    options: [
      { label: "Dashboard ready. I see them daily.", value: 10 },
      { label: "I track some, but it takes effort.", value: 7 },
      { label: "I check occasionally. Mostly guessing.", value: 4 },
      { label: "I do not know my numbers.", value: 1 },
    ],
  },
];

const SCORE_RANGES = [
  {
    min: 65, max: 100, label: "ENGINEERED",
    headline: "You are running like an Engineer.",
    body: "Your systems are strong. The next move is optimization. Finding the remaining friction that is hiding margin. A focused AI Audit would surface the final leverage points and protect what you have built.",
  },
  {
    min: 45, max: 64, label: "STRUCTURED",
    headline: "You have structure, but gaps are leaking time.",
    body: "You have built some systems, but key areas still depend on you or run manually. These gaps compound. A full AI Audit maps exactly where to focus your next 90 days for maximum time reclaimed.",
  },
  {
    min: 25, max: 44, label: "REACTIVE",
    headline: "You are operating in reactive mode.",
    body: "Most of your week is spent inside the business instead of leading it. Time is leaking across follow-up, handoffs, and owner-dependent work. An AI Audit exposes the biggest friction points and builds your path from Operator to Engineer.",
  },
  {
    min: 0, max: 24, label: "OVERLOADED",
    headline: "You are carrying the entire business.",
    body: "Almost everything depends on you. Without systems, every growth push creates more chaos. The good news: this is exactly where the biggest gains happen. A full AI Audit gives you a clear 30/90/180/365-day roadmap to margin, time, and freedom.",
  },
];

const GAP_INSIGHTS = {
  reactive: { label: "Time Leaks", fix: "Audit and reclaim reactive hours" },
  followup: { label: "Follow-Up Gaps", fix: "Automate lead response systems" },
  owner_dep: { label: "Owner Dependency", fix: "Delegate and systemize decisions" },
  sops: { label: "Missing SOPs", fix: "Document and standardize workflows" },
  lifecycle: { label: "Lifecycle Gaps", fix: "Map and automate customer journey" },
  tools: { label: "Tool Fragmentation", fix: "Integrate and connect your stack" },
  automation: { label: "Low Automation", fix: "Deploy AI for repetitive work" },
  kpis: { label: "No Measurement", fix: "Build KPI dashboards and reviews" },
};

function getScoreColor(pct) {
  if (pct >= 65) return "#22c55e";
  if (pct >= 45) return "#eab308";
  if (pct >= 25) return "#f97316";
  return "#ef4444";
}

export default function AIGrowthAudit() {
  const [phase, setPhase] = useState("intro");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [contact, setContact] = useState({ name: "", email: "", business: "" });
  const [animating, setAnimating] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
  const maxScore = QUESTIONS.length * 10;
  const pct = Math.round((totalScore / maxScore) * 100);
  const range = SCORE_RANGES.find((r) => pct >= r.min && pct <= r.max) || SCORE_RANGES[3];
  const scoreColor = getScoreColor(pct);

  const weakest = Object.entries(answers)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 3)
    .map(([id]) => ({ id, ...GAP_INSIGHTS[id] }));

  const handleAnswer = (value) => {
    setSelectedOption(value);
    setTimeout(() => {
      setAnimating(true);
      setAnswers((prev) => ({ ...prev, [QUESTIONS[current].id]: value }));
      setTimeout(() => {
        if (current < QUESTIONS.length - 1) {
          setCurrent((c) => c + 1);
        } else {
          setPhase("contact");
        }
        setSelectedOption(null);
        setAnimating(false);
      }, 350);
    }, 200);
  };

  const handleContactSubmit = () => {
    if (contact.name && contact.email) setPhase("results");
  };

  const CheckSvg = () => (
    <svg viewBox="0 0 12 12" fill="none" stroke="#A83AC4" strokeWidth="2" strokeLinecap="round"><path d="M2 6l3 3 5-5"/></svg>
  );

  return (
    <div style={{ background: "#0A0A0F", minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .orb { position: fixed; border-radius: 50%; filter: blur(80px); opacity: 0.12; pointer-events: none; z-index: 0; }
        .orb-1 { width: 500px; height: 500px; background: #A83AC4; top: -100px; left: -150px; animation: of1 20s ease-in-out infinite; }
        .orb-2 { width: 400px; height: 400px; background: #5B21B6; bottom: -80px; right: -120px; animation: of2 25s ease-in-out infinite; }
        .orb-3 { width: 300px; height: 300px; background: #8B3FD9; top: 40%; left: 60%; animation: of3 18s ease-in-out infinite; }
        @keyframes of1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(60px,40px)} }
        @keyframes of2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-50px,-30px)} }
        @keyframes of3 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(-40px,30px)} 66%{transform:translate(30px,-20px)} }

        .tech-grid { position: fixed; inset: 0; background-image: radial-gradient(circle, rgba(168,58,196,0.06) 1px, transparent 1px); background-size: 32px 32px; pointer-events: none; z-index: 0; }

        .wrap { position: relative; z-index: 1; max-width: 680px; margin: 0 auto; padding: 48px 24px; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; font-family: 'Inter', sans-serif; color: #F2F2F2; }

        .brand-mark { text-align: center; margin-bottom: 40px; }
        .brand-logo { max-width: 260px; height: auto; margin: 0 auto; display: block; filter: drop-shadow(0 0 12px rgba(168,58,196,0.3)); }

        .hero-tag { font-size: 11px; font-weight: 600; letter-spacing: 4px; text-transform: uppercase; text-align: center; color: #A83AC4; margin-bottom: 16px; }
        .hero-title { font-size: clamp(30px,5.5vw,46px); font-weight: 800; line-height: 1.1; text-align: center; color: #F2F2F2; margin-bottom: 20px; }
        .gradient-word { background: linear-gradient(135deg,#A83AC4,#5B21B6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .hero-sub { font-size: 17px; color: #87878E; text-align: center; line-height: 1.65; max-width: 520px; margin: 0 auto 36px; }

        .glass-card { background: rgba(16,16,24,0.65); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(168,58,196,0.12); border-radius: 16px; padding: 32px 28px; margin-bottom: 24px; }

        .value-list { list-style: none; padding: 0; max-width: 420px; margin: 0 auto; }
        .value-list li { padding: 10px 0; font-size: 15px; color: #87878E; display: flex; align-items: center; gap: 14px; }
        .check-icon { width: 22px; height: 22px; border-radius: 6px; background: rgba(168,58,196,0.12); border: 1px solid rgba(168,58,196,0.25); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .check-icon svg { width: 12px; height: 12px; }

        .cta-btn { display: block; width: 100%; max-width: 380px; margin: 0 auto; padding: 18px 32px; background: linear-gradient(135deg,#A83AC4,#5B21B6); color: #fff; font-family: 'Inter',sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; border: none; border-radius: 10px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 0 20px rgba(168,58,196,0.2); }
        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 0 40px rgba(168,58,196,0.35); }
        .cta-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }

        .trust-line { text-align: center; margin-top: 14px; font-size: 12px; color: #4a4a52; }

        .progress-track { width: 100%; height: 3px; background: #101018; border-radius: 3px; margin-bottom: 40px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg,#A83AC4,#8B3FD9); border-radius: 3px; transition: width 0.45s ease; }

        .q-counter { font-size: 11px; font-weight: 600; letter-spacing: 3px; color: #4a4a52; text-align: center; margin-bottom: 6px; }
        .q-category { font-size: 11px; font-weight: 700; letter-spacing: 5px; text-transform: uppercase; color: #A83AC4; text-align: center; margin-bottom: 16px; }
        .q-text { font-size: clamp(20px,3.5vw,26px); font-weight: 700; color: #F2F2F2; text-align: center; margin-bottom: 8px; line-height: 1.25; }
        .q-subtitle { font-size: 14px; color: #87878E; text-align: center; margin-bottom: 32px; }

        .option-btn { display: block; width: 100%; padding: 18px 24px; margin-bottom: 10px; background: rgba(16,16,24,0.7); backdrop-filter: blur(12px); border: 1px solid rgba(168,58,196,0.08); border-radius: 10px; color: #F2F2F2; font-family: 'Inter',sans-serif; font-size: 14px; font-weight: 500; text-align: left; cursor: pointer; transition: all 0.2s ease; }
        .option-btn:hover { background: rgba(168,58,196,0.08); border-color: rgba(168,58,196,0.3); transform: translateX(4px); }
        .option-btn.selected { background: rgba(168,58,196,0.15); border-color: #A83AC4; color: #d4a5e0; box-shadow: 0 0 15px rgba(168,58,196,0.15); }

        .fade-out { opacity: 0; transform: translateY(-8px); transition: all 0.35s ease; }
        .fade-in { opacity: 1; transform: translateY(0); transition: all 0.35s ease; }

        .contact-section { text-align: center; }
        .contact-title { font-size: 26px; font-weight: 700; color: #F2F2F2; margin-bottom: 8px; }
        .contact-sub { font-size: 15px; color: #87878E; margin-bottom: 32px; }
        .input-field { display: block; width: 100%; max-width: 400px; margin: 0 auto 14px; padding: 16px 20px; background: rgba(16,16,24,0.8); backdrop-filter: blur(12px); border: 1px solid rgba(168,58,196,0.1); border-radius: 10px; color: #F2F2F2; font-family: 'Inter',sans-serif; font-size: 14px; outline: none; transition: border-color 0.25s; }
        .input-field:focus { border-color: rgba(168,58,196,0.4); box-shadow: 0 0 12px rgba(168,58,196,0.08); }
        .input-field::placeholder { color: #4a4a52; }

        .results-header { text-align: center; margin-bottom: 40px; }
        .full-logo { max-width: 280px; height: auto; margin: 0 auto 32px; display: block; filter: drop-shadow(0 0 16px rgba(168,58,196,0.3)); }
        .score-ring { width: 160px; height: 160px; margin: 0 auto 28px; position: relative; }
        .score-ring svg { transform: rotate(-90deg); }
        .score-number { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .score-val { font-size: 42px; font-weight: 800; line-height: 1; }
        .score-of { font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #4a4a52; margin-top: 4px; }

        .result-badge { display: inline-block; padding: 6px 20px; border-radius: 6px; font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 16px; }
        .result-headline { font-size: 22px; font-weight: 700; color: #F2F2F2; margin-bottom: 14px; line-height: 1.3; }
        .result-body { font-size: 15px; color: #87878E; line-height: 1.7; max-width: 520px; margin: 0 auto; }

        .gaps-section { margin-top: 40px; margin-bottom: 40px; }
        .gaps-title { font-size: 11px; font-weight: 700; letter-spacing: 5px; text-transform: uppercase; color: #87878E; margin-bottom: 20px; text-align: center; }
        .gap-card { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; background: rgba(16,16,24,0.65); backdrop-filter: blur(12px); border-left: 3px solid #A83AC4; border-radius: 0 10px 10px 0; margin-bottom: 10px; }
        .gap-label { font-size: 15px; font-weight: 600; color: #F2F2F2; }
        .gap-fix { font-size: 13px; color: #87878E; margin-top: 3px; }
        .gap-score { font-size: 24px; font-weight: 800; color: #A83AC4; }

        .next-step-box { background: rgba(16,16,24,0.7); backdrop-filter: blur(16px); border: 1px solid rgba(168,58,196,0.15); border-radius: 16px; padding: 36px 32px; text-align: center; position: relative; overflow: hidden; }
        .next-step-box::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg,transparent,#A83AC4,transparent); }
        .next-step-label { font-size: 11px; font-weight: 700; letter-spacing: 5px; text-transform: uppercase; color: #A83AC4; margin-bottom: 14px; }
        .next-step-title { font-size: 22px; font-weight: 700; color: #F2F2F2; margin-bottom: 12px; }
        .next-step-body { font-size: 14px; color: #87878E; line-height: 1.65; margin-bottom: 28px; max-width: 480px; margin-left: auto; margin-right: auto; }

        .tagline { font-size: 10px; font-weight: 600; letter-spacing: 4px; text-transform: uppercase; color: #2a2a32; text-align: center; margin-top: 48px; }
        .divider-line { width: 60px; height: 2px; background: linear-gradient(90deg,#A83AC4,#5B21B6); margin: 0 auto 32px; border-radius: 2px; }

        @media (max-width:480px) {
          .wrap { padding: 32px 16px; }
          .glass-card { padding: 24px 20px; }
          .gap-card { flex-direction: column; align-items: flex-start; gap: 8px; }
          .next-step-box { padding: 28px 20px; }
          .brand-logo { max-width: 180px; }
          .full-logo { max-width: 200px; }
        }
      `}</style>

      <div className="tech-grid" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="wrap">
        {/* Brand Mark */}
        <div className="brand-mark">
          <img src={RSN_LOGO} alt="RazoRSharp Networks" className="brand-logo" />
        </div>

        {/* INTRO */}
        {phase === "intro" && (
          <div>
            <div className="hero-tag">FREE DIAGNOSTIC</div>
            <h1 className="hero-title">
              The Real Obstacle Is Not Growth.<br />
              It Is <span className="gradient-word">TIME.</span>
            </h1>
            <p className="hero-sub">
              8 questions. 2 minutes. An instant diagnostic showing where your
              business is leaking time, losing leads, and depending too much on you.
            </p>
            <div className="glass-card">
              <ul className="value-list">
                <li><span className="check-icon"><CheckSvg /></span>See your biggest operational gaps</li>
                <li><span className="check-icon"><CheckSvg /></span>Get scored across 8 critical areas</li>
                <li><span className="check-icon"><CheckSvg /></span>Know exactly where to focus next</li>
                <li><span className="check-icon"><CheckSvg /></span>No pitch. No pressure. Just clarity.</li>
              </ul>
            </div>
            <button className="cta-btn" onClick={() => setPhase("questions")}>START MY FREE AUDIT</button>
            <p className="trust-line">Takes about 2 minutes. Results are instant.</p>
          </div>
        )}

        {/* QUESTIONS */}
        {phase === "questions" && (
          <div className={animating ? "fade-out" : "fade-in"}>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${((current + 1) / QUESTIONS.length) * 100}%` }} />
            </div>
            <div className="q-counter">{String(current + 1).padStart(2, "0")} / {String(QUESTIONS.length).padStart(2, "0")}</div>
            <div className="q-category">{QUESTIONS[current].category}</div>
            <h2 className="q-text">{QUESTIONS[current].question}</h2>
            <p className="q-subtitle">{QUESTIONS[current].subtitle}</p>
            <div>
              {QUESTIONS[current].options.map((opt) => (
                <button key={opt.value} className={`option-btn ${selectedOption === opt.value ? "selected" : ""}`} onClick={() => handleAnswer(opt.value)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CONTACT */}
        {phase === "contact" && (
          <div className="contact-section">
            <div className="hero-tag">YOUR RESULTS ARE READY</div>
            <h2 className="contact-title">See your full AI Growth Score.</h2>
            <p className="contact-sub">Enter your info to unlock your gap analysis and next steps.</p>
            <div className="divider-line" />
            <input className="input-field" placeholder="Your name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
            <input className="input-field" placeholder="Email address" type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
            <input className="input-field" placeholder="Business name (optional)" value={contact.business} onChange={(e) => setContact({ ...contact, business: e.target.value })} />
            <button className="cta-btn" style={{ marginTop: 12 }} onClick={handleContactSubmit} disabled={!contact.name || !contact.email}>SHOW MY RESULTS</button>
            <p className="trust-line">No spam. No sales call unless you want one.</p>
          </div>
        )}

        {/* RESULTS */}
        {phase === "results" && (
          <div>
            <div className="results-header">
              <img src={RSN_LOGO} alt="RazoRSharp Networks" className="full-logo" />

              <div className="score-ring">
                <svg viewBox="0 0 160 160" width="160" height="160">
                  <circle cx="80" cy="80" r="70" fill="none" stroke="#101018" strokeWidth="7" />
                  <circle cx="80" cy="80" r="70" fill="none" stroke="url(#sg)" strokeWidth="7" strokeLinecap="round"
                    strokeDasharray={`${pct * 4.4} ${440 - pct * 4.4}`} style={{ transition: "stroke-dasharray 1.2s ease" }} />
                  <defs><linearGradient id="sg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#A83AC4" /><stop offset="100%" stopColor="#5B21B6" />
                  </linearGradient></defs>
                </svg>
                <div className="score-number">
                  <span className="score-val" style={{ color: scoreColor }}>{pct}</span>
                  <span className="score-of">OUT OF 100</span>
                </div>
              </div>

              <div className="result-badge" style={{ background: `${scoreColor}15`, color: scoreColor, border: `1px solid ${scoreColor}35` }}>
                {range.label}
              </div>
              <h2 className="result-headline">{range.headline}</h2>
              <p className="result-body">{range.body}</p>
            </div>

            <div className="gaps-section">
              <div className="gaps-title">YOUR TOP 3 GAPS</div>
              {weakest.map((gap) => (
                <div className="gap-card" key={gap.id}>
                  <div>
                    <div className="gap-label">{gap.label}</div>
                    <div className="gap-fix">{gap.fix}</div>
                  </div>
                  <div className="gap-score">{answers[gap.id]}/10</div>
                </div>
              ))}
            </div>

            <div className="next-step-box">
              <div className="next-step-label">YOUR NEXT STEP</div>
              <h3 className="next-step-title">Claim Your Full AI Audit</h3>
              <p className="next-step-body">
                This quick audit surfaced the gaps. A full AI Audit goes deeper.
                It maps time leaks, friction, owner dependency, and automation
                opportunities across your entire operation. You walk away with
                an AI Freedom Plan: your 30/90/180/365-day roadmap to margin,
                time, and freedom.
              </p>
              <button className="cta-btn" onClick={() => window.open("https://aiaudit.razorsharpnetworks.com", "_blank")}>
                CLAIM YOUR AUDIT
              </button>
            </div>

            <p className="tagline">ONE SYSTEM. ONE FLOW. ONE OUTCOME. FREEDOM</p>
          </div>
        )}
      </div>
    </div>
  );
}
