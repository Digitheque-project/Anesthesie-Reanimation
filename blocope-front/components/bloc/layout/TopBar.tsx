'use client';

import { useState, useEffect } from 'react';
import { notificationService } from '@/lib/api/notification.service';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import NotificationModal from '@/components/bloc/notification-cpa/NotificationModal';
import { connecterNotificationsTempsReel, NotificationTempsReel } from '@/lib/notifications/socket';
import { jouerSonPrescription, jouerSonPrescriptionUrgente } from '@/lib/notifications/sound';

export default function TopBar() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const pathname = usePathname();

  const fetchData = async () => {
    try {
      // Récupérer la liste des notifications
      const notifsRes = await notificationService.getAll(1, 50);
      const notifs = notifsRes.data || [];
      setNotifications(notifs);

      // ← MODIFIÉ: Compter les notifications non lues
      const unread = notifs.filter((n: any) => {
        // Pour les notifications internes (avec statut)
        if (n.statut) return n.statut === 'EN_ATTENTE';
        // Pour les notifications webhook (avec processed)
        if (n.processed !== undefined) return !n.processed;
        // Par défaut, compter comme non lue
        return true;
      }).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Erreur chargement notifications:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Notifications temps réel (WebSocket) : alerte sonore + rafraîchissement immédiat
  // dès qu'une nouvelle prescription arrive pour ce service.
  useEffect(() => {
    const socket = connecterNotificationsTempsReel();
    if (!socket) return;

    const onNotification = (notif: NotificationTempsReel) => {
      if (notif.type !== 'new_prescription') return;
      const urgence = (notif.data?.urgence as string) || '';
      if (urgence === 'URGENTE' || urgence === 'STAT') {
        jouerSonPrescriptionUrgente();
      } else {
        jouerSonPrescription();
      }
      fetchData();
    };

    socket.on('notification', onNotification);
    return () => { socket.off('notification', onNotification); };
  }, []);

  if (pathname === '/login') return null;

  // ← NOUVEAU: Marquer une notification comme lue
  const handleNotificationRead = (notificationId: string) => {
    setUnreadCount(prev => Math.max(0, prev - 1));
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, statut: 'LU', processed: true } : n
      )
    );
  };

  const handleClocheClick = () => {
    setIsModalOpen(true);
  };

  return (
    <header className="fixed top-0 right-0 left-64 z-40 bg-white/80 backdrop-blur-md border-b border-outline-variant/30 px-8 py-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Image src="/images/CHU-logos.png" alt="CHU" width={24} height={24} />
        </div>
        <div>
          <h1 className="text-lg font-extrabold text-primary font-headline tracking-tight">CHU Bloc Opératoire</h1>
          <p className="text-[10px] text-on-surface-variant font-medium">Service d'Anesthésie-Réanimation</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={handleClocheClick}
          className="relative p-2 hover:bg-surface-container rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
          aria-label="Voir les notifications"
        >
          <span className="material-symbols-outlined text-primary text-xl">notifications</span>
          {/* ← MODIFIÉ: Le badge disparaît quand unreadCount = 0 */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-3 pl-2 border-l border-outline-variant/30">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-on-surface leading-tight">Dr. A. Durand</p>
            <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-tighter">Anesthésiste-Réanimateur</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-container overflow-hidden ring-2 ring-primary/10">
            <Image src="/images/avatar-default.png" alt="Avatar" width={40} height={40} className="object-cover" />
          </div>
        </div>
      </div>

      <NotificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        notifications={notifications}
        onNotificationRead={handleNotificationRead}
      />
    </header>
  );
}
