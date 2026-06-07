'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export default function SplashPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  const goToLogin = () => router.replace('/login');

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Ensure it plays even if the HTML autoPlay attribute was suppressed
    video.play().catch(() => {
      // Still blocked — go straight to login rather than show a broken screen
      goToLogin();
    });

    // Hard fallback in case onEnded never fires
    const t = setTimeout(goToLogin, 15_000);
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
      {/* autoPlay + muted + playsInline = iOS-safe autoplay, no user gesture needed */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={videoRef}
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
