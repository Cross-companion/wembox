import chatView from '../views/chatView.js';

class ChatController {
  constructor() {
    this.page = document.querySelector('[data-page-name="chats"]');
  }

  openChats(userData = { contactId, name, username, profileImage }) {
    console.log(userData.contactId);
    chatView.removePreload();
    console.log(userData);
    this.page.innerHTML = chatView.chatTemplate(userData);
  }
}

export default new ChatController();
