"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type UserRole = "user";

interface SlidingAuthCardProps {
  initialMode: "signin" | "signup";
  onClose: () => void;
}

export default function SlidingAuthCard({
  initialMode,
  onClose,
}: SlidingAuthCardProps) {
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
  const [signUpRole, setSignUpRole] = useState<UserRole>("user");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!signInEmail || !signInPassword) {
      setError("Email dan password wajib diisi.");
      return;
    }

    await authClient.signIn.email(
      {
        email: signInEmail,
        password: signInPassword,
        rememberMe: signInRemember,
      },
      {
        onRequest: () => {
          setIsLoading(true);
        },
        onSuccess: () => {
          setIsLoading(false);
          setSuccess("Masuk berhasil! Mengalihkan...");
          setTimeout(() => {
            onClose();
            router.push("/dashboard");
          }, 800);
        },
        onError: (ctx) => {
          setIsLoading(false);
          setError(ctx.error.message || "Gagal masuk. Silakan periksa kembali email dan password Anda.");
        },
      }
    );
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !signUpName ||
      !signUpEmail ||
      !signUpPassword ||
      !signUpConfirmPassword
    ) {
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

    await authClient.signUp.email(
      {
        email: signUpEmail,
        password: signUpPassword,
        name: signUpName,
      },
      {
        onRequest: () => {
          setIsLoading(true);
        },
        onSuccess: () => {
          setIsLoading(false);
          setSuccess("Pendaftaran berhasil! Mengalihkan...");
          setTimeout(() => {
            onClose();
            router.push("/dashboard");
          }, 1000);
        },
        onError: (ctx) => {
          setIsLoading(false);
          setError(ctx.error.message || "Gagal mendaftar. Silakan coba lagi.");
        },
      }
    );
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || "Gagal masuk dengan Google.");
    }
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
          border: 1px solid rgba(0, 0, 0, 0.05);
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
          background-image: url("/bg.gif");
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
          background: linear-gradient(
            135deg,
            rgba(79, 70, 229, 0.88),
            rgba(59, 130, 246, 0.88)
          );
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
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight font-heading">
              Sign In
            </h1>
            <p className="text-xs text-gray-400">
              Masuk untuk melanjutkan uji coba sidang
            </p>
          </div>

          {/* Error alert */}
          {error && !isSignUp && (
            <span className="text-red-500 text-xs block text-left bg-red-50 p-2.5 rounded border border-red-100 animate-fadeIn">
              {error}
            </span>
          )}

          {/* Fields */}
          <div className="space-y-3.5 text-left">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base">
                mail
              </span>
              <input
                type="email"
                placeholder="Alamat Email"
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                required
                className="w-full h-11 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white transition-all focus:ring-4 focus:ring-primary/10"
              />
            </div>

            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base">
                lock
              </span>
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
              <span>Ingat saya</span>
            </label>
            <a
              href="#"
              className="hover:underline hover:text-primary transition-colors"
            >
              Lupa password?
            </a>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-sm hover:shadow-md active:scale-[0.98] mt-2"
          >
            {isLoading ? "Sedang Masuk..." : "MASUK"}
          </button>

          {/* Google Sign In Option */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-gray-200/60"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
              atau
            </span>
            <div className="flex-grow border-t border-gray-200/60"></div>
          </div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full h-11 rounded-xl border border-gray-200 hover:border-primary bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all flex items-center justify-center gap-2.5 active:scale-[0.98] shadow-sm"
          >
            <i className="fa-brands fa-google text-[#EA4335] text-sm flex-shrink-0"></i>
            <span>Masuk dengan Google</span>
          </button>
        </form>
      </div>

      {/* SIGN UP (REGISTER) FORM PANEL */}
      <div className="form-container sign-up-container flex flex-col justify-center px-10 md:px-14 py-8">
        <form onSubmit={handleSignUpSubmit} className="space-y-4 text-center">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight font-heading">
              Buat Akun
            </h1>
            <p className="text-xs text-gray-400">
              Buat akun untuk memulai simulasi baru
            </p>
          </div>

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
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base">
                person
              </span>
              <input
                type="text"
                placeholder="Nama Lengkap"
                value={signUpName}
                onChange={(e) => setSignUpName(e.target.value)}
                required
                className="w-full h-11 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white transition-all focus:ring-4 focus:ring-primary/10"
              />
            </div>

            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base">
                mail
              </span>
              <input
                type="email"
                placeholder="Email"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                required
                className="w-full h-11 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white transition-all focus:ring-4 focus:ring-primary/10"
              />
            </div>

            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base">
                lock
              </span>
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
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base">
                lock
              </span>
              <input
                type="password"
                placeholder="Konfirmasi Password"
                value={signUpConfirmPassword}
                onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                required
                className="w-full h-11 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white transition-all focus:ring-4 focus:ring-primary/10"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-sm hover:shadow-md active:scale-[0.98] mt-3"
          >
            {isLoading ? "Membuat Akun..." : "DAFTAR"}
          </button>

          {/* Google Sign In Option */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-gray-200/60"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
              atau
            </span>
            <div className="flex-grow border-t border-gray-200/60"></div>
          </div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full h-11 rounded-xl border border-gray-200 hover:border-primary bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all flex items-center justify-center gap-2.5 active:scale-[0.98] shadow-sm"
          >
            <i className="fa-brands fa-google text-[#EA4335] text-sm flex-shrink-0"></i>
            <span>Masuk dengan Google</span>
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
            <h1 className="text-3xl font-bold mb-3 tracking-tight text-white">
              Welcome Back!
            </h1>
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
            <h1 className="text-3xl font-bold mb-3 tracking-tight text-white">
              Hey There!
            </h1>
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
