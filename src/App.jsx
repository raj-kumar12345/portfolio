import { useState, useEffect, useRef } from "react";

const NAV = ["About","Skills","Projects","Experience","Education","Contact"];

const SKILLS = [
  { cat: "Languages",  items: ["JavaScript (ES6+)", "TypeScript"] },
  { cat: "Frontend",   items: ["React.js", "Redux Toolkit", "Tailwind CSS", "Material UI (MUI)", "HTML", "CSS"] },
  { cat: "Backend",    items: ["Node.js", "Express.js", "Nest.js", "REST APIs", "API Integration"] },
  { cat: "Database",   items: ["MongoDB", "MySQL"] },
  { cat: "WordPress",  items: ["WordPress CMS", "Astra Theme", "YITH Wonder Theme"] },
];

const PROJECTS = [
  {
    title: "AI English Learning & Course Platform",
    stack: ["Express.js","Node.js","MongoDB","React","Redux","Tailwind CSS"],
    desc: "AI-powered chat for real-time English practice, a full course marketplace with payment gateway, and an admin panel for flexible video content management.",
    link: "https://imp-eng-full-stack-project.vercel.app",
    tag: "AI / EdTech",
    num: "01",
  },
  {
    title: "SalonX – Salon Booking Platform",
    stack: ["React.js","Node.js","Express.js","MongoDB","Redux","Tailwind CSS"],
    desc: "Dynamic barber selection, real-time slot booking to cut wait times, and JWT-based auth with secure session management.",
    link: "https://salon-x-rust.vercel.app",
    tag: "Booking",
    num: "02",
  },
  {
    title: "Elitiq – MERN E-Commerce Platform",
    stack: ["React.js","Node.js","Express.js","MongoDB","Redux","Tailwind CSS"],
    desc: "Persistent Redux cart, Cloudinary image uploads, CRUD admin dashboard, and protected routes with JWT authorization.",
    link: null,
    tag: "E-Commerce",
    num: "03",
  },
  {
    title: "E-Commerce Shoe Store",
    stack: ["React","Redux","Tailwind CSS","JavaScript"],
    desc: "Responsive product listing and detail pages with intuitive navigation and interactive UI built for real-world e-commerce patterns.",
    link: "https://jolly-rabanadas-8dcb0e.netlify.app",
    tag: "Frontend",
    num: "04",
  },
  {
    title: "QR Contactless Menu System",
    stack: ["React","Redux","Tailwind CSS","JavaScript"],
    desc: "Scan-to-view restaurant menu inspired by a real hotel experience — hygienic, fast, and fully responsive across devices.",
    link: "https://melodic-daffodil-c37e6f.netlify.app/",
    tag: "Utility",
    num: "05",
  },
];

// ── EmailJS config ──────────────────────────────────────────────────────────
// 1. Sign up free at https://www.emailjs.com
// 2. Create an Email Service (Gmail, Outlook, etc.) → copy Service ID
// 3. Create an Email Template → copy Template ID
//    Template variables: {{from_name}}, {{from_email}}, {{message}}
// 4. Go to Account → copy your Public Key
// Then replace the three strings below:
const EMAILJS_SERVICE_ID  = "service_tz9dwdm";   // e.g. "service_abc123"
const EMAILJS_TEMPLATE_ID = "gcO9-j6Nm_fDt_xKJ";  // e.g. "template_xyz789"
const EMAILJS_PUBLIC_KEY  = "cF2DpKdsKC5lMrV0MncBR";   // e.g. "aBcDeFgHiJkLmNoP"
// ───────────────────────────────────────────────────────────────────────────

function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function Reveal({ children, delay = 0, x = 0, y = 32 }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translate(0,0)" : `translate(${x}px,${y}px)`,
      transition: `opacity 0.7s cubic-bezier(.22,1,.36,1) ${delay}s, transform 0.7s cubic-bezier(.22,1,.36,1) ${delay}s`,
    }}>{children}</div>
  );
}

function Cursor() {
  const [v, setV] = useState(true);
  useEffect(() => { const t = setInterval(() => setV(x => !x), 500); return () => clearInterval(t); }, []);
  return <span style={{ opacity: v ? 1 : 0, color: "#00E5FF", transition: "opacity 0.1s" }}>_</span>;
}

export default function Portfolio() {
  // ── FIX 1: single source of truth for active section ──────────────────────
  // We store the active section id in state and update it from the
  // IntersectionObserver directly, so the nav highlight always stays in sync.
  const [activeSection, setActiveSection] = useState("about");
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);
  const [sendError, setSendError] = useState("");
  const [hoverNav, setHoverNav] = useState(null);
  const [hoverProj, setHoverProj] = useState(null);

  // Smooth-scroll helper
  const go = (id) => {
    setActiveSection(id);
    window.location.hash = id;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  // Intersection observer → updates activeSection as user scrolls
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && e.intersectionRatio >= 0.35) {
          setActiveSection(e.target.id);
        }
      });
    }, { threshold: 0.35 });
    NAV.forEach(n => {
      const el = document.getElementById(n.toLowerCase());
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  // On mount, scroll to hash if present
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) {
      setActiveSection(id);
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 120);
    }
  }, []);

  // ── FIX 3: send via EmailJS ───────────────────────────────────────────────
  const submit = async () => {
    if (!form.name || !form.email || !form.message) return;

    // Load EmailJS SDK on demand (no npm install needed)
    if (!window.emailjs) {
      await new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
      window.emailjs.init(EMAILJS_PUBLIC_KEY);
    }

    setSending(true);
    setSendError("");
    try {
      await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        from_name:  form.name,
        from_email: form.email,
        message:    form.message,
      });
      setSent(true);
      setForm({ name: "", email: "", message: "" });
      setTimeout(() => setSent(false), 4000);
    } catch (err) {
      console.error("EmailJS error:", err);
      setSendError("Failed to send. Please email me directly.");
    } finally {
      setSending(false);
    }
  };

  const cyan = "#00E5FF";
  const dark = "#090D10";
  const card = "#0D1117";
  const cardBorder = "#1C2A33";
  const muted = "#8899A6";
  const text = "#E8F4F8";

  const sec = (id, alt) => ({
    id,
    style: {
      padding: "100px 0",
      background: alt ? "#0A0E13" : dark,
      borderTop: `1px solid ${cardBorder}`,
    }
  });

  const inp = {
    width: "100%", padding: "14px 18px", borderRadius: 10,
    background: "#0D1117", border: `1px solid ${cardBorder}`,
    color: text, fontSize: 14, outline: "none", fontFamily: "inherit",
    marginBottom: 14, boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #090D10; }
        ::selection { background: #00E5FF33; color: #00E5FF; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0D1117; }
        ::-webkit-scrollbar-thumb { background: #1C2A33; border-radius: 4px; }
        .glow { text-shadow: 0 0 40px rgba(0,229,255,0.5); }
        .btn-cyan {
          background: transparent; color: #00E5FF; border: 1px solid #00E5FF;
          border-radius: 8px; padding: 13px 28px; font-size: 14px; font-weight: 600;
          cursor: pointer; font-family: inherit; letter-spacing: 0.04em;
          transition: all 0.2s; position: relative; overflow: hidden;
        }
        .btn-cyan::before {
          content: ''; position: absolute; inset: 0;
          background: #00E5FF; opacity: 0; transition: opacity 0.2s;
        }
        .btn-cyan:hover::before { opacity: 0.08; }
        .btn-cyan:hover { box-shadow: 0 0 20px #00E5FF33; }
        .btn-cyan:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-ghost {
          background: transparent; color: #8899A6; border: 1px solid #1C2A33;
          border-radius: 8px; padding: 12px 28px; font-size: 14px; font-weight: 500;
          cursor: pointer; font-family: inherit; transition: all 0.2s;
        }
        .btn-ghost:hover { border-color: #00E5FF44; color: #E8F4F8; }
        .nav-link {
          cursor: pointer; font-size: 13px; font-weight: 500; letter-spacing: 0.06em;
          text-transform: uppercase; padding: 6px 14px; border-radius: 6px;
          transition: all 0.2s; font-family: 'JetBrains Mono', monospace;
        }
        .skill-pill {
          display: inline-block; padding: 5px 14px; border-radius: 20px;
          font-size: 12.5px; font-weight: 500; margin: 3px;
          border: 1px solid #1C2A33; color: #8899A6;
          transition: all 0.2s; cursor: default;
          font-family: 'JetBrains Mono', monospace;
        }
        .skill-pill:hover { border-color: #00E5FF66; color: #00E5FF; background: #00E5FF0A; }
        .proj-row {
          border-bottom: 1px solid #1C2A33;
          padding: 32px; display: flex; align-items: flex-start;
          gap: 40px; cursor: default; transition: background 0.2s;
          margin: 0 -32px; border-radius: 4px;
        }
        .proj-row:hover { background: #00E5FF05; }
        .proj-row:first-child { border-top: 1px solid #1C2A33; }
        .form-input:focus { border-color: #00E5FF !important; }
        .mob-menu { display: none; flex-direction: column; gap: 2px;
          position: fixed; top: 64px; left: 0; right: 0; z-index: 99;
          background: #0D1117; border-bottom: 1px solid #1C2A33;
          padding: 12px 24px 20px; }
        .mob-menu.open { display: flex; }
        .mob-item { padding: 12px 16px; border-radius: 8px; cursor: pointer;
          font-size: 14px; font-weight: 500; color: #8899A6; text-transform: uppercase;
          letter-spacing: 0.06em; font-family: 'JetBrains Mono', monospace;
          transition: color 0.2s; }
        .mob-item:hover { color: #00E5FF; }
        .hamburger { display: none; background: none; border: none;
          font-size: 22px; cursor: pointer; color: #E8F4F8; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: block !important; }
          .hero-title { font-size: clamp(2.4rem, 10vw, 3.5rem) !important; }
          .contact-grid { grid-template-columns: 1fr !important; }
          .skill-grid { grid-template-columns: 1fr !important; }
          .proj-row { flex-direction: column; gap: 16px; }
          .proj-num { display: none !important; }
          .stat-row { gap: 24px !important; }
        }
      `}</style>

      <div style={{ fontFamily: "'Outfit', sans-serif", background: dark, color: text, minHeight: "100vh" }}>

        {/* ── NAV ── */}
        <nav style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          background: "rgba(9,13,16,0.85)", backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${cardBorder}`,
          padding: "0 6%", height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          {/* ── FIX 2: show "Raj" instead of <portfolio/> ── */}
          <div style={{
            fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 22,
            color: cyan, letterSpacing: "0.02em",
          }}>
            Raj
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 400, fontSize: 13, color: muted,
              marginLeft: 8, verticalAlign: "middle",
            }}>/ dev</span>
          </div>

          <ul className="desktop-nav" style={{ display: "flex", gap: 2, listStyle: "none" }}>
            {NAV.map(n => {
              // FIX 1: use activeSection (not hash from URL) for highlight
              const active = activeSection === n.toLowerCase();
              return (
                <li key={n} className="nav-link"
                  onMouseEnter={() => setHoverNav(n)}
                  onMouseLeave={() => setHoverNav(null)}
                  onClick={() => { go(n.toLowerCase()); setMenuOpen(false); }}
                  style={{
                    color: active ? cyan : hoverNav === n ? text : muted,
                    background: active ? `${cyan}10` : "transparent",
                  }}>
                  {n}
                </li>
              );
            })}
          </ul>
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        </nav>

        <div className={`mob-menu${menuOpen ? " open" : ""}`}>
          {NAV.map(n => (
            <div key={n} className="mob-item"
              style={{ color: activeSection === n.toLowerCase() ? cyan : muted }}
              onClick={() => { go(n.toLowerCase()); setMenuOpen(false); }}>
              {n}
            </div>
          ))}
        </div>

        {/* ── HERO ── */}
        <section id="about" style={{
          minHeight: "100vh", display: "flex", alignItems: "center",
          padding: "100px 6% 80px", position: "relative", overflow: "hidden",
          background: `radial-gradient(ellipse 80% 60% at 60% 40%, ${cyan}0C 0%, transparent 65%)`,
        }}>
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: `linear-gradient(${cardBorder}55 1px, transparent 1px), linear-gradient(90deg, ${cardBorder}55 1px, transparent 1px)`,
            backgroundSize: "60px 60px", opacity: 0.35,
          }} />

          <div style={{ maxWidth: 860, position: "relative", zIndex: 1 }}>
            <Reveal delay={0}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
                color: cyan, letterSpacing: "0.15em", textTransform: "uppercase",
                marginBottom: 20, display: "flex", alignItems: "center", gap: 10,
              }}>
                <span style={{ display: "inline-block", width: 32, height: 1, background: cyan }} />
                Full Stack Developer
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <h1 className="hero-title glow" style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "clamp(3rem, 7vw, 5.5rem)",
                fontWeight: 800, lineHeight: 1.05,
                letterSpacing: "-2px", marginBottom: 28,
                color: "#FFFFFF",
              }}>
                Building{" "}
                <span style={{
                  WebkitTextStroke: `2px ${cyan}`,
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                }}>
                  digital
                </span>
                <br />experiences
                <Cursor />
              </h1>
            </Reveal>

            <Reveal delay={0.2}>
              <p style={{
                fontSize: "1.1rem", color: muted, lineHeight: 1.8,
                maxWidth: 540, marginBottom: 44, fontWeight: 400,
              }}>
                I craft fast, user-first web applications — from AI-powered platforms to real-time booking systems — with React, Node.js &amp; MongoDB.
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <button className="btn-cyan" onClick={() => go("projects")}>View Projects →</button>
                <button className="btn-ghost" onClick={() => go("contact")}>Contact Me</button>
              </div>
            </Reveal>

            <Reveal delay={0.45}>
              <div className="stat-row" style={{
                display: "flex", gap: 48, marginTop: 64,
                paddingTop: 40, borderTop: `1px solid ${cardBorder}`,
              }}>
                {[["5+", "Projects"], ["2+", "Years"], ["10+", "Technologies"]].map(([n, l]) => (
                  <div key={l}>
                    <div style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: 36, fontWeight: 800, color: cyan, lineHeight: 1,
                    }}>{n}</div>
                    <div style={{ fontSize: 13, color: muted, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>{l}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── SKILLS ── */}
        <section {...sec("skills", false)}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 6%" }}>
            <Reveal>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", color: cyan, fontSize: 12, letterSpacing: "0.15em" }}>02.</span>
                <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 700, letterSpacing: "-0.5px" }}>Skills</h2>
                <div style={{ flex: 1, height: 1, background: cardBorder, marginLeft: 8 }} />
              </div>
            </Reveal>
            <div className="skill-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 20 }}>
              {SKILLS.map(({ cat, items }, i) => (
                <Reveal key={cat} delay={i * 0.08}>
                  <div style={{
                    background: card, border: `1px solid ${cardBorder}`,
                    borderRadius: 16, padding: "26px 22px",
                    borderTop: `2px solid ${cyan}`,
                    height: "100%",
                  }}>
                    <div style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      color: cyan, fontSize: 10, letterSpacing: "0.18em",
                      textTransform: "uppercase", marginBottom: 14,
                    }}>{cat}</div>
                    <div>{items.map(s => <span key={s} className="skill-pill">{s}</span>)}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── PROJECTS ── */}
        <section {...sec("projects", true)}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 6%" }}>
            <Reveal>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", color: cyan, fontSize: 12, letterSpacing: "0.15em" }}>03.</span>
                <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 700, letterSpacing: "-0.5px" }}>Projects</h2>
                <div style={{ flex: 1, height: 1, background: cardBorder, marginLeft: 8 }} />
              </div>
            </Reveal>

            <div>
              {PROJECTS.map((p, i) => (
                <Reveal key={p.title} delay={i * 0.07}>
                  <div
                    className="proj-row"
                    onMouseEnter={() => setHoverProj(i)}
                    onMouseLeave={() => setHoverProj(null)}
                  >
                    <div className="proj-num" style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 13, color: hoverProj === i ? cyan : cardBorder,
                      fontWeight: 700, minWidth: 32, paddingTop: 4,
                      transition: "color 0.2s",
                    }}>{p.num}</div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 10 }}>
                        <div>
                          <span style={{
                            display: "inline-block",
                            fontFamily: "'JetBrains Mono',monospace",
                            fontSize: 10, color: cyan, letterSpacing: "0.12em",
                            textTransform: "uppercase", marginBottom: 6,
                            background: `${cyan}12`, padding: "3px 10px", borderRadius: 4,
                          }}>{p.tag}</span>
                          <h3 style={{ fontSize: 20, fontWeight: 700, color: hoverProj === i ? "#FFFFFF" : text, transition: "color 0.2s", marginTop: 4 }}>{p.title}</h3>
                        </div>
                        {p.link && (
                          <a href={p.link} target="_blank" rel="noopener noreferrer"
                            style={{
                              color: cyan, border: `1px solid ${cyan}44`, borderRadius: 8,
                              padding: "7px 16px", fontSize: 12, fontWeight: 600,
                              fontFamily: "'JetBrains Mono',monospace", textDecoration: "none",
                              whiteSpace: "nowrap", transition: "all 0.2s",
                              letterSpacing: "0.04em",
                            }}
                            onMouseOver={e => { e.currentTarget.style.background = `${cyan}12`; e.currentTarget.style.borderColor = cyan; }}
                            onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = `${cyan}44`; }}
                          >↗ Live</a>
                        )}
                      </div>
                      <p style={{ fontSize: 14, color: muted, lineHeight: 1.75, marginBottom: 14 }}>{p.desc}</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {p.stack.map(s => (
                          <span key={s} style={{
                            fontSize: 11, fontFamily: "'JetBrains Mono',monospace",
                            color: muted, background: `${cyan}08`,
                            border: `1px solid ${cardBorder}`, borderRadius: 4, padding: "2px 8px",
                          }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── EXPERIENCE ── */}
        <section {...sec("experience", false)}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 6%" }}>
            <Reveal>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", color: cyan, fontSize: 12, letterSpacing: "0.15em" }}>04.</span>
                <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 700, letterSpacing: "-0.5px" }}>Experience</h2>
                <div style={{ flex: 1, height: 1, background: cardBorder, marginLeft: 8 }} />
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div style={{
                background: card, border: `1px solid ${cardBorder}`,
                borderRadius: 20, padding: "40px", position: "relative",
                overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", left: 0, top: 0, bottom: 0,
                  width: 3, background: `linear-gradient(to bottom, ${cyan}, ${cyan}00)`,
                  borderRadius: "0 0 0 20px",
                }} />
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 6 }}>
                  <h3 style={{ fontSize: 22, fontWeight: 700, color: "#FFFFFF" }}>Jr Full Stack Developer</h3>
                  <span style={{
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: 12, color: cyan, background: `${cyan}12`,
                    padding: "4px 14px", borderRadius: 20, letterSpacing: "0.06em",
                  }}>Jan 2026 – June 2026</span>
                </div>
                <div style={{ fontSize: 13, color: muted, marginBottom: 28, fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.04em" }}>
                  Web Development
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {[
                    { icon: "⚙️", text: "Built backend services with NestJS and RESTful APIs — user registration, login, forgot/reset password, and JWT-based authorization." },
                    { icon: "⚛️", text: "Developed responsive React.js frontend interfaces for internal web applications." },
                    { icon: "🌐", text: "Built WordPress sites using Astra and YITH Wonder themes, customizing layouts, configuring plugins, and optimizing UX." },
                  ].map((b, i) => (
                    <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <span style={{
                        background: `${cyan}12`, borderRadius: 8,
                        width: 36, height: 36, display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: 16, flexShrink: 0,
                      }}>{b.icon}</span>
                      <span style={{ fontSize: 15, color: muted, lineHeight: 1.75, paddingTop: 6 }}>{b.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── EDUCATION ── */}
        <section {...sec("education", true)}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 6%" }}>
            <Reveal>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", color: cyan, fontSize: 12, letterSpacing: "0.15em" }}>05.</span>
                <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 700, letterSpacing: "-0.5px" }}>Education</h2>
                <div style={{ flex: 1, height: 1, background: cardBorder, marginLeft: 8 }} />
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div style={{
                background: card, border: `1px solid ${cardBorder}`,
                borderRadius: 20, padding: "36px 40px",
                display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap",
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 16,
                  background: `${cyan}12`, border: `1px solid ${cyan}33`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 30, flexShrink: 0,
                }}>🎓</div>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: "#FFFFFF", marginBottom: 6 }}>Bachelor of Technology</h3>
                  <div style={{ fontSize: 15, color: cyan, fontWeight: 500, marginBottom: 4 }}>
                    Technocrats Institute of Technology, Bhopal, India
                  </div>
                  <div style={{ fontSize: 13, color: muted, fontFamily: "'JetBrains Mono',monospace" }}>Aug 2022 – June 2026</div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section {...sec("contact", false)}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 6%" }}>
            <Reveal>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", color: cyan, fontSize: 12, letterSpacing: "0.15em" }}>06.</span>
                <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 700, letterSpacing: "-0.5px" }}>Contact</h2>
                <div style={{ flex: 1, height: 1, background: cardBorder, marginLeft: 8 }} />
              </div>
              <p style={{ fontSize: 15, color: muted, lineHeight: 1.8, maxWidth: 520, marginBottom: 48 }}>
                Open to full-time roles, internships, and freelance projects. Say hello — I'll get back to you.
              </p>
            </Reveal>

            <div className="contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 40 }}>
              <Reveal delay={0.05}>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { icon: "📧", label: "Email", val: "rajkumarsah25022004@gmail.com" },
                    { icon: "💼", label: "LinkedIn", val: "linkedin.com/in/rajkumarsah12345" },
                    { icon: "🐙", label: "GitHub", val: "github.com/raj-kumar12345" },
                  ].map(c => (
                    <div key={c.label} style={{
                      background: card, border: `1px solid ${cardBorder}`,
                      borderRadius: 14, padding: "18px 22px",
                      display: "flex", gap: 16, alignItems: "center",
                      transition: "border-color 0.2s",
                    }}
                      onMouseOver={e => e.currentTarget.style.borderColor = `${cyan}44`}
                      onMouseOut={e => e.currentTarget.style.borderColor = cardBorder}
                    >
                      <span style={{
                        background: `${cyan}10`, borderRadius: 10,
                        width: 42, height: 42, display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: 18, flexShrink: 0,
                      }}>{c.icon}</span>
                      <div>
                        <div style={{ fontSize: 11, color: muted, fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.1em", marginBottom: 3 }}>{c.label}</div>
                        <div style={{ fontSize: 14, color: text, fontWeight: 500 }}>{c.val}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>

              <Reveal delay={0.15}>
                <div style={{ background: card, border: `1px solid ${cardBorder}`, borderRadius: 20, padding: "36px" }}>
                  {["name", "email"].map(f => (
                    <input
                      key={f}
                      className="form-input"
                      value={form[f]}
                      placeholder={f === "name" ? "Your Name" : "Your Email"}
                      onChange={e => setForm({ ...form, [f]: e.target.value })}
                      style={inp}
                      onFocus={e => e.target.style.borderColor = cyan}
                      onBlur={e => e.target.style.borderColor = cardBorder}
                    />
                  ))}
                  <textarea
                    className="form-input"
                    value={form.message}
                    placeholder="Your message..."
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    style={{ ...inp, resize: "vertical", minHeight: 120 }}
                    onFocus={e => e.target.style.borderColor = cyan}
                    onBlur={e => e.target.style.borderColor = cardBorder}
                  />
                  {sendError && (
                    <div style={{ fontSize: 13, color: "#FF6B6B", marginBottom: 12 }}>{sendError}</div>
                  )}
                  <button
                    className="btn-cyan"
                    onClick={submit}
                    disabled={sending}
                    style={{ width: "100%", fontSize: 14, padding: "15px", letterSpacing: "0.06em" }}
                  >
                    {sending ? "Sending…" : sent ? "✓ Message Sent!" : "Send Message →"}
                  </button>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{
          textAlign: "center", padding: "32px 6%", color: muted, fontSize: 12,
          borderTop: `1px solid ${cardBorder}`,
          fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.06em",
        }}>
          <span style={{ color: cyan }}>// </span>
          designed & built by Raj · {new Date().getFullYear()}
        </footer>
      </div>
    </>
  );
}
