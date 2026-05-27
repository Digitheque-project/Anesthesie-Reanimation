interface EtatGlobalProps {
  total: number;
  stat: number;
  urgent: number;
  normal: number;
}

export default function EtatGlobalPatients({ total, stat, urgent, normal }: EtatGlobalProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-outline-variant/10 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-on-surface font-headline uppercase tracking-wider">
          État Global des Patients
        </h3>
        <div className="bg-error-container/30 text-error px-3 py-1 rounded-full flex items-center gap-2 text-[10px] font-bold uppercase">
          TEMPS RÉEL
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="w-16 h-16 bg-surface-container-low rounded-xl flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-3xl">
            groups
          </span>
        </div>
        <div>
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
            Total Patients (STAT + Urgents + Normaux)
          </p>
          <p className="text-5xl font-black text-on-surface tracking-tighter">
            {total.toString().padStart(1, '0')}
          </p>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-error rounded-full"></span>
            <span className="text-xs font-bold text-slate-600">
              STAT: <span className="text-on-surface">{stat.toString().padStart(2, '0')}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            <span className="text-xs font-bold text-slate-600">
              Urgents: <span className="text-on-surface">{urgent.toString().padStart(2, '0')}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full"></span>
            <span className="text-xs font-bold text-slate-600">
              Normaux: <span className="text-on-surface">{normal.toString().padStart(2, '0')}</span>
            </span>
          </div>
        </div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Mise à jour en temps réel
        </div>
      </div>
    </div>
  );
}
