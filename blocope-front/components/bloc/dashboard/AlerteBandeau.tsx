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
    <div className="border border-red-300 bg-red-50 rounded-xl p-4 flex items-center gap-4">
      <span className="material-symbols-outlined text-red-600 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
        warning
      </span>
      <span className="text-sm font-bold text-red-700 flex-1 uppercase">{message}</span>
      <button onClick={() => router.push(href)} className="text-xs font-bold text-red-700 underline cursor-pointer hover:opacity-80 transition-opacity">
        Voir
      </button>
    </div>
  );
}
