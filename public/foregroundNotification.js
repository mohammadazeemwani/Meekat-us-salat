import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";

import {
  getMessaging,
  getToken,
  onMessage,
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-messaging.js";



// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAReetoXJyMjw-AyhS1NploFE4UoBP7v4o",
  authDomain: "meekat-us-salat.firebaseapp.com",
  projectId: "meekat-us-salat",
  storageBucket: "meekat-us-salat.appspot.com",
  messagingSenderId: "53745916899",
  appId: "1:53745916899:web:8663e446f6f6a04613ded6",
  measurementId: "G-DMH4GQ4L7J",
};

// Initialize Firebase_app

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);


onMessage(messaging, (payload) => {
    // console.log("Message received in foreground:", payload);
    // this script needs to be in the index.ejs it will be triggered when app is in foreground
    // console.log("HIHIIIIIIII");
  
    // sending notification on android-webview when application is open:
    const isAndroidWebView = navigator.userAgent.match(/Android/i);
    // This code checks the user agent string for the presence of ; wv, which is a string that is included in the user agent string of Android WebViews
  
    if (!isAndroidWebView) {
      
      if (window.Notification) {
        const notification = new Notification(payload.data.title, {
          body: payload.data.body,
          icon: './meekat-logo-92px.png',
        });

        
       
        notification.onclick = () => {
          window.focus();
                notification.close();
        };
 

      }
    } else {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.ready.then(function (registration) {
          registration.active.postMessage({
            type: "showNotification",
            payload: {
              title: payload.data.title,
              body: payload.data.body,
              icon: './meekat-logo-92px.png',
            },
          });
          
        });
      }
    }
  });