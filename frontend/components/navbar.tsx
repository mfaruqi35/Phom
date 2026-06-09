"use client";

import { useState } from "react";

interface NavbarProps {
  scrolled: boolean;
  openAuthModal: (mode: "signin" | "signup") => void;
}

export default function Navbar({ scrolled, openAuthModal }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
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
            <span
              className="material-symbols-outlined text-xl font-bold"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
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
              onClick={() => {
                setMobileMenuOpen(false);
                openAuthModal("signin");
              }}
              className="font-heading text-base font-semibold text-gray-600 hover:text-primary text-center py-2 focus:outline-none transition-colors"
            >
              Masuk
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openAuthModal("signup");
              }}
              className="bg-[#1D4ED8] hover:bg-[#1e40af] text-white text-center py-3 rounded-full font-heading text-base font-bold shadow-sm focus:outline-none hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Coba Gratis
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
