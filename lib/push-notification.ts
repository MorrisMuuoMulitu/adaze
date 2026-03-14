/**
 * PWA Push Notification Utilities
 */

export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered:', registration);
      return registration;
    } catch (error) {
      console.error('SW registration failed:', error);
    }
  }
}

export async function subscribeToPush() {
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if subscription already exists
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Get VAPID public key from environment
      const response = await fetch('/api/notifications/push/vapid-public-key');
      const { publicKey } = await response.json();
      
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });
      
      // Save subscription to backend
      await fetch('/api/notifications/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });
    }
    
    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push:', error);
  }
}

function urlBase64ToUint8Array(base64String: string) {
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
