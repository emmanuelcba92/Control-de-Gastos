const admin = require('firebase-admin');
const axios = require('axios'); // For EmailJS if we use their API directly, or we can use another method.

// Initialize Firebase Admin with Service Account from ENV
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function sendEmailViaEmailJS(config, toEmail, subject, message) {
    if (!config.serviceId || !config.templateId || !config.publicKey) return;

    try {
        await axios.post('https://api.emailjs.com/api/v1.0/email/send', {
            service_id: config.serviceId,
            template_id: config.templateId,
            user_id: config.publicKey,
            template_params: {
                to_email: toEmail,
                subject: subject,
                message: message
            }
        });
        console.log(`Email sent to ${toEmail}`);
    } catch (error) {
        console.error(`Error sending email to ${toEmail}:`, error.message);
    }
}

async function sendFcmNotification(tokens, title, body) {
    if (!tokens || tokens.length === 0) return;

    const message = {
        notification: { title, body },
        tokens: tokens
    };

    try {
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`FCM Notifications sent: ${response.successCount} success, ${response.failureCount} failure`);
    } catch (error) {
        console.error('Error sending FCM:', error);
    }
}

async function processNotifications() {
    const usersSnapshot = await db.collection('users').get();
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    for (const userDoc of usersSnapshot.docs) {
        const uid = userDoc.id;
        const settingsDoc = await db.collection('users').doc(uid).collection('metadata').doc('settings').get();

        if (!settingsDoc.exists()) continue;
        const settings = settingsDoc.data();

        if (!settings.notifications?.browser && !settings.notifications?.email) continue;

        const expensesSnapshot = await db.collection('users').doc(uid).collection('expenses').get();

        for (const expDoc of expensesSnapshot.docs) {
            const exp = expDoc.data();
            if (!exp.notify_expiration) continue;

            const startDate = new Date(exp.fecha_inicio);
            const expDay = startDate.getDate();

            let shouldNotifyToday = (today.getDate() === expDay);
            let shouldNotifyTomorrow = (tomorrow.getDate() === expDay);

            if (shouldNotifyToday || shouldNotifyTomorrow) {
                const timeLabel = shouldNotifyToday ? 'vence HOY' : 'vence MAÑANA';
                const title = `Vencimiento de Servicio: ${exp.nombre}`;
                const body = `Tu servicio "${exp.nombre}" de ${exp.categoria} ${timeLabel} por un monto de ${settings.currency || 'ARS'} ${exp.monto}.`;

                // Send FCM
                if (settings.notifications.browser) {
                    await sendFcmNotification(settings.fcmTokens, title, body);
                }

                // Send Email
                if (settings.notifications.email && settings.notifications.emailAddress) {
                    await sendEmailViaEmailJS(
                        settings.notifications.emailjs,
                        settings.notifications.emailAddress,
                        title,
                        body
                    );
                }
            }
        }
    }
}

processNotifications().then(() => {
    console.log('Notification process finished.');
    process.exit(0);
}).catch(err => {
    console.error('Major error in notification process:', err);
    process.exit(1);
});
