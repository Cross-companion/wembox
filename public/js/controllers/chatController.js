import chatModel from '../models/chatModel.js';
import chatView from '../views/chatView.js';

class ChatController {
  constructor() {
    this.page = document.querySelector('[data-page-name="chats"]');
  }

  async openChats(userData = { otherUserId, name, username, profileImage }) {
    chatView.removePreload();
    this.page.innerHTML = chatView.chatTemplate(userData);
    const chatContentContainer = chatView.setChatContentContainer();
    const { chats } = await chatModel.getChats(userData.otherUserId);
    const chatsHtml = chatView.chatsHtml(chats, userData.otherUserId);
    chatContentContainer.innerHTML = chatsHtml;
  }
}

export default new ChatController();
