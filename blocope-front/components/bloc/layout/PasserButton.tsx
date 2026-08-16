'use client';

interface PasserButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

// Symétrique de BackButton (même taille/forme, positionné en haut à droite) — visible uniquement
// quand un brouillon existe pour ce patient sur cet écran (voir useDraftAutosave), pour reprendre
// une saisie laissée en plan après un clic sur "Retour" sans avoir validé. Teinte ambre : même
// convention que la bannière "saisie non enregistrée" déjà utilisée sur CPA/vérification veille.
export default function PasserButton({ onClick, label = 'Passer', className = '' }: PasserButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Reprendre la saisie déjà commencée pour ce patient"
      className={`inline-flex shrink-0 items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-800 shadow-sm transition-all hover:bg-amber-100 ${className}`}
    >
      {label}
      <span className="material-symbols-outlined text-[20px]">history</span>
    </button>
  );
}
