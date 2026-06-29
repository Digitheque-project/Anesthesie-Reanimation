'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: any[];
  onMarkAsRead?: (notificationId: string) => void; // ← Appelé quand une notif est lue
  onNotificationRead?: (notificationId: string) => void; // ← NOUVEAU
}

export default function NotificationModal({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onNotificationRead // ← NOUVEAU
}: NotificationModalProps) {
  const router = useRouter();
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());

  // Calculer le nombre de notifications non lues
  const unreadCount = notifications.filter(n => !readNotifications.has(n.id)).length;

  if (!isOpen || !notifications || notifications.length === 0) return null;

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

  const handleVoirPrescription = (notification: any) => {
    // Marquer comme lue si ce n'est pas déjà fait
    if (notification.id && !readNotifications.has(notification.id)) {
      const newRead = new Set(readNotifications);
      newRead.add(notification.id);
      setReadNotifications(newRead);
      
      if (onMarkAsRead) {
        onMarkAsRead(notification.id);
      }
      
      // ← NOUVEAU: Notifier le parent que la notification a été lue
      if (onNotificationRead) {
        onNotificationRead(notification.id);
      }
    }

    if (notification.patientId) {
      router.push(`/bloc/dossier-patient/${notification.patientId}`);
    }
  };

  // ← NOUVEAU: Marquer toutes comme lues
  const handleMarkAllAsRead = () => {
    const newRead = new Set(readNotifications);
    notifications.forEach(n => {
      if (n.id && !newRead.has(n.id)) {
        newRead.add(n.id);
        if (onMarkAsRead) {
          onMarkAsRead(n.id);
        }
        if (onNotificationRead) {
          onNotificationRead(n.id);
        }
      }
    });
    setReadNotifications(newRead);
  };

  const allRead = notifications.every(n => readNotifications.has(n.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden border border-primary/10">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-primary to-primary-dark px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔔</span>
            <h3 className="text-white font-bold text-xl">
              Notifications
              {/* ← MODIFIÉ: Afficher le compteur seulement s'il y a des non lues */}
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                  {unreadCount}
                </span>
              )}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {/* ← NOUVEAU: Bouton "Tout marquer comme lu" */}
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-white/80 hover:text-white transition-colors text-xs bg-white/20 px-3 py-1 rounded-full"
              >
                Tout marquer lu ✓
              </button>
            )}
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors text-2xl leading-none"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Statut "Toutes lues" */}
        {allRead && notifications.length > 0 && (
          <div className="bg-green-100 border-b border-green-300 px-6 py-3 flex items-center gap-2">
            <span className="text-green-600 text-lg">✅</span>
            <p className="text-green-800 font-bold text-sm">
              Toutes les notifications sont lues
            </p>
          </div>
        )}

        {/* Liste des notifications */}
        <div className="p-4 max-h-[70vh] overflow-y-auto space-y-4">
          {notifications.map((notification, index) => {
            const isRead = readNotifications.has(notification.id);
            return (
              <div
                key={notification.id || index}
                className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow ${
                  isRead ? 'border-green-300 bg-green-50/50' : 'border-gray-200'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
                    {notification.type || 'Notification'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getUrgenceColor(notification.urgence)}`}>
                      {getUrgenceLabel(notification.urgence)}
                    </span>
                    {isRead && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold">
                        ✓ Lu
                      </span>
                    )}
                    {!isRead && (
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                  </div>
                </div>

                <p className="text-sm font-semibold text-gray-800 mb-3">
                  {notification.motif || notification.message || 'Aucun motif'}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100 mb-3">
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Patient</p>
                    <p className="text-sm font-medium text-gray-800">
                      {notification.patientNom || notification.patientId || 'Inconnu'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Reçue le</p>
                    <p className="text-sm font-medium text-gray-800">
                      {notification.receivedAt
                        ? new Date(notification.receivedAt).toLocaleString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">Service source</p>
                  <p className="text-sm font-medium text-gray-800">
                    {notification.sourceServiceName || notification.sourceServiceId || 'N/A'}
                  </p>
                </div>

                <button
                  onClick={() => handleVoirPrescription(notification)}
                  className={`w-full py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    isRead
                      ? 'bg-green-300 hover:bg-green-400 text-gray-700'
                      : 'bg-yellow-400 hover:bg-yellow-500 text-gray-800'
                  }`}
                >
                  <span className="text-lg">📋</span>
                  {isRead ? 'Déjà lu ✓' : 'Voir prescription'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Pied de page */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-100">
          <span className="text-xs text-gray-500">
            {unreadCount > 0 ? `${unreadCount} notification(s) non lue(s)` : '✅ Toutes lues'}
          </span>
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
