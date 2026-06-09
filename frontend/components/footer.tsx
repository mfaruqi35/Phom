import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 w-full border-t border-white/5 py-16 text-slate-300">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between gap-12 md:gap-8">
        <div className="flex flex-col gap-4 max-w-xs">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3525cd] to-[#6f3dd9] flex items-center justify-center text-white group-hover:scale-105 transition-transform duration-300 shadow-md shadow-indigo-600/20">
              <span
                className="material-symbols-outlined text-xl font-bold"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                neurology
              </span>
            </div>
            <span className="text-xl font-heading font-bold text-white tracking-tight">
              Phom
            </span>
          </Link>
          <p className="font-body text-xs text-slate-400 leading-relaxed mt-2">
            Platform SaaS simulator sidang skripsi terbaik untuk membantu
            melatih mental dan argumentasi akademis mahasiswa tingkat akhir.
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
            <a
              href="#features"
              className="font-body text-xs text-slate-400 hover:text-white transition-colors"
            >
              Fitur Utama
            </a>
            <a
              href="#solutions"
              className="font-body text-xs text-slate-400 hover:text-white transition-colors"
            >
              Fokus Solusi
            </a>
            <a
              href="#how-it-works"
              className="font-body text-xs text-slate-400 hover:text-white transition-colors"
            >
              Cara Kerja
            </a>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-heading text-xs font-bold text-white mb-2 tracking-wider uppercase">
              Sumber Daya
            </h4>
            <a
              href="#"
              className="font-body text-xs text-slate-400 hover:text-white transition-colors"
            >
              Dokumentasi
            </a>
            <a
              href="#"
              className="font-body text-xs text-slate-400 hover:text-white transition-colors"
            >
              Panduan Sidang
            </a>
            <a
              href="#"
              className="font-body text-xs text-slate-400 hover:text-white transition-colors"
            >
              Blog Akademik
            </a>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-heading text-xs font-bold text-white mb-2 tracking-wider uppercase">
              Perusahaan
            </h4>
            <a
              href="#"
              className="font-body text-xs text-slate-400 hover:text-white transition-colors"
            >
              Tentang Kami
            </a>
            <a
              href="#"
              className="font-body text-xs text-slate-400 hover:text-white transition-colors"
            >
              Kontak
            </a>
            <a
              href="#"
              className="font-body text-xs text-slate-400 hover:text-white transition-colors"
            >
              Karir
            </a>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-heading text-xs font-bold text-white mb-2 tracking-wider uppercase">
              Legalitas
            </h4>
            <a
              href="#"
              className="font-body text-xs text-slate-400 hover:text-white transition-colors"
            >
              Kebijakan Privasi
            </a>
            <a
              href="#"
              className="font-body text-xs text-slate-400 hover:text-white transition-colors"
            >
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
          <span className="w-2 h-2 rounded-full bg-success"></span> All
          systems operational
        </div>
      </div>
    </footer>
  );
}
