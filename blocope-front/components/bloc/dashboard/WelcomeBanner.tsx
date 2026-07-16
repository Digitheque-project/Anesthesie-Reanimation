'use client'

const ROLE_LABELS: Record<string, string> = {
  ROLE_ANESTHESISTE: 'Anesthésiste',
  ROLE_CHIRURGIEN: 'Chirurgien',
  ROLE_INFIRMIER_BLOC: 'Infirmier(ère) de Bloc',
  ROLE_SECRETAIRE_MEDICALE: 'Secrétaire Médicale',
  ROLE_DIRECTEUR_MEDICAL: 'Directeur Médical',
  ROLE_ADMIN: 'Administrateur',
  ROLE_AIDE_SOIGNANT: 'Aide-Soignant(e)',
}

interface WelcomeBannerProps {
  nom: string
  role: string | null
  patientsDuJour: number
}

const dateDuJour = () => {
  const d = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return d.charAt(0).toUpperCase() + d.slice(1)
}

export default function WelcomeBanner({ nom, role, patientsDuJour }: WelcomeBannerProps) {
  return (
    <div className="bg-primary-container/10 border-l-4 border-primary p-6 rounded-r-xl flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-primary text-2xl">group</span>
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">Bonjour, {nom || 'Utilisateur'}</h1>
          <p className="text-sm font-medium text-on-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-xs">calendar_month</span>
            {dateDuJour()} — {ROLE_LABELS[role || ''] || role || 'Rôle inconnu'}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Patients actifs</p>
        <p className="text-4xl font-black text-primary">{patientsDuJour}</p>
      </div>
    </div>
  )
}
