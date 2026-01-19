// Scripts for firebase and firebase-messaging
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
// ⚠️ These values must match your firebase/config.js ⚠️
firebase.initializeApp({
    apiKey: "AIzaSyDYV8S9iwYB1HQWq5Xg17Zmv4v3VaxNEPc",
    authDomain: "mis-gastos-app-27f00.firebaseapp.com",
    projectId: "mis-gastos-app-27f00",
    storageBucket: "mis-gastos-app-27f00.firebasestorage.app",
    messagingSenderId: "252913038714",
    appId: "1:252913038714:web:c61bbbba002a4bccbf12c3"
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/vite.svg'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
