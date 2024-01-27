// Define global variables to hold audio-related objects




  
  // Handle notification clicks
  self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event.notification);
  
  
    // Closing the notification

    event.notification.close();
    
  });



importScripts("https://www.gstatic.com/firebasejs/10.7.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.2/firebase-messaging-compat.js");




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
  
  const app = firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  



  self.addEventListener('message', function(event) {
    
    if (event.data.type === 'showNotification') {
      const { title, body, icon, badge } = event.data.payload;
      self.registration.showNotification(title, {
        body,
        icon,
        badge
      });
    
    }
  });

messaging.onBackgroundMessage(function(payload) {

  // Customize notification here
  self.registration.showNotification(payload.data.title, {
    body: payload.data.body,
    icon: './meekat-logo-92px.png',
    badge: './meekat-logo-92px.png',
  });


});

