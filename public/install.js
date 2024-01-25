let deferredPrompt;

window.addEventListener('beforeinstallprompt', (event) => {
  // Prevent the automatic prompt
  event.preventDefault();

  // Stash the event so it can be triggered later
  deferredPrompt = event;

  // Optionally, show your own install button
  // For example, you can display a button on your UI to prompt the user to install
  // Make sure to handle the click event to trigger the installation prompt
  showInstallButton();
});

function showInstallButton() {
  // Show your install button and handle the click event
  const installButton = document.getElementById('install_btn');

  installButton.classList.remove('hidden');

  installButton.addEventListener('click', () => {
    // Trigger the deferred prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }

      // Clear the deferredPrompt variable
      deferredPrompt = null;
    });
  });
}


window.addEventListener('appinstalled', (event) => {
  // user has installed the application 
  // route the user to the home
  
    //  Wait for 2 seconds (adjust the time as needed)

      // Redirect to the root of the app or perform any other actions
      window.location.href = '/';
 
});