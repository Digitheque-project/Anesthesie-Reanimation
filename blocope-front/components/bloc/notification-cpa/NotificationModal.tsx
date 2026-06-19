'use client';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: any;
}

export default function NotificationModal({ isOpen, onClose, notification }: NotificationModalProps) {
  if (!isOpen || !notification) return null;

  const getUrgenceColor = (urgence: number) => {
    if (urgence === 3) return 'bg-red-100 text-red-800 border-red-300';
    if (urgence === 2) return 'bg-orange-100 text-orange-800 border-orange-300';
    if (urgence === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getUrgenceLabel = (urgence: number) => {
    if (urgence === 3) return '🔴 Très Urgent';
    if (urgence === 2) return '🟠 Urgent';
    if (urgence === 1) return '🟡 Modéré';
    return '⚪ Normal';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden border border-primary/10">
        {/* En-tête avec dégradé */}
        <div className="bg-gradient-to-r from-primary to-primary-dark px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔔</span>
            <h3 className="text-white font-bold text-xl">Nouvelle notification</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Corps */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Type et urgence */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-bold">
              {notification.type || 'Notification'}
            </span>
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getUrgenceColor(notification.urgence)}`}>
              {getUrgenceLabel(notification.urgence)}
            </span>
          </div>

          {/* Motif */}
          <div>
            <p className="text-lg font-semibold text-gray-800">{notification.motif || notification.message}</p>
          </div>

          {/* Grille d’informations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Patient</p>
              <p className="text-sm font-medium text-gray-800">{notification.patientId || 'Inconnu'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Reçue le</p>
              <p className="text-sm font-medium text-gray-800">
                {notification.receivedAt
                  ? new Date(notification.receivedAt).toLocaleString('fr-FR', {
                      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })
                  : 'N/A'}
              </p>
            </div>
          </div>

          {/* Services source / cible */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">Service source</p>
              <p className="font-medium text-gray-800">{notification.sourceServiceName || notification.sourceServiceId || 'N/A'}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-xl border border-green-100">
              <p className="text-xs font-bold text-green-600 uppercase tracking-wide">Service cible</p>
              <p className="font-medium text-gray-800">{notification.targetServiceName || notification.targetServiceId || 'N/A'}</p>
            </div>
          </div>

          {/* Canaux */}
          {notification.channels && notification.channels.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Canaux de diffusion</p>
              <div className="flex flex-wrap gap-2">
                {notification.channels.map((ch: string) => (
                  <span key={ch} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">
                    {ch}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Payload (si présent) */}
          {notification.payload && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Données associées</p>
              <pre className="bg-gray-100 p-3 rounded-lg text-xs font-mono text-gray-700 overflow-x-auto border border-gray-200">
                {JSON.stringify(notification.payload, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Pied de page */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition shadow-md"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
