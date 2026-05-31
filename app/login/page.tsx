'use client';

import { useEffect, useState } from 'react';
import { TriodosLogo } from '@/components/TriodosLogo';
import { PinPad } from '@/components/PinPad';
import { useAppStore } from '@/lib/store';

type FaceIdState = 'idle' | 'scanning' | 'success';

export default function LoginPage() {
  const { login } = useAppStore();
  const [pin, setPin]             = useState('');
  const [shake, setShake]         = useState(false);
  const [faceId, setFaceId]       = useState<FaceIdState>('idle');
  const [showPin, setShowPin]     = useState(false);

  // Clear any existing session on mount
  useEffect(() => {
    sessionStorage.removeItem('triodos_auth');
  }, []);

  const goHome = () => {
    login();
    // Use hard navigation so iOS PWA stays in standalone mode
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
    window.location.replace(`${base}/home/`);
  };

  // PIN login
  useEffect(() => {
    if (pin.length === 4) {
      goHome();
    }
  }, [pin]); // eslint-disable-line react-hooks/exhaustive-deps

  function triggerFaceId() {
    setFaceId('scanning');
    setTimeout(() => {
      setFaceId('success');
      setTimeout(() => {
        goHome();
      }, 700);
    }, 1500);
  }

  const isScanning = faceId === 'scanning';
  const isSuccess  = faceId === 'success';

  return (
    <main className="flex min-h-dvh flex-col items-center px-8 pb-10 pt-16">
      {/* Logo + greeting */}
      <div className="flex flex-col items-center gap-6">
        <TriodosLogo />
        <div className="text-center">
          <h1 className="font-display mt-4 text-2xl font-bold text-grounded-green" style={{ fontWeight: 700 }}>
            Welcome back.
          </h1>
          <p className="mt-1 text-sm text-charcoal/55">
            {isScanning ? 'Scanning your face…' : isSuccess ? 'Identity verified' : 'Log in with Face ID or your PIN.'}
          </p>
        </div>
      </div>

      {/* ── Face ID widget ── */}
      <div className="flex flex-1 flex-col items-center justify-center gap-5">
        <button
          type="button"
          onClick={() => faceId === 'idle' && triggerFaceId()}
          aria-label="Use Face ID"
          className="relative flex h-24 w-24 items-center justify-center focus:outline-none active:scale-95 transition"
        >
          {/* Spinning arc — shown while scanning */}
          {isScanning && (
            <span className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-grounded-green animate-spin" />
          )}
          {/* Full ring — shown on success */}
          {isSuccess && (
            <span className="absolute inset-0 rounded-full border-[3px] border-grounded-green transition-all duration-300" />
          )}

          {/* Icon background */}
          <span
            className="flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300"
            style={{
              backgroundColor: isSuccess
                ? 'rgba(0,75,50,0.12)'
                : isScanning
                ? 'rgba(0,75,50,0.07)'
                : 'rgba(0,75,50,0.06)',
            }}
          >
            {isSuccess ? (
              /* Checkmark on success */
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M5 13l4 4L19 7" stroke="#004B32" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              /* Face ID icon */
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                stroke={isScanning ? '#004B32' : 'rgba(0,75,50,0.65)'}
                strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
                style={{ transition: 'stroke 0.3s ease' }}
                aria-hidden
              >
                {/* Corner brackets */}
                <path d="M4 8V5.5A1.5 1.5 0 015.5 4H8"/>
                <path d="M16 4h2.5A1.5 1.5 0 0120 5.5V8"/>
                <path d="M20 16v2.5a1.5 1.5 0 01-1.5 1.5H16"/>
                <path d="M8 20H5.5A1.5 1.5 0 014 18.5V16"/>
                {/* Eyes */}
                <circle cx="9" cy="10" r="0.6" fill={isScanning ? '#004B32' : 'rgba(0,75,50,0.65)'}/>
                <circle cx="15" cy="10" r="0.6" fill={isScanning ? '#004B32' : 'rgba(0,75,50,0.65)'}/>
                {/* Nose */}
                <path d="M12 9.5v2.5"/>
                {/* Mouth */}
                <path d="M9.5 14.5q1.25 1.5 2.5 1.5t2.5-1.5"/>
              </svg>
            )}
          </span>
        </button>

        <p className="text-sm font-medium" style={{ color: isSuccess ? '#004B32' : 'rgba(0,0,0,0.35)' }}>
          {isSuccess ? 'Verified ✓' : isScanning ? 'Hold still…' : 'Tap to scan'}
        </p>

        {/* PIN fallback toggle */}
        {!isScanning && !isSuccess && (
          <button
            type="button"
            onClick={() => setShowPin(s => !s)}
            className="mt-1 text-xs font-medium text-grounded-green/60 underline underline-offset-2 transition hover:text-grounded-green"
          >
            {showPin ? 'Hide PIN pad' : 'Use PIN instead'}
          </button>
        )}
      </div>

      {/* PIN pad — revealed on demand */}
      {showPin && (
        <div className={`w-full ${shake ? 'animate-[shake_0.3s_ease]' : ''}`}>
          <PinPad pin={pin} onChange={setPin} />
        </div>
      )}

      {!showPin && <div className="h-16" />}
    </main>
  );
}
