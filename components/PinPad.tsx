'use client';

type Props = {
  pin: string;
  onChange: (pin: string) => void;
  maxLength?: number;
};

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'];

export function PinPad({ pin, onChange, maxLength = 4 }: Props) {
  function handleKey(key: string) {
    if (key === 'del') {
      onChange(pin.slice(0, -1));
    } else if (key === 'ok') {
      // no-op — parent listens on pin length
    } else if (pin.length < maxLength) {
      onChange(pin + key);
    }
  }

  return (
    <div className="w-full">
      {/* PIN dots */}
      <div className="mb-8 flex justify-center gap-4">
        {Array.from({ length: maxLength }).map((_, i) => (
          <div
            key={i}
            className={`h-3 w-3 rounded-full border-2 transition-all duration-150 ${
              i < pin.length
                ? 'border-grounded-green bg-grounded-green'
                : 'border-grounded-green/30 bg-transparent'
            }`}
          />
        ))}
      </div>

      {/* Keypad grid */}
      <div className="grid grid-cols-3 gap-3">
        {KEYS.map((key) => {
          const isEmpty = key === 'ok';
          const isDel = key === 'del';
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleKey(key)}
              disabled={isEmpty}
              aria-label={isDel ? 'Delete' : key}
              className={`flex h-16 items-center justify-center rounded-2xl text-xl font-semibold transition active:scale-95 ${
                isEmpty
                  ? 'invisible'
                  : isDel
                  ? 'bg-white/60 text-grounded-green shadow-card'
                  : 'bg-white text-grounded-green shadow-card hover:bg-white/80'
              }`}
            >
              {isDel ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-3.29 10.29a1 1 0 0 1-1.42 1.42L15 12.41l-2.29 2.3a1 1 0 0 1-1.42-1.42L13.59 11l-2.3-2.29a1 1 0 0 1 1.42-1.42L15 9.59l2.29-2.3a1 1 0 0 1 1.42 1.42L16.41 11l2.3 2.29z"
                    fill="currentColor"
                  />
                </svg>
              ) : (
                key
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
