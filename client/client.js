const publicVapidKey =
  "BBJcJSHE-4zca-nbFrC9htUZGaaXaBkfMMzaC2sujj2K6_zOw1VWy1ezqqmB-yZWxWi-DizN64aR_049xtZfdWg";
  const notificationData = {
    title: "Nouvelle notification",
    body: "Contenu de la notification ici"
  };
// Fonction pour s'abonner ou se désabonner de manière sécurisée
async function managePushSubscription() {
  try {
    await unsubscribeThenResubscribe();
  } catch (err) {
    console.error(err);
  }
}

// Appeler la fonction pour gérer l'abonnement/désabonnement lorsqu'il y a un service worker disponible
if ("serviceWorker" in navigator) {
  managePushSubscription();
}

// Register SW, Register Push, Send Push
async function send(notificationData) {
  // Register Service Worker
  console.log("Registering service worker...");
  const register = await navigator.serviceWorker.register("/worker.js", {
    scope: "/"
  });
  console.log("Service Worker Registered...");

  // Register Push
  console.log("Registering Push...");
  const subscription = await register.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
  });
  console.log("Push Registered...");

  // Send Push Notification
  console.log("Sending Push...");
  await fetch("/subscribe", {
    method: "POST",
    body: JSON.stringify({ subscription, ...notificationData }),
    headers: {
      "content-type": "application/json"
    }
  });
  console.log("Push Sent...");
}

async function unsubscribeThenResubscribe() {
  // Désabonner l'utilisateur s'il est déjà abonné
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await subscription.unsubscribe();
    console.log('User unsubscribed');
  }

  // Enregistrement pour les notifications avec la nouvelle clé applicationServerKey
  const response = await subscribeUser();
  console.log(response);
}

async function subscribeUser() {
  // Enregistrer le service worker
  const registration = await navigator.serviceWorker.register('/worker.js', {
    scope: '/'
  });

  // Enregistrer pour les notifications
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
  });

  // Envoyer l'abonnement au serveur
  await fetch('/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription),
    headers: {
      'Content-Type': 'application/json'
    }
  });

  return 'User subscribed';
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
