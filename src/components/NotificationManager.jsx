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
                    // Get token
                    // ⚠️ IMPORTANT: In a real app, you would provide your VAPID key here
                    // getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY' })
                    const token = await getToken(messaging, {
                        vapidKey: 'BNHj-8-U8_Wf4W-C_u8T9X4Z-_f0rO5T2Y_7oX9M_f0' // Placeholder/Example VAPID
                    });

                    if (token) {
                        console.log('FCM Token:', token);
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
