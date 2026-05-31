import Image from 'next/image';

type Props = { className?: string };

export function TriodosLogo({ className }: Props) {
  return (
    <div className={`flex items-center ${className ?? ''}`}>
      <Image
        src="/triodos-mark.svg"
        alt="Triodos Bank"
        width={32}
        height={32}
        className="shrink-0"
      />
    </div>
  );
}
