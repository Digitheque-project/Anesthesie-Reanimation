'use client';

import { useRouter } from 'next/navigation';

interface AlerteBandeauProps {
  count: number;
  message: string;
  href: string;
}

export default function AlerteBandeau({ count, message, href }: AlerteBandeauProps) {
  const router = useRouter();
  if (count <= 0) return null;

  return (
    <div
      className="border rounded-xl p-4 flex items-center gap-4"
      style={{
        backgroundColor: 'rgba(148, 0, 16, 0.1)',
        borderColor: 'rgba(148, 0, 16, 0.2)',
      }}
    >
      <span className="material-symbols-outlined text-tertiary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
        warning
      </span>
      <span className="text-sm font-bold text-tertiary flex-1">{message}</span>
      <button onClick={() => router.push(href)} className="text-xs font-bold text-tertiary underline cursor-pointer hover:opacity-80 transition-opacity">
        Voir
      </button>
    </div>
  );
}
