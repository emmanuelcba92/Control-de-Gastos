const admin = require('firebase-admin');
const axios = require('axios'); // For EmailJS if we use their API directly, or we can use another method.

// Initialize Firebase Admin with Service Account from ENV
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.error('ERROR: FIREBASE_SERVICE_ACCOUNT secret is missing in GitHub Actions.');
    process.exit(1);
}

let serviceAccount;
try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} catch (e) {
    console.error('ERROR: FIREBASE_SERVICE_ACCOUNT is not a valid JSON.');
    console.error(e.message);
    process.exit(1);
}

try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin initialized successfully.');
} catch (e) {
    console.error('ERROR: Failed to initialize Firebase Admin.');
    console.error(e.message);
    process.exit(1);
}

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
        console.log(`Processing user: ${uid}`);
        const settingsDoc = await db.collection('users').doc(uid).collection('metadata').doc('settings').get();

        if (!settingsDoc.exists()) {
            console.log(`No settings found for user ${uid}`);
            continue;
        }
        const settings = settingsDoc.data();
        console.log(`Notification settings: Browser=${settings.notifications?.browser}, Email=${settings.notifications?.email}`);

        if (!settings.notifications?.browser && !settings.notifications?.email) {
            console.log(`Notifications disabled for user ${uid}`);
            continue;
        }

        const expensesSnapshot = await db.collection('users').doc(uid).collection('expenses').get();
        console.log(`Found ${expensesSnapshot.size} expenses for user ${uid}`);

        for (const expDoc of expensesSnapshot.docs) {
            const exp = expDoc.data();
            if (!exp.notify_expiration) continue;

            const startDate = new Date(exp.fecha_inicio);
            const expDay = startDate.getDate();

            // Notify on days: expDay-2, expDay-1, expDay
            const daysToExpiration = (expDay - today.getDate() + 31) % 31;

            console.log(`Evaluating "${exp.nombre}": DayOfMonth=${expDay}, Today=${today.getDate()}, DaysRemaining=${daysToExpiration}`);

            if (daysToExpiration >= 0 && daysToExpiration <= 2) {
                const timeLabel = daysToExpiration === 0 ? 'vence HOY' :
                    daysToExpiration === 1 ? 'vence MAÑANA' :
                        `vence en ${daysToExpiration} días`;

                const title = `⚠️ Vencimiento: ${exp.nombre}`;
                const body = `Tu servicio "${exp.nombre}" ${timeLabel} (${settings.currency || 'ARS'} ${exp.monto}).`;

                console.log(`>> NOTIFICATION TRIGGERED: ${title}`);

                // Send FCM
                if (settings.notifications.browser && settings.fcmTokens) {
                    const validTokens = settings.fcmTokens.filter(t => typeof t === 'string' && t.length > 10);
                    if (validTokens.length > 0) {
                        await sendFcmNotification(validTokens, title, body);
                    } else {
                        console.log(`   [!] No valid FCM tokens found for user ${uid}`);
                    }
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
