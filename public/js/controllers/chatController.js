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

  async sendChats(formData) {
    const DOMChat = { createdAt: new Date().toISOString(), status: 'sending' };
    formData.forEach((data, key) => {
      DOMChat[key] = data;
    });
    chatView.insertNewChat(DOMChat);
    try {
      const { newChat } = await chatModel.sendChat(formData);
      chatView.setChatStatus(newChat.status, ['sending']);
    } catch (err) {
      chatView.setChatStatus('error', ['sending']);
    }
  }
}

export default new ChatController();
