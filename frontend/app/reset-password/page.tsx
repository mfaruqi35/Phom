"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0F1117] flex items-center justify-center text-text-secondary-dark font-body">
          <div className="flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">
              autorenew
            </span>
            <p className="text-sm font-semibold">Memuat halaman...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Token pemulihan tidak valid atau tidak ditemukan.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("Semua kolom input wajib diisi.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Kata sandi baru minimal harus terdiri dari 8 karakter.");
      return;
    }

    await authClient.resetPassword(
      {
        newPassword,
        token,
      },
      {
        onRequest: () => {
          setIsLoading(true);
        },
        onSuccess: () => {
          setIsLoading(false);
          setSuccess("Kata sandi berhasil diperbarui! Mengalihkan ke halaman masuk...");
          setNewPassword("");
          setConfirmPassword("");
          setTimeout(() => {
            router.push("/?login=true");
          }, 2500);
        },
        onError: (ctx) => {
          setIsLoading(false);
          setError(
            ctx.error.message ||
              "Gagal mengatur ulang kata sandi. Tautan mungkin telah kedaluwarsa atau sudah digunakan."
          );
        },
      }
    );
  };

  return (
    <div className="relative min-h-screen bg-[#0F1117] flex items-center justify-center px-4 overflow-hidden font-body text-[#F9FAFB]">
      {/* Decorative Blur Blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#3525cd]/15 rounded-full blur-[100px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-[#6f3dd9]/15 rounded-full blur-[100px] -z-10 animate-pulse"></div>

      <div className="w-full max-w-md bg-[#1A1D27] border border-[#2E3347] rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.3)] backdrop-blur-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3525cd] to-[#6f3dd9] flex items-center justify-center text-white group-hover:scale-105 transition-transform duration-300 shadow-md shadow-indigo-600/20">
              <span
                className="material-symbols-outlined text-2xl font-bold"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                neurology
              </span>
            </div>
            <span className="text-2xl font-heading font-extrabold text-[#3525cd] tracking-tight bg-gradient-to-r from-[#4F46E5] to-[#6f3dd9] bg-clip-text text-transparent">
              Phom
            </span>
          </Link>
          <h2 className="font-heading text-2xl font-bold text-[#F9FAFB] tracking-tight">
            Atur Ulang Kata Sandi
          </h2>
          <p className="text-xs text-[#9CA3AF] mt-1.5 leading-relaxed">
            Masukkan kata sandi baru untuk mengamankan akun Phom Anda
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-5 text-xs text-[#EF4444] bg-[#FEF2F2]/10 border border-[#EF4444]/20 p-3.5 rounded-2xl flex items-start gap-2.5 animate-fadeIn">
            <span className="material-symbols-outlined text-sm flex-shrink-0 mt-0.5">
              error
            </span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 text-xs text-[#22C55E] bg-[#F0FDF4]/10 border border-[#22C55E]/20 p-3.5 rounded-2xl flex items-start gap-2.5 animate-fadeIn">
            <span className="material-symbols-outlined text-sm flex-shrink-0 mt-0.5">
              check_circle
            </span>
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider pl-1">
              Kata Sandi Baru
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-base">
                lock
              </span>
              <input
                type="password"
                placeholder="Kata sandi baru (min. 8 karakter)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isLoading || !!success}
                className="w-full h-11 pl-11 pr-4 bg-[#22263A] border border-[#2E3347] rounded-xl text-xs text-[#F9FAFB] focus:outline-none focus:border-[#4F46E5] focus:bg-[#1A1D27] transition-all focus:ring-4 focus:ring-[#4F46E5]/10 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider pl-1">
              Konfirmasi Kata Sandi
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-base">
                lock_reset
              </span>
              <input
                type="password"
                placeholder="Ulangi kata sandi baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading || !!success}
                className="w-full h-11 pl-11 pr-4 bg-[#22263A] border border-[#2E3347] rounded-xl text-xs text-[#F9FAFB] focus:outline-none focus:border-[#4F46E5] focus:bg-[#1A1D27] transition-all focus:ring-4 focus:ring-[#4F46E5]/10 disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !!success}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#6f3dd9] hover:from-[#4338CA] hover:to-[#5d2ec7] text-white text-xs font-bold transition-all shadow-[0_4px_14px_rgba(79,70,229,0.35)] hover:shadow-lg active:scale-[0.98] mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined text-sm animate-spin">
                  autorenew
                </span>
                Memperbarui...
              </>
            ) : (
              "ATUR ULANG KATA SANDI"
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="text-center mt-6 text-xs text-[#9CA3AF] font-medium border-t border-[#2E3347] pt-5">
          Kembali ke{" "}
          <Link href="/" className="text-[#4F46E5] hover:underline">
            Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
