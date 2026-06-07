'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export default function SplashPage() {
  const router = useRouter();
  const goToLogin = () => router.replace('/login');

  // Fallback: if the video never fires onEnded (e.g. blocked), go after 12s
  useEffect(() => {
    const t = setTimeout(goToLogin, 12_000);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    // Tap anywhere to skip
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      onClick={goToLogin}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#F3EDE4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        cursor: 'pointer',
      }}
    >
      {/* autoPlay + muted + playsInline = the exact combo iOS Safari allows without user gesture */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        src={`${BASE}/logo-animation.mp4`}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={goToLogin}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </div>
  );
}
