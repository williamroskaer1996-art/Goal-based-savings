'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  const goToLogin = () => {
    router.replace('/login');
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // When the video ends, navigate to login
    video.addEventListener('ended', goToLogin);

    // Fallback: if video fails to load/play, go to login after 3s
    const fallback = setTimeout(goToLogin, 8000);

    video.play().catch(() => {
      // Autoplay blocked (e.g. first load without user gesture) — go straight to login
      clearTimeout(fallback);
      goToLogin();
    });

    return () => {
      video.removeEventListener('ended', goToLogin);
      clearTimeout(fallback);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ backgroundColor: '#F3EDE4' }}
      onClick={goToLogin}
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
    </div>
  );
}
