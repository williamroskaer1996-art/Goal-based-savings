'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [canAutoplay, setCanAutoplay] = useState(true);

  const goToLogin = () => {
    router.replace('/login');
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.addEventListener('ended', goToLogin);

    // Try autoplay (works on desktop and iOS when muted+playsInline)
    video.play().catch(() => {
      // Autoplay blocked — stay on splash, show tap-to-continue UI
      setCanAutoplay(false);
    });

    return () => {
      video.removeEventListener('ended', goToLogin);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTap = () => {
    const video = videoRef.current;
    if (!video) { goToLogin(); return; }

    if (!canAutoplay) {
      // First tap: start playing
      setCanAutoplay(true);
      video.play().catch(goToLogin);
    } else {
      // Tap while playing: skip to login
      goToLogin();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center cursor-pointer"
      style={{ backgroundColor: '#F3EDE4' }}
      onClick={handleTap}
    >
      <video
        ref={videoRef}
        src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/logo-animation.mp4`}
        muted
        playsInline
        preload="auto"
        className="h-full w-full object-contain"
        style={{ maxWidth: '100vw', maxHeight: '100vh' }}
      />

      {/* Shown only when autoplay is blocked — prompts user to tap */}
      {!canAutoplay && (
        <div className="absolute bottom-16 left-0 right-0 flex justify-center pointer-events-none">
          <p style={{ color: '#004B32' }} className="text-sm opacity-50 tracking-wide">
            Tap to continue
          </p>
        </div>
      )}
    </div>
  );
}
