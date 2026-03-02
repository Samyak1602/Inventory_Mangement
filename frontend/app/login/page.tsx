"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function LoginPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const switchTab = (tab: "login" | "signup") => {
        setActiveTab(tab);
        setError("");
        setSuccess("");
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
    };

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Invalid email or password");
            localStorage.setItem("user", JSON.stringify(data));
            router.push("/dashboard");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Login failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignup = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        if (!name || !email || !password || !confirmPassword) {
            setError("Please fill in all fields");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Signup failed");
            setSuccess("Account created successfully! Please login.");
            setTimeout(() => switchTab("login"), 1500);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Signup failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            {/* Background Effects */}
            <div style={styles.bgEffects}>
                <div style={{ ...styles.orb, ...styles.orb1 }} />
                <div style={{ ...styles.orb, ...styles.orb2 }} />
                <div style={{ ...styles.orb, ...styles.orb3 }} />
                <div style={styles.gridOverlay} />
            </div>

            <div style={styles.container}>
                {/* Brand */}
                <div className="animate-fade-in-down" style={styles.brand}>
                    <div style={styles.logoBox}>
                        <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
                            <rect width="40" height="40" rx="10" fill="url(#lg)" />
                            <path d="M12 14h16v3H12zM12 20h12v3H12zM12 26h8v3H12z" fill="white" opacity="0.9" />
                            <defs>
                                <linearGradient id="lg" x1="0" y1="0" x2="40" y2="40">
                                    <stop stopColor="#6366f1" />
                                    <stop offset="1" stopColor="#06b6d4" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <h1 style={styles.title}>
                        Inven<span className="text-gradient">Pro</span>
                    </h1>
                    <p style={styles.subtitle}>Inventory Management System</p>
                </div>

                {/* Auth Card */}
                <div className="animate-fade-in-up delay-200" style={styles.card}>
                    {/* Tabs */}
                    <div style={styles.tabs}>
                        <button
                            style={{
                                ...styles.tab,
                                ...(activeTab === "login" ? styles.tabActive : {}),
                            }}
                            onClick={() => switchTab("login")}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                <polyline points="10 17 15 12 10 7" />
                                <line x1="15" y1="12" x2="3" y2="12" />
                            </svg>
                            Login
                        </button>
                        <button
                            style={{
                                ...styles.tab,
                                ...(activeTab === "signup" ? styles.tabActive : {}),
                            }}
                            onClick={() => switchTab("signup")}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="8.5" cy="7" r="4" />
                                <line x1="20" y1="8" x2="20" y2="14" />
                                <line x1="23" y1="11" x2="17" y2="11" />
                            </svg>
                            Sign Up
                        </button>
                        <div
                            style={{
                                ...styles.tabIndicator,
                                transform: `translateX(${activeTab === "login" ? "0%" : "100%"})`,
                            }}
                        />
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="animate-fade-in" style={styles.errorMsg}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="animate-fade-in" style={styles.successMsg}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            {success}
                        </div>
                    )}

                    {/* Login Form */}
                    {activeTab === "login" && (
                        <form onSubmit={handleLogin} className="animate-fade-in" style={styles.form} key="login">
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Email Address</label>
                                <div style={styles.inputWrap}>
                                    <svg style={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="4" width="20" height="16" rx="2" />
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                    </svg>
                                    <input
                                        type="email"
                                        className="input-field"
                                        style={styles.inputWithIcon}
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Password</label>
                                <div style={styles.inputWrap}>
                                    <svg style={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="input-field"
                                        style={styles.inputWithIcon}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="current-password"
                                    />
                                    <button type="button" style={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password">
                                        {showPassword ? (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                        ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" disabled={isLoading} style={styles.submitBtn}>
                                {isLoading ? (
                                    <><span className="spinner" /> Signing in...</>
                                ) : (
                                    <>
                                        Sign In
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                                    </>
                                )}
                            </button>

                            <p style={styles.switchText}>
                                Don&apos;t have an account?{" "}
                                <button type="button" style={styles.switchLink} onClick={() => switchTab("signup")}>Create one</button>
                            </p>
                        </form>
                    )}

                    {/* Signup Form */}
                    {activeTab === "signup" && (
                        <form onSubmit={handleSignup} className="animate-fade-in" style={styles.form} key="signup">
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Full Name</label>
                                <div style={styles.inputWrap}>
                                    <svg style={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                    <input
                                        type="text"
                                        className="input-field"
                                        style={styles.inputWithIcon}
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        autoComplete="name"
                                    />
                                </div>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Email Address</label>
                                <div style={styles.inputWrap}>
                                    <svg style={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="4" width="20" height="16" rx="2" />
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                    </svg>
                                    <input
                                        type="email"
                                        className="input-field"
                                        style={styles.inputWithIcon}
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Password</label>
                                <div style={styles.inputWrap}>
                                    <svg style={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="input-field"
                                        style={styles.inputWithIcon}
                                        placeholder="Minimum 6 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="new-password"
                                    />
                                    <button type="button" style={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password">
                                        {showPassword ? (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                        ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Confirm Password</label>
                                <div style={styles.inputWrap}>
                                    <svg style={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                    <input
                                        type="password"
                                        className="input-field"
                                        style={styles.inputWithIcon}
                                        placeholder="Re-enter your password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>

                            <button type="submit" disabled={isLoading} style={styles.submitBtn}>
                                {isLoading ? (
                                    <><span className="spinner" /> Creating account...</>
                                ) : (
                                    <>
                                        Create Account
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                                    </>
                                )}
                            </button>

                            <p style={styles.switchText}>
                                Already have an account?{" "}
                                <button type="button" style={styles.switchLink} onClick={() => switchTab("login")}>Sign in</button>
                            </p>
                        </form>
                    )}
                </div>

                {/* Footer */}
                <p className="animate-fade-in delay-400" style={styles.footer}>
                    © 2026 InvenPro. Built with NextJs and NestJs. Created by Priyansh and Samyak.
                </p>
            </div>
        </div>
    );
}

/* ===== Inline Styles (immune to Tailwind overrides) ===== */
const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: 20,
        background: "#060b18",
    },
    bgEffects: {
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
    },
    orb: {
        position: "absolute",
        borderRadius: "50%",
        filter: "blur(80px)",
        opacity: 0.6,
    },
    orb1: {
        width: 400,
        height: 400,
        background: "radial-gradient(circle, rgba(99,102,241,0.3), transparent 70%)",
        top: "-10%",
        left: "-5%",
        animation: "float 8s ease-in-out infinite",
    },
    orb2: {
        width: 350,
        height: 350,
        background: "radial-gradient(circle, rgba(6,182,212,0.25), transparent 70%)",
        bottom: "-10%",
        right: "-5%",
        animation: "float 10s ease-in-out infinite reverse",
    },
    orb3: {
        width: 200,
        height: 200,
        background: "radial-gradient(circle, rgba(139,92,246,0.2), transparent 70%)",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        animation: "float 12s ease-in-out infinite",
    },
    gridOverlay: {
        position: "absolute",
        inset: 0,
        backgroundImage:
            "linear-gradient(rgba(148,163,184,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.03) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
    },
    container: {
        position: "relative",
        zIndex: 1,
        width: "100%",
        maxWidth: 440,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
    },
    brand: {
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
    },
    logoBox: {
        width: 60,
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(99,102,241,0.1)",
        borderRadius: 16,
        border: "1px solid rgba(99,102,241,0.25)",
        padding: 10,
        marginBottom: 4,
        boxShadow: "0 0 40px rgba(99,102,241,0.2)",
    },
    title: {
        fontSize: 34,
        fontWeight: 800,
        color: "#f1f5f9",
        letterSpacing: "-0.02em",
    },
    subtitle: {
        fontSize: 13,
        color: "#64748b",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        fontWeight: 600,
    },
    card: {
        width: "100%",
        background: "rgba(14,21,37,0.7)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(148,163,184,0.1)",
        borderRadius: 20,
        padding: 28,
        boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 60px rgba(99,102,241,0.06)",
    },
    tabs: {
        display: "flex",
        position: "relative",
        background: "rgba(6,11,24,0.8)",
        borderRadius: 12,
        padding: 4,
        marginBottom: 24,
        border: "1px solid rgba(148,163,184,0.08)",
    },
    tab: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: 12,
        fontSize: 14,
        fontWeight: 600,
        color: "#64748b",
        background: "none",
        border: "none",
        cursor: "pointer",
        borderRadius: 8,
        transition: "all 250ms ease",
        zIndex: 1,
        position: "relative",
    },
    tabActive: {
        color: "#ffffff",
    },
    tabIndicator: {
        position: "absolute",
        top: 4,
        left: 4,
        width: "calc(50% - 4px)",
        height: "calc(100% - 8px)",
        background: "linear-gradient(135deg, #6366f1, #4f46e5)",
        borderRadius: 8,
        transition: "transform 300ms cubic-bezier(0.4,0,0.2,1)",
        boxShadow: "0 4px 15px rgba(99,102,241,0.4)",
    },
    errorMsg: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 16px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 20,
        background: "rgba(239,68,68,0.1)",
        color: "#ef4444",
        border: "1px solid rgba(239,68,68,0.2)",
    },
    successMsg: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 16px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 500,
        marginBottom: 20,
        background: "rgba(16,185,129,0.1)",
        color: "#10b981",
        border: "1px solid rgba(16,185,129,0.2)",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: 18,
    },
    inputGroup: {
        display: "flex",
        flexDirection: "column",
        gap: 6,
    },
    label: {
        fontSize: 13,
        fontWeight: 500,
        color: "#94a3b8",
        letterSpacing: "0.02em",
    },
    inputWrap: {
        position: "relative",
        display: "flex",
        alignItems: "center",
    },
    inputIcon: {
        position: "absolute",
        left: 14,
        color: "#64748b",
        pointerEvents: "none",
        zIndex: 1,
    },
    inputWithIcon: {
        paddingLeft: 44,
        paddingRight: 44,
    },
    eyeBtn: {
        position: "absolute",
        right: 12,
        background: "none",
        border: "none",
        color: "#64748b",
        cursor: "pointer",
        padding: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "color 200ms ease",
        zIndex: 1,
    },
    submitBtn: {
        width: "100%",
        marginTop: 6,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "14px 24px",
        fontSize: 15,
        fontWeight: 600,
        color: "#ffffff",
        background: "linear-gradient(135deg, #6366f1, #4f46e5)",
        border: "none",
        borderRadius: 12,
        cursor: "pointer",
        transition: "all 250ms ease",
        boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
        letterSpacing: "0.02em",
    },
    switchText: {
        textAlign: "center",
        fontSize: 13,
        color: "#64748b",
        marginTop: 4,
    },
    switchLink: {
        color: "#818cf8",
        background: "none",
        border: "none",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: 13,
        transition: "color 200ms ease",
    },
    footer: {
        fontSize: 12,
        color: "#d4c5c5ff",
        textAlign: "center",
        opacity: 0.8,
    },
};
