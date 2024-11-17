import modal from '../controllers/modal.js';
import { sendMessageToSW } from './helpers.js';

class Notifications {
  showPermissionModal() {
    if (Notification.permission != 'default') return;

    setTimeout(() => {
      modal.showModal();
      modal.insertContent(this.notificationPrompt());
    }, 3000);
  }

  requestPermission(wasAccepted) {
    modal.closeModal();
    if (Notification.permission != 'default' || !wasAccepted) return;

    Notification.requestPermission().then((permission) => {
      const permissionGranted = permission === 'granted';
      if (!permissionGranted) return;
      else sendMessageToSW({ action: 'subcribe_notifications' });
    });
  }

  send(body, icon, title = 'New Message', image, tag) {
    if (Notification.permission === 'granted') return;

    serviceWorkerRegistration.showNotification(title, {
      body,
      icon,
      image,
      tag,
    });
  }

  notificationPrompt() {
    return `
    <div class="notification-modal">
        <div>
          <h4>Allow notifications</h4>
        </div>
        <p>
          We’d love to keep you in the loop whenever you receive something new.
          Enable notifications to never miss a chat.
        </p>
        <div class="notification-modal__buttons">
          <button data-type="notifications-prompt-btn" type="button">
            No, Thanks
          </button>
          <button
            type="button"
            class="notification-modal__main-btn"
            data-type="notifications-prompt-btn"
            data-value="accepted"
          >
            Enable Notification
          </button>
        </div>
      </div>`;
  }
}

export default new Notifications();
