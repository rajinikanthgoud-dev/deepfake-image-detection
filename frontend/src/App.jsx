import { useCallback, useEffect, useMemo, useState } from "react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000").replace(/\/$/, "");

/* ═══════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════ */

function formatPercent(v) {
  return `${(v * 100).toFixed(2)}%`;
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { ...(options.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

/* ═══════════════════════════════════════════════════════
   BACKGROUND MESH (shared across all pages)
   ═══════════════════════════════════════════════════════ */

function BgMesh() {
  return (
    <div className="bg-mesh" aria-hidden="true">
      <div className="bg-mesh__orb bg-mesh__orb--1" />
      <div className="bg-mesh__orb bg-mesh__orb--2" />
      <div className="bg-mesh__orb bg-mesh__orb--3" />
      <div className="bg-mesh__orb bg-mesh__orb--4" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════════ */

function LandingPage({ onNavigate }) {
  const [visibleSections, setVisibleSections] = useState(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const revealed = (id) => (visibleSections.has(id) ? "revealed" : "");

  return (
    <>
      <BgMesh />
      <div className="landing">
        {/* ── Navbar ── */}
        <nav className="land-nav">
          <div className="land-nav__brand">
            <div className="topbar__logo">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="topbar__title">Deepfake <span>Lab</span></span>
          </div>
          <div className="land-nav__actions">
            <button type="button" className="land-nav__link" onClick={() => onNavigate("login")}>
              Sign In
            </button>
            <button type="button" className="land-nav__cta" onClick={() => onNavigate("register")}>
              Get Started
            </button>
          </div>
        </nav>

        {/* ── Hero ── */}
        <header className="land-hero">
          <div className="land-hero__glow" aria-hidden="true" />
          <div className="land-hero__badge">
            <span className="land-hero__badge-dot" />
            AI-Powered Forensic Analysis
          </div>
          <h1 className="land-hero__title">
            Detect Deepfakes<br />
            <span className="gradient-text">With Precision</span>
          </h1>
          <p className="land-hero__sub">
            Our dual-backbone neural network fuses EfficientFormer and ConvNeXt architectures
            to expose manipulation artifacts invisible to the human eye — delivering forensic-grade
            authenticity verification in under a second.
          </p>
          <div className="land-hero__actions">
            <button type="button" className="primary-btn land-hero__btn" onClick={() => onNavigate("register")}>
              Start Analyzing Free
            </button>
            <button type="button" className="secondary-btn land-hero__btn-alt" onClick={() => {
              document.getElementById("land-how")?.scrollIntoView({ behavior: "smooth" });
            }}>
              See How It Works
            </button>
          </div>
        </header>

        {/* ── Showcase Visual ── */}
        <section className={`land-showcase reveal-section ${revealed("land-showcase")}`} id="land-showcase" data-reveal>
          <div className="land-showcase__inner">
            <div className="land-showcase__card land-showcase__card--fake">
              <div className="land-showcase__scan" />
              <div className="land-showcase__face">
                <svg viewBox="0 0 80 80" aria-hidden="true">
                  <circle cx="40" cy="30" r="16" />
                  <path d="M15 72c0-14 11-25 25-25s25 11 25 25" />
                </svg>
              </div>
              <div className="land-showcase__verdict is-fake">
                <span className="land-showcase__verdict-icon">!</span>
                FABRICATED
              </div>
              <div className="land-showcase__conf">98.7% confidence</div>
            </div>
            <div className="land-showcase__arrow">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </div>
            <div className="land-showcase__card land-showcase__card--real">
              <div className="land-showcase__face">
                <svg viewBox="0 0 80 80" aria-hidden="true">
                  <circle cx="40" cy="30" r="16" />
                  <path d="M15 72c0-14 11-25 25-25s25 11 25 25" />
                </svg>
              </div>
              <div className="land-showcase__verdict is-real">
                <svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                AUTHENTIC
              </div>
              <div className="land-showcase__conf">99.2% confidence</div>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className={`land-features reveal-section ${revealed("land-features")}`} id="land-features" data-reveal>
          <div className="land-section-header">
            <span className="land-section-tag">Capabilities</span>
            <h2>Why Deepfake Lab?</h2>
            <p>State-of-the-art forensic intelligence built for professionals and researchers</p>
          </div>
          <div className="land-features__grid">
            {[
              {
                icon: (
                  <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                ),
                title: "Dual-Backbone Architecture",
                desc: "EfficientFormer-L1 captures global attention patterns while ConvNeXt-Tiny isolates local texture anomalies for unmatched detection coverage.",
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                ),
                title: "Real-Time Analysis",
                desc: "Sub-second inference powered by optimized PyTorch pipelines. Upload, analyze, and get forensic results before you can blink.",
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                ),
                title: "Secure & Private",
                desc: "Your images never leave the analysis sandbox. Zero cloud storage, zero third-party access. Complete forensic confidentiality.",
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>
                ),
                title: "Calibrated Probabilities",
                desc: "Softmax posterior distributions give you nuanced confidence metrics — not just binary answers, but forensic-grade certainty scores.",
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                ),
                title: "Analysis History",
                desc: "Every prediction is stored with full detail — image, verdict, confidence, and timestamp — building your personal forensic archive.",
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                ),
                title: "Per-User Accounts",
                desc: "Secure JWT authentication with personal dashboards. Your data, your predictions, your forensic intelligence workspace.",
              },
            ].map((feat, i) => (
              <article className="land-feature-card" key={feat.title} style={{ animationDelay: `${0.1 * i}s` }}>
                <div className="land-feature-card__icon">{feat.icon}</div>
                <h3>{feat.title}</h3>
                <p>{feat.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className={`land-how reveal-section ${revealed("land-how")}`} id="land-how" data-reveal>
          <div className="land-section-header">
            <span className="land-section-tag">Process</span>
            <h2>How It Works</h2>
            <p>Three simple steps from upload to forensic verdict</p>
          </div>
          <div className="land-how__steps">
            {[
              { num: "01", title: "Upload Image", desc: "Drop any portrait image into our secure analysis zone. Supports JPEG, PNG, and WebP formats." },
              { num: "02", title: "Neural Analysis", desc: "Our hybrid CNN processes the image through dual feature extraction streams, fusing global semantics with local textures." },
              { num: "03", title: "Get Verdict", desc: "Receive a forensic brief with classification, confidence score, and posterior probability distribution." },
            ].map((step, i) => (
              <article className="land-step" key={step.num} style={{ animationDelay: `${0.15 * i}s` }}>
                <div className="land-step__num">{step.num}</div>
                <div className="land-step__connector" aria-hidden="true" />
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── Technology ── */}
        <section className={`land-tech reveal-section ${revealed("land-tech")}`} id="land-tech" data-reveal>
          <div className="land-section-header">
            <span className="land-section-tag">Under The Hood</span>
            <h2>The Technology</h2>
            <p>A hybrid architecture that combines the best of transformers and CNNs</p>
          </div>
          <div className="land-tech__grid">
            <article className="land-tech__card land-tech__card--main">
              <div className="land-tech__card-tag">Architecture</div>
              <h3>Hybrid Dual-Stream Fusion</h3>
              <p>
                Two parallel backbones — a vision transformer (EfficientFormer-L1, 448-d embeddings)
                and a modern CNN (ConvNeXt-Tiny, 768-d embeddings) — independently extract features.
                Their representations are concatenated into a 1216-d vector and passed through a
                3-layer MLP with ReLU activations and dropout regularization for the final classification.
              </p>
              <div className="land-tech__specs">
                <div><small>Input</small><strong>224 x 224 RGB</strong></div>
                <div><small>Features</small><strong>1,216-dim fused</strong></div>
                <div><small>Classifier</small><strong>512 → 256 → 2</strong></div>
                <div><small>Output</small><strong>Softmax 2-class</strong></div>
              </div>
            </article>
            <div className="land-tech__side">
              <article className="land-tech__card">
                <div className="land-tech__card-tag">Stream A</div>
                <h3>EfficientFormer-L1</h3>
                <p>Global attention-based feature extraction. Captures semantic inconsistencies and long-range spatial dependencies in face geometry.</p>
              </article>
              <article className="land-tech__card">
                <div className="land-tech__card-tag">Stream B</div>
                <h3>ConvNeXt-Tiny</h3>
                <p>Local convolutional feature extraction. Detects texture noise, compression artifacts, and photometric anomalies at the pixel level.</p>
              </article>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className={`land-cta reveal-section ${revealed("land-cta")}`} id="land-cta" data-reveal>
          <div className="land-cta__glow" aria-hidden="true" />
          <h2>Ready to Detect Deepfakes?</h2>
          <p>Create your free account and start verifying image authenticity with forensic-grade AI analysis.</p>
          <div className="land-cta__actions">
            <button type="button" className="primary-btn land-cta__btn" onClick={() => onNavigate("register")}>
              Create Free Account
            </button>
            <button type="button" className="secondary-btn land-cta__btn-alt" onClick={() => onNavigate("login")}>
              Sign In
            </button>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="land-footer">
          <div className="land-footer__brand">
            <div className="topbar__logo">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="topbar__title">Deepfake <span>Lab</span></span>
          </div>
          <div className="land-footer__info">
            <span>EfficientFormer-L1 + ConvNeXt-Tiny</span>
            <span className="footer__divider" />
            <span>Hybrid CNN Architecture</span>
            <span className="footer__divider" />
            <span>Forensic Intelligence Platform</span>
          </div>
          <p className="land-footer__copy">Deepfake Intelligence Lab — AI-Powered Image Forensics</p>
        </footer>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   AUTH PAGES
   ═══════════════════════════════════════════════════════ */

function AuthLayout({ children }) {
  return (
    <>
      <BgMesh />
      <div className="auth-page">
        <div className="auth-brand">
          <div className="topbar__logo">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="topbar__title">
            Deepfake <span>Lab</span>
          </span>
        </div>
        {children}
      </div>
    </>
  );
}

function LoginPage({ onLogin, onNavigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      onLogin(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1 className="auth-card__title">Welcome Back</h1>
        <p className="auth-card__sub">Sign in to your forensic intelligence account</p>

        {error && <p className="alert alert--error">{error}</p>}

        <div className="form-group">
          <label htmlFor="login-email">Email</label>
          <input id="login-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="login-pass">Password</label>
          <input id="login-pass" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <button type="submit" className="primary-btn auth-btn" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <div className="auth-links">
          <button type="button" className="link-btn" onClick={() => onNavigate("forgot-password")}>
            Forgot password?
          </button>
          <span className="auth-links__sep" />
          <span className="auth-links__text">
            No account?{" "}
            <button type="button" className="link-btn" onClick={() => onNavigate("register")}>
              Register
            </button>
          </span>
        </div>
      </form>
    </AuthLayout>
  );
}

function RegisterPage({ onLogin, onNavigate }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      });
      onLogin(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1 className="auth-card__title">Create Account</h1>
        <p className="auth-card__sub">Register to start detecting deepfakes</p>

        {error && <p className="alert alert--error">{error}</p>}

        <div className="form-group">
          <label htmlFor="reg-user">Username</label>
          <input id="reg-user" type="text" placeholder="Choose a username" value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} />
        </div>
        <div className="form-group">
          <label htmlFor="reg-email">Email</label>
          <input id="reg-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="reg-pass">Password</label>
          <input id="reg-pass" type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        </div>
        <div className="form-group">
          <label htmlFor="reg-confirm">Confirm Password</label>
          <input id="reg-confirm" type="password" placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
        </div>

        <button type="submit" className="primary-btn auth-btn" disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </button>

        <div className="auth-links">
          <span className="auth-links__text">
            Already have an account?{" "}
            <button type="button" className="link-btn" onClick={() => onNavigate("login")}>
              Sign In
            </button>
          </span>
        </div>
      </form>
    </AuthLayout>
  );
}

function ForgotPasswordPage({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setResetToken("");
    setLoading(true);
    try {
      const data = await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setMessage(data.message);
      if (data.reset_token) setResetToken(data.reset_token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1 className="auth-card__title">Forgot Password</h1>
        <p className="auth-card__sub">Enter your email to receive a reset token</p>

        {error && <p className="alert alert--error">{error}</p>}
        {message && <p className="alert alert--success">{message}</p>}
        {resetToken && (
          <div className="token-display">
            <small>Your reset token (copy this):</small>
            <code>{resetToken}</code>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="fp-email">Email</label>
          <input id="fp-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <button type="submit" className="primary-btn auth-btn" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Token"}
        </button>

        <div className="auth-links">
          {resetToken && (
            <button type="button" className="link-btn" onClick={() => onNavigate("reset-password")}>
              I have a reset token
            </button>
          )}
          <span className="auth-links__sep" />
          <button type="button" className="link-btn" onClick={() => onNavigate("login")}>
            Back to Sign In
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}

function ResetPasswordPage({ onNavigate }) {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, new_password: newPassword }),
      });
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1 className="auth-card__title">Reset Password</h1>
        <p className="auth-card__sub">Enter your reset token and new password</p>

        {error && <p className="alert alert--error">{error}</p>}
        {message && <p className="alert alert--success">{message}</p>}

        <div className="form-group">
          <label htmlFor="rp-token">Reset Token</label>
          <input id="rp-token" type="text" placeholder="Paste your reset token" value={token} onChange={(e) => setToken(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="rp-pass">New Password</label>
          <input id="rp-pass" type="password" placeholder="Min 6 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
        </div>
        <div className="form-group">
          <label htmlFor="rp-confirm">Confirm Password</label>
          <input id="rp-confirm" type="password" placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
        </div>

        <button type="submit" className="primary-btn auth-btn" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <div className="auth-links">
          <button type="button" className="link-btn" onClick={() => onNavigate("login")}>
            Back to Sign In
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}

/* ═══════════════════════════════════════════════════════
   HISTORY PAGE
   ═══════════════════════════════════════════════════════ */

function HistoryPage({ user, onLogout, onNavigate }) {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/predictions")
      .then(setPredictions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <BgMesh />
      <div className="page">
        <TopBar user={user} onLogout={onLogout} onNavigate={onNavigate} activePage="history" />
        <div className="history-header">
          <h1>Analysis History</h1>
          <p>{predictions.length} prediction{predictions.length !== 1 ? "s" : ""} recorded</p>
        </div>

        {loading ? (
          <div className="placeholder-state">
            <p>Loading history...</p>
          </div>
        ) : predictions.length === 0 ? (
          <div className="placeholder-state">
            <div className="placeholder-state__icon">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>
            </div>
            <p>No predictions yet. Start analyzing images!</p>
          </div>
        ) : (
          <div className="history-grid">
            {predictions.map((p) => (
              <article className={`history-card ${p.label === "Fake" ? "is-fake" : "is-real"}`} key={p.id}>
                <div className="history-card__img">
                  <img src={p.image_base64} alt={`Prediction ${p.id}`} />
                  <span className={`history-card__badge ${p.label === "Fake" ? "is-fake" : "is-real"}`}>
                    {p.label}
                  </span>
                </div>
                <div className="history-card__body">
                  <div className="history-card__verdict">
                    <strong>{p.label === "Fake" ? "Fabricated" : "Authentic"}</strong>
                    <span>{formatPercent(p.confidence)}</span>
                  </div>
                  <div className="history-card__bar">
                    <div
                      className={`history-card__fill ${p.label === "Fake" ? "is-fake" : "is-real"}`}
                      style={{ width: `${Math.min(100, p.confidence * 100)}%` }}
                    />
                  </div>
                  <time className="history-card__date">{formatDate(p.created_at)}</time>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   PROFILE PAGE
   ═══════════════════════════════════════════════════════ */

function ProfilePage({ user, onLogout, onNavigate, onUserUpdate }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveError, setSaveError] = useState("");

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    apiFetch("/auth/me")
      .then((data) => {
        setProfile(data);
        setUsername(data.username);
        setEmail(data.email);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    setSaveError("");
    setSaveMsg("");
    setSaveLoading(true);
    try {
      const data = await apiFetch("/auth/profile", {
        method: "PUT",
        body: JSON.stringify({ username, email }),
      });
      setSaveMsg(data.message);
      setProfile((prev) => ({ ...prev, username: data.user.username, email: data.user.email }));
      onUserUpdate(data.token, data.user);
      setEditing(false);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwMsg("");
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match");
      return;
    }
    setPwLoading(true);
    try {
      const data = await apiFetch("/auth/change-password", {
        method: "PUT",
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      setPwMsg(data.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setSaveError("");
    setSaveMsg("");
    if (profile) {
      setUsername(profile.username);
      setEmail(profile.email);
    }
  };

  return (
    <>
      <BgMesh />
      <div className="page">
        <TopBar user={user} onLogout={onLogout} onNavigate={onNavigate} activePage="profile" />

        <div className="profile-header">
          <div className="profile-avatar-lg">
            {profile?.username?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <h1>{profile?.username || "Loading..."}</h1>
            <p>{profile?.email || ""}</p>
          </div>
        </div>

        {loading ? (
          <div className="placeholder-state"><p>Loading profile...</p></div>
        ) : (
          <div className="profile-grid">
            {/* ── Account Info Panel ── */}
            <article className="panel profile-panel">
              <div className="panel-header">
                <div className="panel-header__tag"><span className="dot" />Account</div>
                <h2>Profile Details</h2>
                <p>View and manage your account information</p>
              </div>

              {saveMsg && <p className="alert alert--success">{saveMsg}</p>}
              {saveError && <p className="alert alert--error">{saveError}</p>}

              <div className="profile-fields">
                <div className="form-group">
                  <label>Username</label>
                  {editing ? (
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} minLength={3} />
                  ) : (
                    <div className="profile-value">{profile?.username}</div>
                  )}
                </div>
                <div className="form-group">
                  <label>Email</label>
                  {editing ? (
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  ) : (
                    <div className="profile-value">{profile?.email}</div>
                  )}
                </div>
              </div>

              <div className="profile-actions">
                {editing ? (
                  <>
                    <button type="button" className="primary-btn" onClick={handleSaveProfile} disabled={saveLoading}>
                      {saveLoading ? "Saving..." : "Save Changes"}
                    </button>
                    <button type="button" className="secondary-btn" onClick={handleCancelEdit} disabled={saveLoading}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button type="button" className="primary-btn" onClick={() => { setEditing(true); setSaveMsg(""); setSaveError(""); }}>
                    Edit Profile
                  </button>
                )}
              </div>
            </article>

            {/* ── Stats Panel ── */}
            <article className="panel profile-panel profile-stats-panel">
              <div className="panel-header">
                <div className="panel-header__tag"><span className="dot" />Stats</div>
                <h2>Account Overview</h2>
                <p>Your activity at a glance</p>
              </div>
              <div className="profile-stats">
                <div className="profile-stat-card">
                  <small>Member Since</small>
                  <strong>{profile?.created_at ? formatDate(profile.created_at) : "—"}</strong>
                </div>
                <div className="profile-stat-card">
                  <small>Total Analyses</small>
                  <strong>{profile?.prediction_count ?? 0}</strong>
                </div>
                <div className="profile-stat-card">
                  <small>Account ID</small>
                  <strong>#{profile?.id}</strong>
                </div>
              </div>
            </article>

            {/* ── Change Password Panel ── */}
            <article className="panel profile-panel profile-pw-panel">
              <div className="panel-header">
                <div className="panel-header__tag"><span className="dot" />Security</div>
                <h2>Change Password</h2>
                <p>Update your account password</p>
              </div>

              {pwMsg && <p className="alert alert--success">{pwMsg}</p>}
              {pwError && <p className="alert alert--error">{pwError}</p>}

              <form onSubmit={handleChangePassword} className="profile-fields">
                <div className="form-group">
                  <label>Current Password</label>
                  <input type="password" placeholder="Enter current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input type="password" placeholder="Min 6 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input type="password" placeholder="Re-enter new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
                </div>
                <div className="profile-actions">
                  <button type="submit" className="primary-btn" disabled={pwLoading}>
                    {pwLoading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </article>
          </div>
        )}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════════ */

function TopBar({ user, onLogout, onNavigate, activePage }) {
  return (
    <nav className="topbar">
      <div className="topbar__brand">
        <div className="topbar__logo">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="topbar__title">
          Deepfake <span>Lab</span>
        </span>
      </div>
      <div className="topbar__right">
        <button
          type="button"
          className={`topbar__nav-btn ${activePage === "app" ? "active" : ""}`}
          onClick={() => onNavigate("app")}
        >
          Analyze
        </button>
        <button
          type="button"
          className={`topbar__nav-btn ${activePage === "history" ? "active" : ""}`}
          onClick={() => onNavigate("history")}
        >
          History
        </button>
        <button
          type="button"
          className={`topbar__user-btn ${activePage === "profile" ? "active" : ""}`}
          onClick={() => onNavigate("profile")}
          title="View Profile"
        >
          <div className="topbar__avatar">{user?.username?.[0]?.toUpperCase() || "U"}</div>
          <span className="topbar__username">{user?.username}</span>
        </button>
        <button type="button" className="topbar__logout" onClick={onLogout}>
          Sign Out
        </button>
      </div>
    </nav>
  );
}

function ConfidenceGauge({ value, isFake }) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - value * circumference;
  return (
    <div className="gauge-wrapper">
      <svg className="gauge-svg" viewBox="0 0 120 120">
        <circle className="gauge-track" cx="60" cy="60" r={radius} />
        <circle
          className={`gauge-fill ${isFake ? "is-fake" : "is-real"}`}
          cx="60" cy="60" r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ animation: "gaugeReveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
        />
      </svg>
      <div className="gauge-label">
        <span className="gauge-label__percent">{Math.round(value * 100)}%</span>
        <span className="gauge-label__text">Confidence</span>
      </div>
    </div>
  );
}

function ProbCard({ label, value, isActive }) {
  const isRealRow = label === "Real" && isActive;
  const isFakeRow = label === "Fake" && isActive;
  return (
    <div className={`prob-card ${isActive ? "active" : ""} ${isRealRow ? "is-real-row" : ""} ${isFakeRow ? "is-fake-row" : ""}`}>
      <div className="prob-card__header">
        <div className="prob-card__label">
          <span className="prob-card__name">{label}</span>
          <span className="prob-card__tag">{isActive ? "Predicted" : "Alternate"}</span>
        </div>
        <span className="prob-card__value">{formatPercent(value)}</span>
      </div>
      <div className="prob-card__bar">
        <div className="prob-card__fill" style={{ width: `${Math.min(100, value * 100)}%` }} />
      </div>
    </div>
  );
}

const insights = [
  { title: "Dual-Stream Optics", detail: "EfficientFormer-L1 captures global semantics while ConvNeXt-Tiny isolates photometric texture anomalies." },
  { title: "Confidence Analytics", detail: "Calibrated softmax posteriors let you compare class likelihoods with forensic precision." },
  { title: "Secure Sandbox", detail: "Zero persistence. Files stream through memory for each inference cycle, then are purged." },
];

/* ═══════════════════════════════════════════════════════
   MAIN APP (Detection Page)
   ═══════════════════════════════════════════════════════ */

function DetectionPage({ user, onLogout, onNavigate }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const probabilities = useMemo(() => {
    if (!result?.probabilities) return [];
    return Object.entries(result.probabilities).map(([label, value]) => ({
      label, value, isActive: result.label === label,
    }));
  }, [result]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    setResult(null);
    setError("");
    if (!file) { setSelectedFile(null); setPreviewUrl(null); return; }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) { setError("Please select an image before submitting."); return; }
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      setIsLoading(true);
      setError("");
      setResult(null);
      const data = await apiFetch("/predict", { method: "POST", body: formData });
      setResult(data);
    } catch (err) {
      if (err.message === "Missing or invalid token" || err.message === "Token expired") {
        onLogout();
        return;
      }
      setError(err.message || "Unexpected error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null); setPreviewUrl(null); setResult(null); setError("");
  };

  const isFake = result?.label === "Fake";

  return (
    <>
      <BgMesh />
      <div className="page">
        <TopBar user={user} onLogout={onLogout} onNavigate={onNavigate} activePage="app" />

        {/* HERO */}
        <header className="hero">
          <div className="hero__content">
            <div className="hero__text">
              <div className="hero__eyebrow">Forensic Intelligence</div>
              <h1>Deepfake<br /><span className="gradient-text">Detection Lab</span></h1>
              <p className="hero__sub">
                Upload a portrait and our dual-backbone neural network will examine
                texture noise, facial landmarks, and chromatic aberrations to surface
                manipulation signals in seconds.
              </p>
            </div>
            <div className="hero__metrics">
              <article className="metric-card"><small>Model Stack</small><strong>EfficientFormer + ConvNeXt</strong></article>
              <article className="metric-card"><small>Input Resolution</small><strong>224 &times; 224 normalized</strong></article>
              <article className="metric-card"><small>Inference Latency</small><strong>~350ms on GPU</strong></article>
            </div>
          </div>
        </header>

        {/* WORKSPACE */}
        <section className="workspace">
          <form className="panels" onSubmit={handleSubmit}>
            <article className="panel upload-panel">
              <div className="panel-header">
                <div className="panel-header__tag"><span className="dot" />Step 01</div>
                <h2>Upload Evidence</h2>
                <p>Drop a frontal portrait for authenticity verification</p>
              </div>
              <label className={`dropzone ${previewUrl ? "dropzone--preview" : ""} ${isLoading ? "dropzone--scanning" : ""}`}>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" />
                ) : (
                  <div className="dropzone__cta">
                    <span className="dropzone__icon">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </span>
                    <strong>Upload Portrait</strong>
                    <p>Drag & drop or click to browse</p>
                  </div>
                )}
              </label>
              <div className="file-info">
                <div className="file-info__guidelines">
                  Best results when:
                  <ul><li>Face occupies 60%+ of frame</li><li>Uniform lighting, minimal occlusion</li><li>512px min on shortest edge</li></ul>
                </div>
                <div className={`file-info__chip ${selectedFile ? "file-info__chip--active" : ""}`}>
                  {selectedFile ? selectedFile.name : "Awaiting file..."}
                </div>
              </div>
              <div className="actions">
                <button type="submit" className={`primary-btn ${isLoading ? "primary-btn--loading" : ""}`} disabled={isLoading}>
                  {isLoading ? "Analyzing..." : "Run Analysis"}
                </button>
                <button type="button" className="secondary-btn" onClick={handleReset} disabled={isLoading || (!selectedFile && !previewUrl)}>
                  Reset
                </button>
              </div>
            </article>

            <article className="panel result-panel">
              <div className="panel-header">
                <div className="panel-header__tag"><span className="dot" />Step 02</div>
                <h2>Forensic Brief</h2>
                <p>Texture noise, landmarks & chromatic aberration analysis</p>
              </div>
              {error && <p className="alert alert--error">{error}</p>}
              {isLoading && <p className="alert alert--info">Cross-examining micro-artifacts...</p>}
              {result ? (
                <div className={`result-card ${isFake ? "is-fake" : "is-real"}`}>
                  <div className="result-top">
                    <ConfidenceGauge value={result.confidence} isFake={isFake} />
                    <div className="verdict-info">
                      <p className={`verdict-label ${isFake ? "is-fake" : "is-real"}`}>
                        {isFake ? "Fabricated" : "Authentic"}
                      </p>
                      <p className="verdict-sub"><strong>{formatPercent(result.confidence)}</strong> model confidence</p>
                    </div>
                  </div>
                  <div className="result-meta">
                    <article><small>Signal Strength</small><strong>{isFake ? "High manipulation cues" : "Low manipulation cues"}</strong></article>
                    <article><small>Model Certainty</small><strong>{result.confidence > 0.85 ? "Decisive" : "Needs review"}</strong></article>
                  </div>
                </div>
              ) : (
                <div className="placeholder-state">
                  <div className="placeholder-state__icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                  </div>
                  <p>Submit an image to generate a forensic intelligence brief</p>
                </div>
              )}
              <div className="insights-row">
                {insights.map((item, i) => (
                  <article className="insight-card" key={item.title}>
                    <span className="insight-card__num">{String(i + 1).padStart(2, "0")}</span>
                    <h3>{item.title}</h3>
                    <p>{item.detail}</p>
                  </article>
                ))}
              </div>
            </article>
          </form>

          <article className="panel probabilities-section">
            <div className="panel-header">
              <div className="panel-header__tag"><span className="dot" />Spectrum</div>
              <h2>Posterior Probabilities</h2>
              <p>Class-level probability distribution from the final softmax layer</p>
            </div>
            {probabilities.length ? (
              <div className="prob-grid">
                {probabilities.map((item) => (
                  <ProbCard key={item.label} label={item.label} value={item.value} isActive={item.isActive} />
                ))}
              </div>
            ) : (
              <div className="placeholder-state">
                <div className="placeholder-state__icon">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>
                </div>
                <p>Probabilities will render after analysis</p>
              </div>
            )}
          </article>
        </section>

        <footer className="site-footer">
          <div className="footer__left">
            <span>EfficientFormer-L1 + ConvNeXt-Tiny</span>
            <span className="footer__divider" />
            <span>Hybrid CNN Architecture</span>
          </div>
          <span className="footer__right">Deepfake Intelligence Lab</span>
        </footer>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   ROOT APP (Router)
   ═══════════════════════════════════════════════════════ */

export default function App() {
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState(null);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setPage("app");
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleLogin = useCallback((token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setPage("app");
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setPage("landing");
  }, []);

  const handleUserUpdate = useCallback((token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const navigate = useCallback((p) => setPage(p), []);

  switch (page) {
    case "landing":
      return <LandingPage onNavigate={navigate} />;
    case "login":
      return <LoginPage onLogin={handleLogin} onNavigate={navigate} />;
    case "register":
      return <RegisterPage onLogin={handleLogin} onNavigate={navigate} />;
    case "forgot-password":
      return <ForgotPasswordPage onNavigate={navigate} />;
    case "reset-password":
      return <ResetPasswordPage onNavigate={navigate} />;
    case "profile":
      return <ProfilePage user={user} onLogout={handleLogout} onNavigate={navigate} onUserUpdate={handleUserUpdate} />;
    case "history":
      return <HistoryPage user={user} onLogout={handleLogout} onNavigate={navigate} />;
    default:
      return <DetectionPage user={user} onLogout={handleLogout} onNavigate={navigate} />;
  }
}
