import { useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../firebase/config';
import { dbService } from '../services/db';
import { useAuth } from '../context/AuthContext';

export function NotificationManager({ settings, onUpdateSettings }) {
    const { user } = useAuth();

    useEffect(() => {
        if (!user || !messaging || !settings?.notifications?.browser) return;

        const setupFCM = async () => {
            try {
                // Request permission
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    const vapidKey = 'TU_CLAVE_VAPID_AQUI'; // <--- EL USUARIO DEBE REEMPLAZAR ESTO

                    if (vapidKey === 'TU_CLAVE_VAPID_AQUI') {
                        console.warn('⚠️ FCM: Falta configurar la clave VAPID en NotificationManager.jsx');
                        return;
                    }

                    const token = await getToken(messaging, { vapidKey });

                    if (token) {
                        console.log('FCM Token obtenido:', token);
                        await dbService.saveFcmToken(user.uid, token);
                    }
                }
            } catch (error) {
                console.error('Error setting up FCM:', error);
            }
        };

        setupFCM();

        // Handle foreground messages
        const unsubscribe = onMessage(messaging, (payload) => {
            console.log('Foreground message received:', payload);
            if (Notification.permission === 'granted') {
                new Notification(payload.notification.title, {
                    body: payload.notification.body,
                    icon: '/vite.svg'
                });
            }
        });

        return () => unsubscribe();
    }, [user, settings?.notifications?.browser]);

    return null;
}
