'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export default function SplashPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  const goToLogin = () => router.replace('/login');

  // Try autoplay immediately on mount
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.play()
      .then(() => setStarted(true))
      .catch(() => {
        // Autoplay blocked — wait for user tap (handled by onClick below)
        setStarted(false);
      });

    // Hard fallback: go to login after 15s no matter what
    const t = setTimeout(goToLogin, 15_000);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTap = () => {
    const video = videoRef.current;
    if (!video) { goToLogin(); return; }

    if (!started) {
      // First tap: start the video
      video.play()
        .then(() => setStarted(true))
        .catch(goToLogin);
    } else {
      // Tap while playing: skip to login
      goToLogin();
    }
  };

  return (
    <div
      onClick={handleTap}
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
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={videoRef}
        src={`${BASE}/logo-animation.mp4`}
        muted
        playsInline
        preload="auto"
        onEnded={goToLogin}
        onError={goToLogin}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />

      {/* Prompt shown when autoplay is blocked */}
      {!started && (
        <div style={{
          position: 'absolute',
          bottom: 64,
          left: 0,
          right: 0,
          textAlign: 'center',
          pointerEvents: 'none',
        }}>
          <p style={{ color: '#004B32', fontSize: 13, opacity: 0.45, letterSpacing: '0.08em' }}>
            TAP TO CONTINUE
          </p>
        </div>
      )}
    </div>
  );
}
