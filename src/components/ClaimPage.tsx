"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { fetchPhoto, FetchPhotoResult } from "@/app/actions/fetchPhoto";

// ─── OTP Input Component ─────────────────────────────────────────────────────
function OtpInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6);
    onChange(raw);
  };

  const chars = value.split("").concat(Array(6 - value.length).fill(""));

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="flex gap-2 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {chars.map((ch, i) => (
          <div
            key={i}
            className={`otp-char ${
              i === value.length && value.length < 6
                ? "border-white/50 bg-white/10"
                : ch
                ? "border-white/40"
                : "border-white/10"
            }`}
          >
            {ch}
          </div>
        ))}
      </div>
      {/* Hidden input captures all keystrokes */}
      <input
        ref={inputRef}
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="characters"
        spellCheck={false}
        value={value}
        onChange={handleChange}
        maxLength={6}
        className="sr-only"
        aria-label="6-character photo code"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.focus()}
        className="text-xs text-zinc-500 underline underline-offset-2 cursor-pointer hover:text-zinc-300 transition-colors"
      >
        Tap to type your code
      </button>
    </div>
  );
}

// ─── Instagram Follow Banner ──────────────────────────────────────────────────
function InstagramBanner() {
  const handle = process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE ?? "gdgmitwpu";

  return (
    <a
      href={`https://instagram.com/${handle}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-5 py-3 rounded-full border border-white/10 hover:bg-white/5 transition-colors duration-200 w-full"
      style={{
        background:
          "linear-gradient(135deg, rgba(131,58,180,0.12) 0%, rgba(253,29,29,0.12) 50%, rgba(252,176,69,0.12) 100%)",
      }}
    >
      {/* Instagram gradient icon */}
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="url(#ig-banner-grad)">
        <defs>
          <linearGradient id="ig-banner-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fcb045" />
            <stop offset="50%" stopColor="#fd1d1d" />
            <stop offset="100%" stopColor="#833ab4" />
          </linearGradient>
        </defs>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
      <span className="text-sm font-medium text-white">
        Follow{" "}
        <span className="font-bold">@{handle}</span>{" "}
        on Instagram!
      </span>
      <svg className="w-4 h-4 text-zinc-400 shrink-0 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </a>
  );
}

// ─── Google color dots logo ───────────────────────────────────────────────────
function GdgDots() {
  return (
    <div className="grid grid-cols-2 gap-[5px]">
      <div className="w-3 h-3 rounded-full bg-[#4285F4]" />
      <div className="w-3 h-3 rounded-full bg-[#EA4335]" />
      <div className="w-3 h-3 rounded-full bg-[#FBBC05]" />
      <div className="w-3 h-3 rounded-full bg-[#34A853]" />
    </div>
  );
}

// ─── Photo Result Card ────────────────────────────────────────────────────────
function PhotoCard({
  imageUrl,
  downloadUrl,
  otp,
}: {
  imageUrl: string;
  downloadUrl: string;
  otp: string;
}) {
  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* Success badge */}
      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/15 border border-green-500/30">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-xs font-semibold text-green-400 tracking-widest uppercase">
          Photo found!
        </span>
      </div>

      {/* Polaroid-style image */}
      <div
        className="relative bg-white p-4 pb-14 shadow-[0_35px_100px_-10px_rgba(0,0,0,0.95)] rounded-none pulse-glow"
        style={{ transform: "none" }}
      >
        <div className="relative w-[260px] h-[290px] sm:w-[280px] sm:h-[310px] bg-zinc-200 overflow-hidden">
          <Image
            src={imageUrl}
            alt={`GDG Polaroid — code ${otp}`}
            fill
            className="object-cover"
            priority
            sizes="320px"
          />
        </div>
        {/* OTP label in bottom white strip */}
        <p className="absolute bottom-3.5 left-0 right-0 text-center text-zinc-400 text-[10px] tracking-[0.25em] font-medium uppercase select-none">
          {otp}
        </p>
      </div>

      {/* Download button */}
      <a
        href={downloadUrl}
        download={`GDG-Polaroid-${otp}.png`}
        className="btn-download inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full font-semibold text-white text-sm shadow-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30 w-full justify-center"
      >
        <svg
          className="w-5 h-5 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        Download Your Photo
      </a>

      <InstagramBanner />
    </div>
  );
}

// ─── Main Claim Page (Client Component) ──────────────────────────────────────
export default function ClaimPage() {
  const searchParams = useSearchParams();
  const urlOtp = (searchParams.get("otp") ?? "").toUpperCase().slice(0, 6);

  const [otp, setOtp] = useState(urlOtp);
  const [result, setResult] = useState<FetchPhotoResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const didAutoFetch = useRef(false);

  // Auto-fetch when OTP comes from URL (QR code scan)
  useEffect(() => {
    if (!didAutoFetch.current && urlOtp.length === 6) {
      didAutoFetch.current = true;
      startTransition(async () => {
        const res = await fetchPhoto(urlOtp);
        setResult(res);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6 || isPending) return;
    setResult(null);
    startTransition(async () => {
      const res = await fetchPhoto(otp);
      setResult(res);
    });
  };

  const showSuccess = !isPending && result?.success === true;
  const showError = !isPending && result?.success === false;

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-start bg-[#050505] text-white relative overflow-hidden pb-16">

      {/* Dot grid ambient background */}
      <div className="fixed inset-0 -z-20 dot-grid opacity-20 pointer-events-none" />

      {/* Google-color ambient blobs */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -left-48 w-[600px] h-[600px] rounded-full bg-[#4285F4]/10 blur-[130px]" />
        <div className="absolute -bottom-48 -right-48 w-[600px] h-[600px] rounded-full bg-[#EA4335]/10 blur-[130px]" />
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-[#34A853]/6 blur-[160px]" />
      </div>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="w-full max-w-sm px-6 pt-12 pb-4 flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <GdgDots />
          <span className="text-xs font-semibold tracking-[0.22em] text-zinc-400 uppercase">
            GDG MITWPU
          </span>
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white leading-tight">
            Claim Your
          </h1>
          <h1 className="text-4xl font-bold tracking-tight leading-tight bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#FBBC05] bg-clip-text text-transparent">
            Polaroid Photo
          </h1>
        </div>

        <p className="text-sm text-zinc-500 text-center max-w-[260px] leading-relaxed">
          Enter the 6-character code shown on the kiosk screen to download your photo.
        </p>
      </header>

      {/* ── OTP Form ────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-sm px-6 mt-4 flex flex-col items-center gap-5">
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-5">
          <OtpInput value={otp} onChange={setOtp} />

          <button
            type="submit"
            id="claim-submit-btn"
            disabled={otp.length !== 6 || isPending}
            className="w-full py-4 rounded-2xl bg-white text-zinc-900 font-semibold text-base shadow-2xl hover:bg-zinc-100 active:scale-[0.98] transition-all duration-150 disabled:opacity-35 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-900 rounded-full animate-spin" />
                Finding your photo…
              </span>
            ) : (
              "Get My Photo"
            )}
          </button>
        </form>

        {/* Error message */}
        {showError && (
          <div className="w-full flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-red-500/10 border border-red-500/25">
            <svg
              className="w-5 h-5 text-red-400 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-sm text-red-300 leading-relaxed">
              {(result as { success: false; error: string }).error}
            </p>
          </div>
        )}
      </section>

      {/* ── Photo Result ────────────────────────────────────────────────────── */}
      {showSuccess && result.success === true && (
        <section className="w-full max-w-sm px-6 mt-8 flex flex-col items-center">
          <PhotoCard
            imageUrl={result.imageUrl}
            downloadUrl={result.downloadUrl}
            otp={result.otp}
          />
        </section>
      )}

      {/* Standalone Instagram CTA when no photo is showing yet */}
      {!showSuccess && !isPending && (
        <section className="w-full max-w-sm px-6 mt-8">
          <InstagramBanner />
        </section>
      )}

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="w-full flex items-center justify-center mt-auto pt-12">
        <p className="text-xs text-zinc-700 tracking-wider">
          GDG MITWPU Akinator · Photos by Cloudinary
        </p>
      </footer>
    </main>
  );
}
