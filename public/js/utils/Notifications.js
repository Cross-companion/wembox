class Notifications {
  constructor() {
    this.permissionGranted = Notification.permission === 'granted';
    this.permissionGranted || this.requestPermission();
  }

  requestPermission() {
    Notification.requestPermission().then(
      (permission) => (this.permissionGranted = permission === 'granted')
    );
  }

  send(body, icon, title = 'New Message', image, tag) {
    if (!this.permissionGranted) return;

    serviceWorkerRegistration.showNotification(title, {
      body,
      icon,
      image,
      tag,
    });
  }
}

export default new Notifications();
