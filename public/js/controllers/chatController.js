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
    const chatTextInput = chatView.setChatTextInput();
    chatTextInput.addEventListener('keydown', async (e) => {
      if (e.key !== 'Enter' || e.shiftKey) return;
      if (e.target.dataset.type !== chatTextInput.dataset.type) return;
      e.preventDefault();
      e.target.closest('form').querySelector('button[type="submit"]').click();
    });
  }

  async sendChats(formData) {
    const DOMChat = { createdAt: new Date().toISOString(), status: 'sending' };
    formData.forEach((data, key) => {
      DOMChat[key] = data;
    });
    chatView.clearChatForm();
    chatView.insertNewChat(DOMChat);
    try {
      const { newChat, updatedContact } = await chatModel.sendChat(formData);
      chatView.setChatStatus(newChat.status, ['sending']);
      return {
        newChat,
        updatedContact,
        otherUser: { _id: DOMChat.receiverID },
      };
    } catch (err) {
      chatView.setChatStatus('error', ['sending']);
    }
  }
}

export default new ChatController();
