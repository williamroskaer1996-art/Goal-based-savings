'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TriodosLogo } from '@/components/TriodosLogo';
import { PinPad } from '@/components/PinPad';
import { useAppStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isInitialized } = useAppStore();
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace('/home');
    }
  }, [isInitialized, isAuthenticated, router]);

  useEffect(() => {
    if (pin.length === 4) {
      // Any 4-digit PIN works in this prototype
      login();
      router.push('/home');
    }
  }, [pin, login, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between px-8 pb-10 pt-16">
      {/* Logo */}
      <div className="flex flex-col items-center gap-6">
        <TriodosLogo />
        <div className="text-center">
          <h1 className="font-display mt-4 text-2xl font-bold text-grounded-green" style={{ fontWeight: 700 }}>
            Welcome back.
          </h1>
          <p className="mt-1 text-sm text-charcoal/55">Enter your PIN to continue.</p>
        </div>
      </div>

      {/* PIN pad */}
      <div className={`w-full ${shake ? 'animate-[shake_0.3s_ease]' : ''}`}>
        <PinPad pin={pin} onChange={setPin} />
      </div>

      {/* Footer hint */}
      <p className="text-center text-xs text-charcoal/35">
        This is a prototype. Any 4-digit PIN works.
      </p>
    </main>
  );
}
