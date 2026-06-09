"use client";

import { useEffect, useRef } from "react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  documentTitle?: string;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  documentTitle = "Dokumen Tanpa Judul",
}: DeleteConfirmationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, isDeleting]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0F1117]/40 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop Click */}
      <div
        className="absolute inset-0 cursor-default"
        onClick={() => {
          if (!isDeleting) onClose();
        }}
      />

      {/* Modal Card */}
      <div
        ref={modalRef}
        className="relative bg-white border border-[#E5E7EB] rounded-2xl w-full max-w-[440px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] p-6 z-10 animate-scaleIn overflow-hidden"
      >
        {/* Top bar accent for danger action */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-danger" />

        <div className="flex flex-col items-center text-center mt-2">
          {/* Danger Warning Icon with subtle red background */}
          <div className="w-12 h-12 rounded-full bg-danger-subtle border border-[#EF4444]/20 flex items-center justify-center text-danger mb-4 shadow-sm">
            <span
              className="material-symbols-outlined text-2xl font-bold"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              warning
            </span>
          </div>

          {/* Title - Plus Jakarta Sans */}
          <h3 className="text-lg font-heading font-extrabold text-[#111827] tracking-tight mb-2">
            Hapus Riwayat Simulasi?
          </h3>

          {/* Message - Inter */}
          <p className="text-sm font-body text-[#6B7280] leading-relaxed mb-6">
            Apakah Anda yakin ingin menghapus riwayat simulasi untuk dokumen{" "}
            <strong className="text-[#111827] font-semibold">
              &ldquo;{documentTitle}&rdquo;
            </strong>
            ? Tindakan ini akan menghapus semua rekaman evaluasi dan tidak dapat dibatalkan.
          </p>

          {/* Actions button group */}
          <div className="flex items-center gap-3 w-full justify-end">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-text-primary hover:bg-[#F3F4F6] font-body font-bold text-xs transition-all active:scale-[0.98] disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-danger hover:bg-red-600 active:bg-red-700 text-white font-body font-bold text-xs transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-sm shadow-red-500/10 disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <span className="material-symbols-outlined text-xs font-bold animate-spin">
                    autorenew
                  </span>
                  <span>Menghapus...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-xs font-bold">
                    delete
                  </span>
                  <span>Hapus Riwayat</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
