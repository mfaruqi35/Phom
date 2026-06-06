"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type UserRole = "mahasiswa" | "dosen" | "admin" | "";

// Helper sliding auth card modal component
interface SlidingAuthCardProps {
  initialMode: "signin" | "signup";
  onClose: () => void;
}

function SlidingAuthCard({ initialMode, onClose }: SlidingAuthCardProps) {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(initialMode === "signup");

  // Sync state if initialMode changes
  useEffect(() => {
    setIsSignUp(initialMode === "signup");
  }, [initialMode]);

  // Sign In Form States
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInRemember, setSignInRemember] = useState(false);

  // Sign Up Form States
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");
  const [signUpRole, setSignUpRole] = useState<UserRole>("mahasiswa");
  const [signUpIdentifier, setSignUpIdentifier] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!signInEmail || !signInPassword) {
      setError("Email dan password wajib diisi.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onClose();
      router.push("/dashboard");
    }, 1000);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!signUpName || !signUpEmail || !signUpPassword || !signUpConfirmPassword || !signUpRole) {
      setError("Semua kolom input pendaftaran wajib diisi.");
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    if (signUpPassword.length < 8) {
      setError("Sandi minimal terdiri atas 8 karakter.");
      return;
    }

    // No NIM/NIP validation required for single-user role setup

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccess("Registrasi berhasil! Mengalihkan...");
      setTimeout(() => {
        onClose();
        router.push("/dashboard");
      }, 1000);
    }, 1000);
  };

  const handleDemoBypass = () => {
    setError("");
    setSuccess("");
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onClose();
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div className="auth-card flex text-left relative bg-white rounded-3xl overflow-hidden">
      {/* Styled inline sheet inside the modal */}
      <style jsx>{`
        .auth-card {
          width: 880px;
          max-width: 100%;
          min-height: 600px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(0,0,0,0.05);
        }
        .form-container {
          position: absolute;
          top: 0;
          height: 100%;
          transition: all 0.6s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .sign-in-container {
          left: 0;
          width: 50%;
          z-index: 2;
          opacity: ${isSignUp ? "0" : "1"};
          transform: ${isSignUp ? "translateX(100%)" : "translateX(0)"};
          pointer-events: ${isSignUp ? "none" : "all"};
        }
        .sign-up-container {
          left: 0;
          width: 50%;
          opacity: ${isSignUp ? "1" : "0"};
          z-index: ${isSignUp ? "5" : "1"};
          transform: ${isSignUp ? "translateX(100%)" : "translateX(0)"};
          pointer-events: ${isSignUp ? "all" : "none"};
        }
        .overlay-container {
          position: absolute;
          top: 0;
          left: 50%;
          width: 50%;
          height: 100%;
          overflow: hidden;
          transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
          z-index: 100;
          transform: ${isSignUp ? "translateX(-100%)" : "translateX(0)"};
        }
        .overlay {
          background-image: url('https://media.giphy.com/media/l0HlMgBCA1f5hDkK4/giphy.gif');
          background-size: cover;
          background-position: center;
          position: relative;
          left: -100%;
          height: 100%;
          width: 200%;
          transform: ${isSignUp ? "translateX(50%)" : "translateX(0)"};
          transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .overlay-tint {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(79, 70, 229, 0.88), rgba(59, 130, 246, 0.88));
          z-index: 1;
        }
        .overlay-panel {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 40px;
          text-align: center;
          top: 0;
          height: 100%;
          width: 50%;
          transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
          z-index: 2;
        }
        .overlay-left {
          transform: ${isSignUp ? "translateX(0)" : "translateX(-20%)"};
        }
        .overlay-right {
          right: 0;
          transform: ${isSignUp ? "translateX(20%)" : "translateX(0)"};
        }
      `}</style>

      {/* 1. SIGN IN (LOGIN) FORM PANEL */}
      <div className="form-container sign-in-container flex flex-col justify-center px-10 md:px-14 py-8">
        <form onSubmit={handleSignInSubmit} className="space-y-6 text-center">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight font-heading">Sign In</h1>
            <p className="text-xs text-gray-400">Masuk untuk melanjutkan uji coba sidang</p>
          </div>
          
          {/* Social icons */}
          <div className="flex justify-center gap-3">
            <button
              type="button"
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1877F2] hover:border-[#1877F2] hover:scale-110 active:scale-95 transition-all duration-300 hover:shadow-[0_4px_12px_rgba(24,119,242,0.3)] hover:rotate-3"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
              </svg>
            </button>
            <button
              type="button"
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#EA4335] hover:border-[#EA4335] hover:scale-110 active:scale-95 transition-all duration-300 hover:shadow-[0_4px_12px_rgba(234,67,53,0.3)] hover:-rotate-3"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 12.24 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.746-.08-1.32-.176-1.884H12.24z"/>
              </svg>
            </button>
            <button
              type="button"
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#0077B5] hover:border-[#0077B5] hover:scale-110 active:scale-95 transition-all duration-300 hover:shadow-[0_4px_12px_rgba(0,119,181,0.3)] hover:rotate-3"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </button>
          </div>

          <p className="text-[10px] text-gray-400">or use your account</p>

          {/* Error alert */}
          {error && !isSignUp && (
            <span className="text-red-500 text-xs block text-left bg-red-50 p-2.5 rounded border border-red-100 animate-fadeIn">
              {error}
            </span>
          )}

          {/* Fields */}
          <div className="space-y-3.5 text-left">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base">mail</span>
              <input
                type="email"
                placeholder="Email Address"
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                required
                className="w-full h-11 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white transition-all focus:ring-4 focus:ring-primary/10"
              />
            </div>
            
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base">lock</span>
              <input
                type="password"
                placeholder="Password"
                value={signInPassword}
                onChange={(e) => setSignInPassword(e.target.value)}
                required
                className="w-full h-11 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white transition-all focus:ring-4 focus:ring-primary/10"
              />
            </div>
          </div>

          {/* Remember & Forgot */}
          <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={signInRemember}
                onChange={(e) => setSignInRemember(e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/20 accent-primary"
              />
              <span>Remember me</span>
            </label>
            <a href="#" className="hover:underline hover:text-primary transition-colors">Forgot password?</a>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-sm hover:shadow-md active:scale-[0.98] mt-2"
          >
            {isLoading ? "Signing In..." : "SIGN IN"}
          </button>

          {/* Demo Bypass Option */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-gray-200/60"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-[10px] uppercase font-bold tracking-wider">atau</span>
            <div className="flex-grow border-t border-gray-200/60"></div>
          </div>
          <button
            type="button"
            onClick={handleDemoBypass}
            disabled={isLoading}
            className="w-full h-11 rounded-xl border border-indigo-200 hover:border-primary bg-indigo-50/20 hover:bg-indigo-50/50 text-primary text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-sm font-bold">bolt</span>
            Coba Demo Instan (Tanpa Daftar)
          </button>
        </form>
      </div>

      {/* SIGN UP (REGISTER) FORM PANEL */}
      <div className="form-container sign-up-container flex flex-col justify-center px-10 md:px-14 py-8">
        <form onSubmit={handleSignUpSubmit} className="space-y-4 text-center overflow-y-auto max-h-[560px] px-1 scrollbar-thin">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight font-heading">Create Account</h1>
            <p className="text-xs text-gray-400">Buat akun untuk memulai simulasi baru</p>
          </div>

          {/* Social icons */}
          <div className="flex justify-center gap-3">
            <button
              type="button"
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1877F2] hover:border-[#1877F2] hover:scale-110 active:scale-95 transition-all duration-300 hover:shadow-[0_4px_12px_rgba(24,119,242,0.3)] hover:rotate-3"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
              </svg>
            </button>
            <button
              type="button"
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#EA4335] hover:border-[#EA4335] hover:scale-110 active:scale-95 transition-all duration-300 hover:shadow-[0_4px_12px_rgba(234,67,53,0.3)] hover:-rotate-3"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 12.24 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.746-.08-1.32-.176-1.884H12.24z"/>
              </svg>
            </button>
            <button
              type="button"
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#0077B5] hover:border-[#0077B5] hover:scale-110 active:scale-95 transition-all duration-300 hover:shadow-[0_4px_12px_rgba(0,119,181,0.3)] hover:rotate-3"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </button>
          </div>

          <p className="text-[10px] text-gray-400">or use your email for registration</p>

          {/* Alerts */}
          {success && isSignUp && (
            <span className="text-green-600 text-xs block text-left bg-green-50 p-2.5 rounded border border-green-100 animate-fadeIn">
              {success}
            </span>
          )}
          {error && isSignUp && (
            <span className="text-red-500 text-xs block text-left bg-red-50 p-2.5 rounded border border-red-100 animate-fadeIn">
              {error}
            </span>
          )}

          {/* Fields */}
          <div className="space-y-3 text-left">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base">person</span>
              <input
                type="text"
                placeholder="Full Name"
                value={signUpName}
                onChange={(e) => setSignUpName(e.target.value)}
                required
                className="w-full h-11 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white transition-all focus:ring-4 focus:ring-primary/10"
              />
            </div>

            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base">mail</span>
              <input
                type="email"
                placeholder="Email Address"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                required
                className="w-full h-11 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white transition-all focus:ring-4 focus:ring-primary/10"
              />
            </div>

            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base">lock</span>
              <input
                type="password"
                placeholder="Password"
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                required
                className="w-full h-11 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white transition-all focus:ring-4 focus:ring-primary/10"
              />
            </div>

            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base">lock</span>
              <input
                type="password"
                placeholder="Confirm Password"
                value={signUpConfirmPassword}
                onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                required
                className="w-full h-11 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white transition-all focus:ring-4 focus:ring-primary/10"
              />
            </div>

            {/* Role defaulted to User, no selection inputs needed */}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-sm hover:shadow-md active:scale-[0.98] mt-3"
          >
            {isLoading ? "Creating Account..." : "SIGN UP"}
          </button>

          {/* Demo Bypass Option */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-gray-200/60"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-[10px] uppercase font-bold tracking-wider">atau</span>
            <div className="flex-grow border-t border-gray-200/60"></div>
          </div>
          <button
            type="button"
            onClick={handleDemoBypass}
            disabled={isLoading}
            className="w-full h-11 rounded-xl border border-indigo-200 hover:border-primary bg-indigo-50/20 hover:bg-indigo-50/50 text-primary text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-sm font-bold">bolt</span>
            Coba Demo Instan (Tanpa Daftar)
          </button>
        </form>
      </div>

      {/* SLIDING OVERLAY PANEL WITH CONNECTIVITY GIF */}
      <div className="overlay-container">
        <div className="overlay">
          
          {/* Dark gradient overlay for readability */}
          <div className="overlay-tint"></div>

          {/* Left Overlay panel (Signin trigger) */}
          <div className="overlay-panel overlay-left">
            <h1 className="text-3xl font-bold mb-3 tracking-tight text-white">Welcome Back!</h1>
            <p className="text-xs leading-relaxed opacity-85 mb-8 max-w-[250px] text-white">
              To keep connected with us please login with your personal info
            </p>
            <button
              onClick={() => setIsSignUp(false)}
              className="w-32 h-10 rounded-full border-2 border-white bg-transparent hover:bg-white text-white hover:text-primary text-xs font-bold transition-all duration-300"
            >
              SIGN IN
            </button>
          </div>

          {/* Right Overlay panel (Signup trigger) */}
          <div className="overlay-panel overlay-right">
            <h1 className="text-3xl font-bold mb-3 tracking-tight text-white">Hey There!</h1>
            <p className="text-xs leading-relaxed opacity-85 mb-8 max-w-[250px] text-white">
              Begin your amazing journey by creating an account with us today
            </p>
            <button
              onClick={() => setIsSignUp(true)}
              className="w-32 h-10 rounded-full border-2 border-white bg-transparent hover:bg-white text-white hover:text-primary text-xs font-bold transition-all duration-300"
            >
              SIGN UP
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// Main Landing Page Component
export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("methodology");
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Modal Popup states
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  // Monitor scroll to update navbar background opacity
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const openAuthModal = (mode: "signin" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
    setIsClosing(false);
  };

  const closeAuthModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setAuthModalOpen(false);
      setIsClosing(false);
    }, 200);
  };

  return (
    <>
      {/* Main Page Container (Gets blurred when modal is open) */}
      <div 
        className={`relative min-h-screen bg-bg text-text-primary antialiased font-body transition-all duration-300 ${
          authModalOpen ? "filter blur-md pointer-events-none" : ""
        }`}
      >
        {/* TopNavBar */}
        <nav
          className={`fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[1200px] z-50 transition-all duration-300 ${
            scrolled
              ? "bg-white/95 backdrop-blur-md shadow-[0_12px_40px_-12px_rgba(79,70,229,0.15)] border border-gray-100 py-3 px-6 rounded-full"
              : "bg-white/80 backdrop-blur-sm shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-200/40 py-4.5 px-8 rounded-full"
          }`}
        >
          <div className="flex justify-between items-center w-full">
            {/* Brand Logo */}
            <a href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3525cd] to-[#6f3dd9] flex items-center justify-center text-white group-hover:scale-105 transition-transform duration-300 shadow-md shadow-indigo-600/20">
                <span className="material-symbols-outlined text-xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                  neurology
                </span>
              </div>
              <span className="text-xl font-heading font-extrabold text-[#3525cd] tracking-tight">
                Phom
              </span>
            </a>

            {/* Navigation Links (Desktop) */}
            <div className="hidden md:flex items-center gap-8">
              {/* Fitur Dropdown Option (like "Produk v") */}
              <div className="relative group py-1">
                <a
                  href="#features"
                  className="font-heading text-sm font-semibold text-gray-600 hover:text-primary transition-colors flex items-center gap-0.5"
                >
                  <span>Fitur</span>
                  <span className="material-symbols-outlined text-base font-bold transition-transform duration-250 group-hover:rotate-180">
                    keyboard_arrow_down
                  </span>
                </a>
                {/* Floating Dropdown Container with hover bridge */}
                <div className="absolute top-full pt-2 left-1/2 -translate-x-1/2 w-48 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50">
                  <div className="bg-white border border-gray-100 shadow-xl rounded-2xl p-2">
                    <a
                      href="#about"
                      className="block px-3.5 py-2 text-xs font-semibold text-gray-600 hover:bg-indigo-50/50 hover:text-[#3525cd] rounded-xl transition-all"
                    >
                      Tentang Phom
                    </a>
                    <a
                      href="#features"
                      className="block px-3.5 py-2 text-xs font-semibold text-gray-600 hover:bg-indigo-50/50 hover:text-[#3525cd] rounded-xl transition-all"
                    >
                      Simulasi AI Sidang
                    </a>
                    <a
                      href="#solutions"
                      className="block px-3.5 py-2 text-xs font-semibold text-gray-600 hover:bg-indigo-50/50 hover:text-[#3525cd] rounded-xl transition-all"
                    >
                      Evaluasi Metodologi
                    </a>
                  </div>
                </div>
              </div>

              <a
                href="#solutions"
                className="font-heading text-sm font-semibold text-gray-600 hover:text-primary transition-colors"
              >
                Solusi
              </a>
              <a
                href="#how-it-works"
                className="font-heading text-sm font-semibold text-gray-600 hover:text-primary transition-colors"
              >
                Cara Pakai
              </a>
              <a
                href="#faq"
                className="font-heading text-sm font-semibold text-gray-600 hover:text-primary transition-colors"
              >
                FAQ
              </a>
            </div>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-5">
              <button
                onClick={() => openAuthModal("signin")}
                className="font-heading text-sm font-semibold text-gray-600 hover:text-primary transition-colors focus:outline-none"
              >
                Masuk
              </button>
              <button
                onClick={() => openAuthModal("signup")}
                className="bg-[#1D4ED8] hover:bg-[#1e40af] text-white px-5 py-2 rounded-full font-heading text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm focus:outline-none"
              >
                Coba Gratis
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-600 p-2 focus:outline-none hover:text-primary transition-colors"
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined text-2xl">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-[calc(100%+0.5rem)] left-0 w-full bg-white border border-gray-100 shadow-xl rounded-3xl py-6 px-6 flex flex-col gap-4 animate-fadeIn">
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="font-heading text-base font-semibold text-gray-600 hover:text-primary transition-colors"
              >
                Tentang
              </a>
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="font-heading text-base font-semibold text-gray-600 hover:text-primary transition-colors"
              >
                Fitur
              </a>
              <a
                href="#solutions"
                onClick={() => setMobileMenuOpen(false)}
                className="font-heading text-base font-semibold text-gray-600 hover:text-primary transition-colors"
              >
                Solusi
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="font-heading text-base font-semibold text-gray-600 hover:text-primary transition-colors"
              >
                Cara Pakai
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="font-heading text-base font-semibold text-gray-600 hover:text-primary transition-colors"
              >
                FAQ
              </a>
              <hr className="border-gray-100 my-2" />
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { setMobileMenuOpen(false); openAuthModal("signin"); }}
                  className="font-heading text-base font-semibold text-gray-600 hover:text-primary text-center py-2 focus:outline-none transition-colors"
                >
                  Masuk
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); openAuthModal("signup"); }}
                  className="bg-[#1D4ED8] hover:bg-[#1e40af] text-white text-center py-3 rounded-full font-heading text-base font-bold shadow-sm focus:outline-none hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Coba Gratis
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* Main Content */}
        <main className="pt-28 pb-20">
          
          {/* Hero Section */}
          <section className="max-w-[1280px] mx-auto px-6 md:px-12 pt-12 md:pt-20 pb-20 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Hero Content */}
              <div className="flex flex-col gap-6 z-10">
                <div className="inline-flex items-center gap-2 bg-primary-subtle text-primary px-4 py-1.5 rounded-full w-max border border-primary/20 text-xs font-semibold tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  THE FUTURE OF ACADEMIA
                </div>
                <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-text-primary leading-tight">
                  Master Your Thesis Defense with{" "}
                  <span className="bg-gradient-to-r from-[#3525cd] to-[#6f3dd9] bg-clip-text text-transparent">
                    Phom
                  </span>{" "}
                  <span className="bg-gradient-to-r from-[#ff7e40] to-[#ff512f] bg-clip-text text-transparent">
                    Precision
                  </span>
                </h1>
                <p className="font-body text-lg text-text-secondary max-w-xl leading-relaxed">
                  Latih mental, uji metodologi penelitian, dan perkuat argumen akademismu sebelum menghadapi komite penguji sesungguhnya dengan simulator bertenaga AI.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-2">
                  <button
                    onClick={() => openAuthModal("signup")}
                    className="bg-primary text-white px-8 py-3.5 rounded-lg font-heading text-sm font-bold button-hover glow-effect flex items-center justify-center gap-2 focus:outline-none"
                  >
                    Mulai Simulasi Gratis
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                  <a
                    href="#how-it-works"
                    className="bg-transparent border border-border hover:bg-surface-raised text-text-primary px-8 py-3.5 rounded-lg font-heading text-sm font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                      play_circle
                    </span>
                    Lihat Cara Kerja
                  </a>
                </div>
                
                {/* Social Proof */}
                <div className="flex items-center gap-4 mt-6">
                  <div className="flex -space-x-3">
                    <div className="relative w-10 h-10 rounded-full border-2 border-surface bg-slate-200 overflow-hidden">
                      <div className="absolute inset-0 bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">AZ</div>
                    </div>
                    <div className="relative w-10 h-10 rounded-full border-2 border-surface bg-slate-200 overflow-hidden">
                      <div className="absolute inset-0 bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">MF</div>
                    </div>
                    <div className="relative w-10 h-10 rounded-full border-2 border-surface bg-slate-200 overflow-hidden">
                      <div className="absolute inset-0 bg-orange-500 flex items-center justify-center text-white text-xs font-bold">YN</div>
                    </div>
                    <div className="w-10 h-10 rounded-full border-2 border-surface bg-primary-subtle flex items-center justify-center text-xs font-bold text-primary z-10">
                      10k+
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-text-secondary">
                    Dipercaya oleh 10,000+ mahasiswa tingkat akhir
                  </p>
                </div>
              </div>

              {/* Hero Mockup (Interactive Browser Visual) */}
              <div className="relative z-0 h-[450px] w-full hidden lg:block">
                {/* Glowing Decorative Background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-primary/10 rounded-full blur-[80px] -z-10"></div>
                
                <div className="absolute right-0 top-6 w-[110%] h-full rounded-2xl border border-border/80 shadow-2xl overflow-hidden glass-panel transform -rotate-1 hover:rotate-0 transition-transform duration-700 ease-out origin-bottom-right">
                  {/* Browser Header */}
                  <div className="h-11 bg-surface-raised border-b border-border/60 flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-danger/20 border border-danger/30"></div>
                    <div className="w-3 h-3 rounded-full bg-warning/20 border border-warning/30"></div>
                    <div className="w-3 h-3 rounded-full bg-success/20 border border-success/30"></div>
                    <div className="mx-auto w-1/2 h-6 bg-surface rounded text-center text-[10px] text-text-secondary leading-6 flex items-center justify-center gap-1.5 border border-border/40">
                      <span className="material-symbols-outlined text-[12px] text-text-secondary">lock</span>
                      app.phom.ai/workspace/active
                    </div>
                  </div>

                  {/* Mockup Inside */}
                  <div className="p-5 bg-surface h-full flex gap-5">
                    {/* Left Mockup Sidebar */}
                    <div className="w-44 bg-surface-raised rounded-lg border border-border/60 p-3 flex flex-col gap-3">
                      <div className="h-4 w-3/4 bg-slate-300/40 rounded"></div>
                      <div className="space-y-2 mt-2">
                        <div className="h-2 w-full bg-slate-200 rounded"></div>
                        <div className="h-2 w-5/6 bg-slate-200 rounded"></div>
                        <div className="h-2 w-full bg-primary-subtle rounded border border-primary/10"></div>
                        <div className="h-2 w-4/5 bg-slate-200 rounded"></div>
                      </div>
                      
                      <div className="mt-auto h-20 w-full rounded-md bg-accent-subtle border border-accent/20 p-2.5 flex flex-col justify-end">
                        <div className="h-3 w-3/4 bg-accent/70 rounded mb-2"></div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full w-2/3 bg-accent"></div>
                        </div>
                      </div>
                    </div>

                    {/* Right Mockup Chat Area */}
                    <div className="flex-1 flex flex-col gap-4">
                      <div className="flex justify-between items-center bg-surface-raised p-3 rounded-lg border border-border/60">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <span className="material-symbols-outlined text-sm">smart_toy</span>
                          </div>
                          <div>
                            <div className="text-[11px] font-bold text-text-primary">Komite Penguji AI</div>
                            <div className="text-[9px] text-success flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span> Sedang Menguji Metodologi
                            </div>
                          </div>
                        </div>
                        <div className="text-[9px] font-bold text-accent bg-accent-subtle px-2 py-0.5 rounded border border-accent/20">
                          Sanggahan 1/2
                        </div>
                      </div>

                      {/* Chat Bubble List */}
                      <div className="flex-1 bg-surface-raised rounded-lg border border-border/60 p-3 space-y-3 relative overflow-hidden text-[11px]">
                        <div className="flex gap-2">
                          <div className="w-5 h-5 rounded-full bg-primary/20 flex-shrink-0 mt-0.5"></div>
                          <div className="bg-surface p-2.5 rounded-r-lg rounded-bl-lg text-text-primary border border-border/60 max-w-[85%] leading-relaxed shadow-sm">
                            "Anda menggunakan regresi linier dalam Bab 3. Bagaimana Anda memitigasi isu multikolinearitas yang terdeteksi pada variabel bebas?"
                          </div>
                        </div>

                        <div className="flex gap-2 flex-row-reverse">
                          <div className="w-5 h-5 bg-indigo-500 rounded-full flex-shrink-0 mt-0.5"></div>
                          <div className="bg-primary text-white p-2.5 rounded-l-lg rounded-br-lg max-w-[85%] leading-relaxed shadow-sm">
                            "Kami telah menguji VIF (Variance Inflation Factor) dan memastikan seluruh nilainya di bawah 5, sehingga tidak ada indikasi multikolinearitas serius."
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <div className="w-5 h-5 rounded-full bg-accent/20 flex-shrink-0 mt-0.5"></div>
                          <div className="bg-accent-subtle text-accent-hover p-2.5 rounded-r-lg rounded-bl-lg border border-accent/20 max-w-[85%] leading-relaxed shadow-sm font-medium">
                            "Namun nilai toleransi pada variabel X2 sangat mendekati batas kritis. Apakah Anda sudah mencoba alternatif seperti Ridge Regression?"
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Tentang Phom */}
          <section id="about" className="bg-surface border-y border-border/60 py-20">
            <div className="max-w-[1280px] mx-auto px-6 md:px-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="flex flex-col gap-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <span className="material-symbols-outlined text-2xl font-bold">school</span>
                  </div>
                  <h2 className="font-heading text-3xl font-extrabold text-text-primary leading-tight">
                    Kalahkan Kecemasan Sidang, Bangun Otoritas Akademikmu
                  </h2>
                  <p className="font-body text-base text-text-secondary leading-relaxed">
                    <strong>Phom</strong> (diambil dari bahasa Aceh yang berarti <strong>"paham"</strong>) adalah platform SaaS simulator sidang skripsi berbasis AI pertama di Indonesia yang dirancang khusus untuk mahasiswa tingkat akhir.
                  </p>
                  <p className="font-body text-base text-text-secondary leading-relaxed">
                    Kami percaya bahwa persiapan sidang bukan sekadar tentang menghafal slide presentasi, melainkan melatih ketahanan mental dalam mempertahankan metodologi penelitian, memvalidasi konsistensi argumentasi, dan merespons sanggahan kritis komite penguji dengan logis dan percaya diri.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-surface-raised border border-border/60 p-6 rounded-xl flex flex-col gap-3">
                    <span className="text-3xl font-heading font-extrabold text-primary">01</span>
                    <h3 className="font-heading text-lg font-bold text-text-primary">Mental Readiness</h3>
                    <p className="font-body text-xs text-text-secondary leading-relaxed">
                      Hadapi simulasi pertanyaan agresif yang memicu stres mental agar terbiasa tenang dan fokus saat hari sidang yang sesungguhnya.
                    </p>
                  </div>
                  <div className="bg-surface-raised border border-border/60 p-6 rounded-xl flex flex-col gap-3">
                    <span className="text-3xl font-heading font-extrabold text-accent">02</span>
                    <h3 className="font-heading text-lg font-bold text-text-primary">Methodology Test</h3>
                    <p className="font-body text-xs text-text-secondary leading-relaxed">
                      AI kami menyoroti setiap inkonsistensi data, kelemahan asumsi dasar, dan celah penelitian sebelum komite penguji Anda mengetahuinya.
                    </p>
                  </div>
                  <div className="bg-surface-raised border border-border/60 p-6 rounded-xl flex flex-col gap-3">
                    <span className="text-3xl font-heading font-extrabold text-success">03</span>
                    <h3 className="font-heading text-lg font-bold text-text-primary">Argument Blueprint</h3>
                    <p className="font-body text-xs text-text-secondary leading-relaxed">
                      Pelajari pola sanggahan terbaik dengan 'Saran Perbaikan Kalimat' akademis untuk memposisikan ulang temuan riset Anda secara kuat.
                    </p>
                  </div>
                  <div className="bg-surface-raised border border-border/60 p-6 rounded-xl flex flex-col gap-3">
                    <span className="text-3xl font-heading font-extrabold text-text-secondary">04</span>
                    <h3 className="font-heading text-lg font-bold text-text-primary">RAG Technology</h3>
                    <p className="font-body text-xs text-text-secondary leading-relaxed">
                      AI membaca dokumen skripsi secara keseluruhan via embedding dan vector database, memberikan tinjauan mendalam per bab.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Comprehensive Defense Preparation */}
          <section className="max-w-[1280px] mx-auto px-6 md:px-12 py-20" id="features">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="font-heading text-3xl font-extrabold text-text-primary mb-4">
                Comprehensive Defense Preparation
              </h2>
              <p className="font-body text-base text-text-secondary leading-relaxed">
                AI canggih kami membedah naskah skripsi Anda secara semantik untuk memproyeksikan daftar pertanyaan tersulit yang paling mungkin diajukan dosen penguji.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="bg-surface rounded-xl p-8 border border-border card-hover group relative overflow-hidden shadow-sm">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                <div className="w-12 h-12 rounded-lg bg-primary-subtle flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-sm">
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    groups
                  </span>
                </div>
                <h3 className="font-heading text-lg font-bold text-text-primary mb-3">
                  AI Committee Simulation
                </h3>
                <p className="font-body text-sm text-text-secondary mb-6 leading-relaxed">
                  Uji kemampuan akademismu melawan berbagai tipe penguji AI—mulai dari yang membimbing secara konstruktif hingga yang agresif menguji detail riset Anda.
                </p>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-1 font-heading text-xs font-bold text-primary group-hover:text-primary-hover transition-colors"
                >
                  Selengkapnya{" "}
                  <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                    arrow_right_alt
                  </span>
                </a>
              </div>

              {/* Card 2 */}
              <div className="bg-surface rounded-xl p-8 border border-border card-hover group relative overflow-hidden shadow-sm">
                <div className="absolute top-0 left-0 w-full h-1 bg-accent transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                <div className="w-12 h-12 rounded-lg bg-accent-subtle flex items-center justify-center text-accent mb-6 group-hover:bg-accent group-hover:text-white transition-colors duration-300 shadow-sm">
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    troubleshoot
                  </span>
                </div>
                <h3 className="font-heading text-lg font-bold text-text-primary mb-3">
                  Deep Scrutiny
                </h3>
                <p className="font-body text-sm text-text-secondary mb-6 leading-relaxed">
                  Analisis mendalam otomatis untuk memetakan kelemahan teori, kontradiksi hasil Bab 4, hingga validitas data sampel. Tidak ada celah yang terlewat.
                </p>
                <a
                  href="#solutions"
                  className="inline-flex items-center gap-1 font-heading text-xs font-bold text-accent group-hover:text-accent-hover transition-colors"
                >
                  Selengkapnya{" "}
                  <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                    arrow_right_alt
                  </span>
                </a>
              </div>

              {/* Card 3 */}
              <div className="bg-surface rounded-xl p-8 border border-border card-hover group relative overflow-hidden shadow-sm">
                <div className="absolute top-0 left-0 w-full h-1 bg-success transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                <div className="w-12 h-12 rounded-lg bg-success-subtle flex items-center justify-center text-success mb-6 group-hover:bg-success group-hover:text-white transition-colors duration-300 shadow-sm">
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    donut_large
                  </span>
                </div>
                <h3 className="font-heading text-lg font-bold text-text-primary mb-3">
                  Confidence Scoring
                </h3>
                <p className="font-body text-sm text-text-secondary mb-6 leading-relaxed">
                  Pantau grafik kesiapan sidangmu dari waktu ke waktu dengan skor kuantitatif 0-100 di tiga aspek: Metodologi, Teori, dan Ketahanan Argumentasi.
                </p>
                <a
                  href="#solutions"
                  className="inline-flex items-center gap-1 font-heading text-xs font-bold text-success hover:text-success-subtle transition-colors"
                >
                  Selengkapnya{" "}
                  <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                    arrow_right_alt
                  </span>
                </a>
              </div>
            </div>
          </section>

          {/* Section: Fitur Unggulan Lebih Mendalam */}
          <section className="bg-surface-raised border-y border-border/60 py-20">
            <div className="max-w-[1280px] mx-auto px-6 md:px-12">
              <div className="text-center mb-16 max-w-2xl mx-auto">
                <span className="text-primary font-bold tracking-wider uppercase text-xs">Teknologi Inti</span>
                <h2 className="font-heading text-3xl font-extrabold text-text-primary mt-2">
                  Mengapa Memilih Simulator AI Phom?
                </h2>
              </div>

              <div className="space-y-16">
                {/* Deep Feature 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-5">
                    <div className="inline-flex items-center gap-2 bg-accent-subtle text-accent border border-accent/20 px-3.5 py-1 rounded-full text-xs font-semibold">
                      Interactive Rebuttals
                    </div>
                    <h3 className="font-heading text-2xl font-extrabold text-text-primary">
                      Maksimal 2 Kali Sanggahan Per Pertanyaan (Sub-Turns)
                    </h3>
                    <p className="font-body text-sm text-text-secondary leading-relaxed">
                      Di ruang sidang sesungguhnya, dosen tidak selalu puas dengan jawaban pertama Anda. Phom didesain dengan mekanisme **Sub-Turn**. Jika argumen pertama Anda lemah, AI penguji akan membantah jawaban Anda dengan sanggahan kritis (maksimal 2 kali sanggahan).
                    </p>
                    <p className="font-body text-sm text-text-secondary leading-relaxed">
                      Mekanisme ini melatih stamina mental Anda untuk mempertahankan validitas skripsi secara konsisten tanpa panik.
                    </p>
                  </div>
                  <div className="bg-surface border border-border p-6 rounded-xl shadow-sm space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold text-text-secondary border-b border-border/60 pb-3">
                      <span>STATUS PERTANYAAN</span>
                      <span className="text-accent bg-accent-subtle px-2 py-0.5 rounded border border-accent/10">Sanggahan 2/2</span>
                    </div>
                    <div className="bg-surface-raised p-4 rounded-lg border border-border/40 text-xs text-text-primary leading-relaxed">
                      "Definisi 'theoretical saturation' Anda pada Bab 3 belum jelas. Anda menyebutkan wawancara selesai pada informan ke-15, tapi apa indikator saturasi datanya?"
                    </div>
                    <div className="bg-primary text-white p-4 rounded-lg text-xs leading-relaxed text-right ml-10">
                      "Kami menentukan saturasi data saat 3 wawancara terakhir tidak lagi menghasilkan tema atau kode konseptual baru."
                    </div>
                  </div>
                </div>

                {/* Deep Feature 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center lg:flex-row-reverse">
                  <div className="space-y-5 lg:order-2">
                    <div className="inline-flex items-center gap-2 bg-success-subtle text-success border border-success/20 px-3.5 py-1 rounded-full text-xs font-semibold">
                      Comprehensive Grading
                    </div>
                    <h3 className="font-heading text-2xl font-extrabold text-text-primary">
                      Penilaian Multi-Dimensi Berbobot
                    </h3>
                    <p className="font-body text-sm text-text-secondary leading-relaxed">
                      Tidak ada nilai tebak-tebakan. Evaluasi akhir sidang Anda dihitung menggunakan formula berbobot profesional berdasarkan standar penilaian akademik universitas:
                    </p>
                    <div className="bg-surface border border-border p-4 rounded-lg space-y-2 text-xs font-semibold text-text-secondary font-mono">
                      <div>🗂️ Metodologi & Validitas (Bobot 40%)</div>
                      <div>📘 Penguasaan Teori & Tinjauan (Bobot 30%)</div>
                      <div>🗣️ Ketahanan Argumentasi (Bobot 30%)</div>
                    </div>
                    <p className="font-body text-sm text-text-secondary leading-relaxed">
                      Nilai akhir berkisar dari skala **0 hingga 100**, dilengkapi dengan visualisasi kelemahan per bab untuk perbaikan cepat sebelum hari-H.
                    </p>
                  </div>
                  <div className="bg-surface border border-border p-8 rounded-xl shadow-sm flex flex-col items-center justify-center gap-6 lg:order-1">
                    <div className="relative w-36 h-36 flex items-center justify-center rounded-full border-8 border-primary-subtle border-t-primary animate-pulse">
                      <div className="text-center">
                        <div className="text-3xl font-heading font-extrabold text-text-primary">78<span className="text-sm text-text-secondary">/100</span></div>
                        <div className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mt-1">Ready for Defense</div>
                      </div>
                    </div>
                    <div className="w-full space-y-2">
                      <div className="flex justify-between text-xs font-bold text-text-secondary">
                        <span>Metodologi</span>
                        <span>85/100</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: "85%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Solutions */}
          <section className="max-w-[1280px] mx-auto px-6 md:px-12 py-20" id="solutions">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="font-heading text-3xl font-extrabold text-text-primary mb-4">
                Solutions Tailored for Every Researcher
              </h2>
              <p className="font-body text-base text-text-secondary leading-relaxed">
                Pilih fokus uji coba yang paling krusial untuk naskah skripsi Anda saat ini.
              </p>
            </div>

            <div className="flex justify-center border-b border-border mb-12">
              <div className="flex gap-8">
                <button
                  onClick={() => setActiveTab("methodology")}
                  className={`pb-4 text-sm font-bold tracking-wide transition-all ${
                    activeTab === "methodology"
                      ? "border-b-2 border-primary text-primary"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Methodology Stress-Test
                </button>
                <button
                  onClick={() => setActiveTab("theory")}
                  className={`pb-4 text-sm font-bold tracking-wide transition-all ${
                    activeTab === "theory"
                      ? "border-b-2 border-primary text-primary"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Theoretical Foundation
                </button>
                <button
                  onClick={() => setActiveTab("argument")}
                  className={`pb-4 text-sm font-bold tracking-wide transition-all ${
                    activeTab === "argument"
                      ? "border-b-2 border-primary text-primary"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Argument Weakness
                </button>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-8 md:p-12 shadow-sm">
              {activeTab === "methodology" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="flex flex-col gap-6">
                    <h3 className="font-heading text-2xl font-extrabold text-text-primary">
                      Rigorous Methodological Stress-Test
                    </h3>
                    <p className="font-body text-base text-text-secondary leading-relaxed">
                      Identifikasi celah fatal dalam metodologi dan desain penelitian Anda sebelum dosen penguji mengetahuinya. Evaluasi mencakup ketepatan model regresi, ukuran sampel, dan bias variabel.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3 text-sm font-semibold text-text-secondary">
                        <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                        Menghindari bias sampling dan batasan penelitian yang rapuh.
                      </li>
                      <li className="flex items-center gap-3 text-sm font-semibold text-text-secondary">
                        <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                        Memvalidasi robustness data kuantitatif / kualitatif.
                      </li>
                      <li className="flex items-center gap-3 text-sm font-semibold text-text-secondary">
                        <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                        Uji konsistensi instrumen pengukuran variabel.
                      </li>
                    </ul>
                  </div>
                  <div className="bg-surface-raised border border-border p-6 rounded-xl flex flex-col gap-4">
                    <div className="h-6 w-1/3 bg-primary-subtle text-primary text-xs font-bold px-2 py-1 rounded flex items-center justify-center">METODOLOGI</div>
                    <div className="space-y-2">
                      <div className="h-2 w-full bg-slate-300 rounded"></div>
                      <div className="h-2 w-5/6 bg-slate-200 rounded"></div>
                      <div className="h-2 w-4/5 bg-slate-200 rounded"></div>
                    </div>
                    <div className="mt-4 border-t border-border pt-4 text-xs font-bold text-danger flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">warning</span>
                      Inkonsistensi terdeteksi pada penentuan variabel kontrol di Bab 3.
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "theory" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="flex flex-col gap-6">
                    <h3 className="font-heading text-2xl font-extrabold text-text-primary">
                      Theoretical Foundation Check
                    </h3>
                    <p className="font-body text-base text-text-secondary leading-relaxed">
                      Uji keselarasan kerangka teoretis dengan rumusan masalah dan temuan data di Bab 4. AI memastikan transisi teoretis Anda kokoh.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3 text-sm font-semibold text-text-secondary">
                        <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                        Validasi keselarasan paradigma teoretis yang digunakan.
                      </li>
                      <li className="flex items-center gap-3 text-sm font-semibold text-text-secondary">
                        <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                        Deteksi ketimpangan sitasi teori pendukung.
                      </li>
                      <li className="flex items-center gap-3 text-sm font-semibold text-text-secondary">
                        <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                        Menghubungkan temuan mikro ke teori makro secara koheren.
                      </li>
                    </ul>
                  </div>
                  <div className="bg-surface-raised border border-border p-6 rounded-xl flex flex-col gap-4">
                    <div className="h-6 w-1/3 bg-indigo-55 bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-1 rounded flex items-center justify-center">TEORI</div>
                    <div className="space-y-2">
                      <div className="h-2 w-full bg-slate-300 rounded"></div>
                      <div className="h-2 w-full bg-slate-200 rounded"></div>
                    </div>
                    <div className="mt-4 border-t border-border pt-4 text-xs font-bold text-success flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Korelasi antara paradigma Habitus Bourdieu dan hasil Bab 4 sudah koheren.
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "argument" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="flex flex-col gap-6">
                    <h3 className="font-heading text-2xl font-extrabold text-text-primary">
                      Argument Weakness Diagnostics
                    </h3>
                    <p className="font-body text-base text-text-secondary leading-relaxed">
                      Evaluasi retorika dan ketahanan jawaban Anda saat ditekan oleh sanggahan kritis AI.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3 text-sm font-semibold text-text-secondary">
                        <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                        Menghindari jawaban defensif yang melemahkan otoritas.
                      </li>
                      <li className="flex items-center gap-3 text-sm font-semibold text-text-secondary">
                        <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                        Penyusunan ulang kalimat sanggahan dengan tata bahasa akademis.
                      </li>
                      <li className="flex items-center gap-3 text-sm font-semibold text-text-secondary">
                        <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                        Peta kelemahan jawaban per pertanyaan simulasi.
                      </li>
                    </ul>
                  </div>
                  <div className="bg-surface-raised border border-border p-6 rounded-xl flex flex-col gap-4">
                    <div className="h-6 w-1/3 bg-orange-50 text-orange-700 text-xs font-bold px-2 py-1 rounded flex items-center justify-center">ARGUMENTASI</div>
                    <div className="space-y-2">
                      <div className="h-2 w-full bg-slate-300 rounded"></div>
                      <div className="h-2 w-4/5 bg-slate-200 rounded"></div>
                    </div>
                    <div className="mt-4 border-t border-border pt-4 text-xs font-bold text-warning flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">info</span>
                      Saran perbaikan: Hindari kata 'mungkin' saat mempertahankan data primer.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Section: Cara Pakai */}
          <section className="max-w-[1280px] mx-auto px-6 md:px-12 py-20" id="how-it-works">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <span className="text-primary font-bold tracking-wider uppercase text-xs">Petunjuk Penggunaan</span>
              <h2 className="font-heading text-3xl font-extrabold text-text-primary mt-2">
                Langkah Menuju Kelulusan dengan Phom
              </h2>
              <p className="font-body text-base text-text-secondary mt-2">
                Simulator kami dirancang sangat ramah pengguna dengan alur sidang terintegrasi penuh.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="flex flex-col gap-8">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-heading font-extrabold text-sm flex-shrink-0">
                    1
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-heading text-lg font-bold text-text-primary">Upload PDF Skripsi</h3>
                    <p className="font-body text-sm text-text-secondary leading-relaxed">
                      Unggah draf skripsi naskah akademik Anda (format PDF) dengan aman. Data naskah Anda dienkripsi penuh dan dijaga kerahasiaannya.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-heading font-extrabold text-sm flex-shrink-0">
                    2
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-heading text-lg font-bold text-text-primary">Verifikasi Bab & Halaman</h3>
                    <p className="font-body text-sm text-text-secondary leading-relaxed">
                      AI Phom otomatis mendeteksi Daftar Isi untuk memetakan rentang halaman per bab (misal: Bab I hal 1-10, Bab III hal 26-45). Anda dapat mengonfirmasi atau mengedit manual rentang halaman ini.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-heading font-extrabold text-sm flex-shrink-0">
                    3
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-heading text-lg font-bold text-text-primary">Atur Fokus & Intensitas Sesi</h3>
                    <p className="font-body text-sm text-text-secondary leading-relaxed">
                      Pilih bab mana saja yang ingin diuji saat ini, lalu pilih mode intensitas sesi: *Quick Review* (3-5 pertanyaan), *Standard Exam* (8-10 pertanyaan), atau *Deep Drill* (12-15 pertanyaan) untuk ulasan super mendalam.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-heading font-extrabold text-sm flex-shrink-0">
                    4
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-heading text-lg font-bold text-text-primary">Mulai Simulasi & Hadapi Sanggahan</h3>
                    <p className="font-body text-sm text-text-secondary leading-relaxed">
                      Masuk ke ruang sidang virtual. Jawab pertanyaan tertulis dosen penguji AI, dan pertahankan argumen Anda saat AI memunculkan sanggahan kritis secara beruntun.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-heading font-extrabold text-sm flex-shrink-0">
                    5
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-heading text-lg font-bold text-text-primary">Lihat Laporan Evaluasi & Revisi</h3>
                    <p className="font-body text-sm text-text-secondary leading-relaxed">
                      Setelah sesi berakhir (minimal telah menjawab 3 pertanyaan), naskah penilaian berbobot dihitung secara instan. Pelajari peta kelemahan per bab serta 'Saran Perbaikan Kalimat' dari AI.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-surface border border-border p-8 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-20 h-20 rounded-full bg-primary-subtle flex items-center justify-center text-primary mb-6 animate-pulse">
                  <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 0" }}>
                    cloud_upload
                  </span>
                </div>
                <h3 className="font-heading text-xl font-bold text-text-primary mb-2">
                  Drop your manuscript here
                </h3>
                <p className="font-body text-xs text-text-secondary mb-6 max-w-xs leading-relaxed">
                  PDF atau DOCX dengan ukuran berkas maksimal 25MB. Naskah Anda 100% aman dan terenkripsi.
                </p>
                <button
                  onClick={() => openAuthModal("signup")}
                  className="bg-primary text-white px-8 py-3 rounded-lg font-heading text-sm font-bold button-hover shadow-sm focus:outline-none"
                >
                  Pilih Berkas Skripsi
                </button>
              </div>
            </div>
          </section>

          {/* Section: FAQ */}
          <section className="max-w-[1280px] mx-auto px-6 md:px-12 py-20 border-t border-border/60" id="faq">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="font-heading text-3xl font-extrabold text-text-primary mb-4">
                Frequently Asked Questions
              </h2>
              <p className="font-body text-base text-text-secondary">
                Pertanyaan umum seputar penggunaan simulator skripsi Phom.
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              <div className={`border border-border rounded-xl bg-surface transition-all ${activeFaq === 0 ? "border-primary/40 shadow-sm" : ""}`}>
                <button
                  onClick={() => toggleFaq(0)}
                  className="w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none"
                >
                  <span className="font-heading text-sm md:text-base font-bold text-text-primary">
                    Apakah berkas skripsi saya aman di Phom?
                  </span>
                  <span className={`material-symbols-outlined text-text-secondary transition-transform duration-300 ${activeFaq === 0 ? "rotate-45 text-primary" : ""}`}>
                    add
                  </span>
                </button>
                <div
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                    activeFaq === 0 ? "max-h-40 pb-5 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="font-body text-sm text-text-secondary leading-relaxed">
                    Ya, keamanan data adalah prioritas utama kami. Semua berkas yang Anda unggah dienkripsi secara penuh di penyimpanan Supabase Storage pribadi. Naskah Anda tidak akan dipublikasikan secara umum dan tidak digunakan untuk melatih model publik.
                  </p>
                </div>
              </div>

              <div className={`border border-border rounded-xl bg-surface transition-all ${activeFaq === 1 ? "border-primary/40 shadow-sm" : ""}`}>
                <button
                  onClick={() => toggleFaq(1)}
                  className="w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none"
                >
                  <span className="font-heading text-sm md:text-base font-bold text-text-primary">
                    Format dokumen dan ukuran berkas apa saja yang didukung?
                  </span>
                  <span className={`material-symbols-outlined text-text-secondary transition-transform duration-300 ${activeFaq === 1 ? "rotate-45 text-primary" : ""}`}>
                    add
                  </span>
                </button>
                <div
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                    activeFaq === 1 ? "max-h-40 pb-5 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="font-body text-sm text-text-secondary leading-relaxed">
                    Saat ini Phom mendukung berkas dengan format PDF dan naskah dokumen dengan ukuran maksimal sebesar 25 MB per dokumen. Kami merekomendasikan dokumen PDF yang sudah diparse secara teks (bukan hasil scan gambar kasar) untuk hasil pemetaan terbaik.
                  </p>
                </div>
              </div>

              <div className={`border border-border rounded-xl bg-surface transition-all ${activeFaq === 2 ? "border-primary/40 shadow-sm" : ""}`}>
                <button
                  onClick={() => toggleFaq(2)}
                  className="w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none"
                >
                  <span className="font-heading text-sm md:text-base font-bold text-text-primary">
                    Apakah saya bisa memilih bab tertentu saja untuk disimulasikan?
                  </span>
                  <span className={`material-symbols-outlined text-text-secondary transition-transform duration-300 ${activeFaq === 2 ? "rotate-45 text-primary" : ""}`}>
                    add
                  </span>
                </button>
                <div
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                    activeFaq === 2 ? "max-h-40 pb-5 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="font-body text-sm text-text-secondary leading-relaxed">
                    Tentu! Pada bagian dashboard simulator, Anda dapat memilih fokus bab secara spesifik menggunakan pill selector. Anda bisa memilih Bab 3 saja untuk fokus mematangkan metodologi, atau memilih beberapa bab sekaligus sesuai kebutuhan.
                  </p>
                </div>
              </div>

              <div className={`border border-border rounded-xl bg-surface transition-all ${activeFaq === 3 ? "border-primary/40 shadow-sm" : ""}`}>
                <button
                  onClick={() => toggleFaq(3)}
                  className="w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none"
                >
                  <span className="font-heading text-sm md:text-base font-bold text-text-primary">
                    Bagaimana pembagian mode simulasi sidang di Phom?
                  </span>
                  <span className={`material-symbols-outlined text-text-secondary transition-transform duration-300 ${activeFaq === 3 ? "rotate-45 text-primary" : ""}`}>
                    add
                  </span>
                </button>
                <div
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                    activeFaq === 3 ? "max-h-40 pb-5 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="font-body text-sm text-text-secondary leading-relaxed">
                    Kami menyediakan 3 tingkatan intensitas simulasi: **Quick Review** (sidang cepat 3-5 pertanyaan untuk evaluasi kasar), **Standard Exam** (sidang normal 8-10 pertanyaan), dan **Deep Drill** (sidang komprehensif 12-15 pertanyaan untuk membongkar detail riset terkecil).
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Banner */}
          <section className="max-w-[1280px] mx-auto px-6 md:px-12 py-12">
            <div className="bg-primary rounded-2xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-xl shadow-primary/20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-subtle/20 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2"></div>
              
              <div className="relative z-10 max-w-xl text-center md:text-left">
                <h2 className="font-heading text-3xl font-extrabold text-white mb-4">
                  Don't Leave Your Success to Chance
                </h2>
                <p className="font-body text-sm md:text-base text-primary-subtle mb-0 leading-relaxed">
                  Gabung bersama ribuan mahasiswa sukses lainnya yang menghadapi sidang skripsi mereka dengan keyakinan akademis yang matang.
                </p>
              </div>
              
              <div className="relative z-10 flex flex-col items-center md:items-end gap-3 flex-shrink-0">
                <button
                  onClick={() => openAuthModal("signup")}
                  className="bg-white text-primary px-8 py-4 rounded-xl font-heading text-sm font-bold button-hover shadow-lg focus:outline-none"
                >
                  Daftar Akun Sekarang
                </button>
                <span className="font-body text-xs text-primary-subtle">
                  Tanpa kartu kredit • Gratis uji coba
                </span>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-slate-900 w-full border-t border-white/5 py-16 text-slate-300">
          <div className="max-w-[1280px] mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between gap-12 md:gap-8">
            <div className="flex flex-col gap-4 max-w-xs">
              <a href="/" className="flex items-center gap-2 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3525cd] to-[#6f3dd9] flex items-center justify-center text-white group-hover:scale-105 transition-transform duration-300 shadow-md shadow-indigo-600/20">
                  <span className="material-symbols-outlined text-xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                    neurology
                  </span>
                </div>
                <span className="text-xl font-heading font-bold text-white tracking-tight">Phom</span>
              </a>
              <p className="font-body text-xs text-slate-400 leading-relaxed mt-2">
                Platform SaaS simulator sidang skripsi terbaik untuk membantu melatih mental dan argumentasi akademis mahasiswa tingkat akhir.
              </p>
              <div className="flex gap-4 mt-2">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer text-xs font-bold">
                  X
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer text-xs font-bold">
                  in
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1 md:ml-12">
              <div className="flex flex-col gap-3">
                <h4 className="font-heading text-xs font-bold text-white mb-2 tracking-wider uppercase">
                  Produk
                </h4>
                <a href="#features" className="font-body text-xs text-slate-400 hover:text-white transition-colors">
                  Fitur Utama
                </a>
                <a href="#solutions" className="font-body text-xs text-slate-400 hover:text-white transition-colors">
                  Fokus Solusi
                </a>
                <a href="#how-it-works" className="font-body text-xs text-slate-400 hover:text-white transition-colors">
                  Cara Kerja
                </a>
              </div>

              <div className="flex flex-col gap-3">
                <h4 className="font-heading text-xs font-bold text-white mb-2 tracking-wider uppercase">
                  Sumber Daya
                </h4>
                <a href="#" className="font-body text-xs text-slate-400 hover:text-white transition-colors">
                  Dokumentasi
                </a>
                <a href="#" className="font-body text-xs text-slate-400 hover:text-white transition-colors">
                  Panduan Sidang
                </a>
                <a href="#" className="font-body text-xs text-slate-400 hover:text-white transition-colors">
                  Blog Akademik
                </a>
              </div>

              <div className="flex flex-col gap-3">
                <h4 className="font-heading text-xs font-bold text-white mb-2 tracking-wider uppercase">
                  Perusahaan
                </h4>
                <a href="#" className="font-body text-xs text-slate-400 hover:text-white transition-colors">
                  Tentang Kami
                </a>
                <a href="#" className="font-body text-xs text-slate-400 hover:text-white transition-colors">
                  Kontak
                </a>
                <a href="#" className="font-body text-xs text-slate-400 hover:text-white transition-colors">
                  Karir
                </a>
              </div>

              <div className="flex flex-col gap-3">
                <h4 className="font-heading text-xs font-bold text-white mb-2 tracking-wider uppercase">
                  Legalitas
                </h4>
                <a href="#" className="font-body text-xs text-slate-400 hover:text-white transition-colors">
                  Kebijakan Privasi
                </a>
                <a href="#" className="font-body text-xs text-slate-400 hover:text-white transition-colors">
                  Syarat & Ketentuan
                </a>
              </div>
            </div>
          </div>

          <div className="max-w-[1280px] mx-auto px-6 md:px-12 mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-body text-xs text-slate-500">
              &copy; 2026 Phom AI Research. Hak cipta dilindungi undang-undang.
            </p>
            <div className="flex items-center gap-2 text-slate-500 font-body text-[10px] uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-success"></span> All systems operational
            </div>
          </div>
        </footer>
      </div>

      {/* 5. SLIDING AUTH MODAL POPUP (NOT BLURRED) */}
      {authModalOpen && (
        <div 
          onClick={closeAuthModal}
          className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${
            isClosing ? "modal-backdrop-closing" : "modal-backdrop-animated"
          }`}
        >
          <style jsx global>{`
            @keyframes modalFadeIn {
              from { opacity: 0; backdrop-filter: blur(0px); background-color: rgba(0, 0, 0, 0); }
              to { opacity: 1; backdrop-filter: blur(8px); background-color: rgba(0, 0, 0, 0.4); }
            }
            @keyframes modalFadeOut {
              from { opacity: 1; backdrop-filter: blur(8px); background-color: rgba(0, 0, 0, 0.4); }
              to { opacity: 0; backdrop-filter: blur(0px); background-color: rgba(0, 0, 0, 0); }
            }
            @keyframes cardScaleIn {
              from { transform: scale(0.92) translateY(20px); opacity: 0; }
              to { transform: scale(1) translateY(0); opacity: 1; }
            }
            @keyframes cardScaleOut {
              from { transform: scale(1) translateY(0); opacity: 1; }
              to { transform: scale(0.92) translateY(20px); opacity: 0; }
            }
            .modal-backdrop-animated {
              animation: modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            .modal-backdrop-closing {
              animation: modalFadeOut 0.2s cubic-bezier(0.4, 0, 1, 1) forwards;
            }
            .modal-card-animated {
              animation: cardScaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            }
            .modal-card-closing {
              animation: cardScaleOut 0.2s cubic-bezier(0.4, 0, 1, 1) forwards;
            }
          `}</style>
          {/* Modal Container Card with Close Button */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`relative ${
              isClosing ? "modal-card-closing" : "modal-card-animated"
            }`}
          >
            
            {/* Circular Close Button at Top-Right */}
            <button
              onClick={closeAuthModal}
              className="absolute -top-3 -right-3 z-[110] w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 shadow-md hover:scale-105 transition-all focus:outline-none"
              aria-label="Tutup"
            >
              <span className="material-symbols-outlined text-sm font-bold">close</span>
            </button>

            {/* Sliding Auth Card Component */}
            <SlidingAuthCard 
              initialMode={authMode} 
              onClose={closeAuthModal} 
            />

          </div>
        </div>
      )}
    </>
  );
}
