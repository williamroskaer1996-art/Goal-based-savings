'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export default function SplashPage() {
  const router = useRouter();

  const goToLogin = () => router.replace('/login');

  // Fallback: if video never fires 'ended' within 10s, go to login
  useEffect(() => {
    const t = setTimeout(goToLogin, 10_000);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#F3EDE4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={goToLogin}
    >
      {/* autoPlay + muted + playsInline = iOS-safe autoplay */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        src={`${BASE}/logo-animation.mp4`}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={goToLogin}
        onError={goToLogin}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </div>
  );
}
