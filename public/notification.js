const publicKey_vapid =
  "BMpHNUa_5Q7OykllPKLebjhbata_FxG3GmCLCE3kTINjHyoo_M5DSItwgWxOwOEWpnMZ5YTrh9ec_ru3E8CaQqU";

// Import the functions you need from the SDKs you need

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

// Disabling all click and touch events on the window
function disableWindowInteraction() {
  document.body.style.pointerEvents = "none";
}

// Enabling click and touch events on the window
function enableWindowInteraction() {
  document.body.style.pointerEvents = "auto";
}

// set notificationEnabled to true only if it isn't there
if (!Boolean(localStorage.getItem("notificationEnabled"))) {
  localStorage.setItem("notificationEnabled", false);
}

// select array of all elements with class "places" and add event listner and do to them what we did above with notification button

const notificationButtons = document.querySelectorAll(".places");

notificationButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    if (
      "Notification" in window &&
      localStorage.getItem("notificationEnabled") === "false"
    ) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        //disable touch on window
        disableWindowInteraction();

        // now get the token and make the fetch request

        const currentToken = await getToken(messaging, {
          vapidKey: publicKey_vapid,
        });

        if (currentToken) {
          const response = await fetch("/token_recieve", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              district: button.dataset.customProperty.toLowerCase(),
              token: currentToken,
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const data = await response.json();

          localStorage.setItem("notificationEnabled", true);
          localStorage.setItem("indexOfBatch", data.indexOfBatch);
          localStorage.setItem("indexOfFcmInBatch", data.indexOfFcmInBatch);
          localStorage.setItem("fcm_token", currentToken);
          localStorage.setItem("districtHash", button.dataset.customProperty);

          window.location.href = "/";
        } else {
          // Showing permission request UI
          console.log(
            "No registration token available. Request permission to generate one."
          );
        }
      } else {
        // permission is not granted redirect to home
        window.location.href = "/";
      }
    } else {
      // notification is not supported or notification is already enabled
      window.location.href = "/";
    }
  });
});
