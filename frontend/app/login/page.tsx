"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type UserRole = "mahasiswa" | "dosen" | "admin" | "";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(false);

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

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Sync state based on URL parameters
  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "signup") {
      setIsSignUp(true);
    } else {
      setIsSignUp(false);
    }
  }, [searchParams]);

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

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccess("Registrasi berhasil! Mengalihkan...");
      setTimeout(() => {
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
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between bg-[#F8F9FF] p-6 font-['Poppins',sans-serif] relative overflow-hidden">
      
      {/* 1. BACKGROUND DECORATIONS (Floating Orbs & Grid) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
      
      {/* Ambient Pulsing Orb Left */}
      <div className="absolute top-[10%] left-[-5%] w-[450px] h-[450px] bg-gradient-to-tr from-indigo-300 to-purple-400 rounded-full blur-[110px] opacity-40 animate-pulse pointer-events-none" style={{ animationDuration: '8s' }}></div>
      {/* Ambient Pulsing Orb Right */}
      <div className="absolute bottom-[10%] right-[-5%] w-[450px] h-[450px] bg-gradient-to-tr from-orange-200 to-rose-300 rounded-full blur-[110px] opacity-30 animate-pulse pointer-events-none" style={{ animationDuration: '12s' }}></div>

      {/* Styled inline sheet */}
      <style jsx>{`
        .auth-card {
          position: relative;
          overflow: hidden;
          width: 880px;
          max-width: 100%;
          min-height: 600px;
          background-color: #fff;
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(79, 70, 229, 0.08), 0 0 40px rgba(0, 0, 0, 0.01);
          border: 1px solid rgba(199, 196, 216, 0.4);
          transition: all 0.5s ease;
        }
        .auth-card:hover {
          box-shadow: 0 30px 60px -10px rgba(79, 70, 229, 0.12), 0 0 50px rgba(0, 0, 0, 0.02);
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
          background: linear-gradient(135deg, rgba(53, 37, 205, 0.88), rgba(111, 61, 217, 0.88));
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

      {/* 2. TOP NAV: Back to landing page */}
      <div className="w-full max-w-5xl flex justify-start items-center z-10 py-2">
        <a 
          href="/" 
          className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#3525cd] transition-all bg-white/80 backdrop-blur px-4 py-2 rounded-xl border border-[#C7C4D8]/50 shadow-sm active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-sm font-bold">arrow_back</span>
          <span>Kembali ke Beranda</span>
        </a>
      </div>

      {/* 3. CENTER: Sliding authentication card */}
      <div className="auth-card flex z-10 my-auto">
        
        {/* SIGN IN (LOGIN) FORM PANEL */}
        <div className="form-container sign-in-container flex flex-col justify-center px-10 md:px-14 py-8">
          <form onSubmit={handleSignInSubmit} className="space-y-6 text-center">
            <div className="space-y-1.5">
              <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Sign In</h1>
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
                  className="w-full h-11 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#3525cd] focus:bg-white transition-all focus:ring-4 focus:ring-[#3525cd]/10"
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
                  className="w-full h-11 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#3525cd] focus:bg-white transition-all focus:ring-4 focus:ring-[#3525cd]/10"
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
                  className="w-4 h-4 text-[#3525cd] border-gray-300 rounded focus:ring-[#3525cd]/20 accent-[#3525cd]"
                />
                <span>Remember me</span>
              </label>
              <a href="#" className="hover:underline hover:text-[#3525cd] transition-colors">Forgot password?</a>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-[#3525cd] hover:bg-[#281baf] text-white text-xs font-bold transition-all shadow-sm hover:shadow-md active:scale-[0.98] mt-2"
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
              className="w-full h-11 rounded-xl border border-indigo-200 hover:border-[#3525cd] bg-indigo-50/20 hover:bg-indigo-50/50 text-[#3525cd] text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
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
              <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Create Account</h1>
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
                  className="w-full h-11 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#3525cd] focus:bg-white transition-all focus:ring-4 focus:ring-[#3525cd]/10"
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
                  className="w-full h-11 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#3525cd] focus:bg-white transition-all focus:ring-4 focus:ring-[#3525cd]/10"
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
                  className="w-full h-11 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#3525cd] focus:bg-white transition-all focus:ring-4 focus:ring-[#3525cd]/10"
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
                  className="w-full h-11 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#3525cd] focus:bg-white transition-all focus:ring-4 focus:ring-[#3525cd]/10"
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-[#3525cd] hover:bg-[#281baf] text-white text-xs font-bold transition-all shadow-sm hover:shadow-md active:scale-[0.98] mt-3"
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
              className="w-full h-11 rounded-xl border border-indigo-200 hover:border-[#3525cd] bg-indigo-50/20 hover:bg-indigo-50/50 text-[#3525cd] text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
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
              <h1 className="text-3xl font-bold mb-3 tracking-tight">Welcome Back!</h1>
              <p className="text-xs leading-relaxed opacity-85 mb-8 max-w-[250px]">
                To keep connected with us please login with your personal info
              </p>
              <button
                onClick={() => setIsSignUp(false)}
                className="w-32 h-10 rounded-full border-2 border-white bg-transparent hover:bg-white text-white hover:text-[#3525cd] text-xs font-bold transition-all duration-300"
              >
                SIGN IN
              </button>
            </div>

            {/* Right Overlay panel (Signup trigger) */}
            <div className="overlay-panel overlay-right">
              <h1 className="text-3xl font-bold mb-3 tracking-tight">Hey There!</h1>
              <p className="text-xs leading-relaxed opacity-85 mb-8 max-w-[250px]">
                Begin your amazing journey by creating an account with us today
              </p>
              <button
                onClick={() => setIsSignUp(true)}
                className="w-32 h-10 rounded-full border-2 border-white bg-transparent hover:bg-white text-white hover:text-[#3525cd] text-xs font-bold transition-all duration-300"
              >
                SIGN UP
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* 4. FOOTER: Copyright notice */}
      <div className="w-full max-w-5xl text-center z-10 py-4 border-t border-[#C7C4D8]/30">
        <p className="text-[10px] text-gray-400 font-medium tracking-wide">
          Phom © 2026 — AI-Powered Thesis Defense Simulator. Designed for Academic Excellence.
        </p>
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F8F9FF] text-sm text-gray-500 font-semibold">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
