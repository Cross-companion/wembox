import chatModel from '../models/chatModel.js';
import chatView from '../views/chatView.js';
import Config from '../config.js';
import socket from '../utils/socket.js';

const { maxChatImages } = Config;

class ChatController {
  constructor() {
    this.page = document.querySelector('[data-page-name="chats"]');
    this.setSocketHandlers();
  }

  setSocketHandlers() {
    const handlers = [
      { event: 'chatReceived', func: this.chatReceived.bind(this) },
    ];
    socket.socketListeners(handlers);
  }

  addChatInputListener() {
    const chatTextInput = chatView.setChatTextInput();
    chatTextInput.addEventListener('keydown', async (e) => {
      if (e.key !== 'Enter' || e.shiftKey) return;
      if (e.target.dataset.type !== chatTextInput.dataset.type) return;
      e.preventDefault();
      e.target.closest('form').querySelector('button[type="submit"]').click();
    });
  }

  async openChats(
    userData = {
      otherUserId,
      name,
      username,
      profileImage,
    }
  ) {
    chatView.removePreload();
    this.page.innerHTML = chatView.chatTemplate(userData);
    const chatContentContainer = chatView.setChatContentContainer();
    const { chats } = await chatModel.getChats(userData.otherUserId);
    const chatsHtml = chatView.chatsHtml(chats, userData.otherUserId);
    chatContentContainer.innerHTML = chatsHtml;
    this.addChatInputListener();
  }

  openCR(
    userData = {
      chatId,
      otherUserId,
      name,
      username,
      profileImage,
    }
  ) {
    chatView.removePreload();
    this.page.innerHTML = chatView.chatTemplate(userData);
    const chatContentContainer = chatView.setChatContentContainer();
    const chat = chatModel.getNotification(userData.chatId)?.message;
    const chatsHtml =
      chatView.CRForm(userData.otherUserId, chat?.contactRequest?.status) +
      chatView.chatsHtml([chat], userData.otherUserId);
    chatContentContainer.innerHTML = chatsHtml;
    this.addChatInputListener();
  }

  async sendChat(formData) {
    chatView.setChatMediaPreview()?.remove();
    const DOMChat = {
      createdAt: new Date().toISOString(),
      status: 'sending',
      media: { type: 'image', payload: [] },
    };
    formData.forEach((data, key) => {
      if (key === 'chatImages' && data?.size)
        return DOMChat.media.payload.push(URL.createObjectURL(data));
      DOMChat[key] = data;
    });
    chatView.clearChatForm();
    chatView.mediaCheckChat(DOMChat).forEach((chat) => {
      return chatView.insertNewChat(chat);
    });
    // This else block is called when an Image is sent along and it appends any message only to the last img

    try {
      const { newChat, updatedContact } = await chatModel.sendChat(formData);
      socket.emit('chatSent', {
        newChat,
        updatedContact,
        otherUser: { _id: newChat.sender },
      });
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

  chatReceived({ newChat } = {}) {
    if (!newChat) throw new Error('New Chat was received but is invalid.');
    chatView.mediaCheckChat(newChat).forEach((chat) => {
      return chatView.insertNewChat(chat);
    });
  }

  addMediaPreview(input) {
    const chatInputContainer = chatView.setChatInputContainer();
    const chatMediaPreview = chatView.setChatMediaPreview();
    if (!chatInputContainer) return;
    if (!(input.files && input.files[0])) return chatMediaPreview.remove();
    if (input.files.length > maxChatImages) {
      alert(`You can only upload a maximum of ${maxChatImages} files.`);
      input.value = '';
      return chatMediaPreview.remove();
    }

    const imgs = [...input.files].reduce((allUrls, img) => {
      const title = img.name.split('.')[0];
      const imageUrl = URL.createObjectURL(img);
      allUrls.push({ imageUrl, title });
      return allUrls;
    }, []);
    const previewList = chatView.chatImagePreview(imgs);

    if (chatMediaPreview) chatMediaPreview.remove();
    chatInputContainer.insertAdjacentHTML('afterbegin', previewList);
  }

  deleteChatPreview(deleteBtn) {
    chatView.deleteChatPreview(deleteBtn);
  }

  async processCR(form, status) {
    const isSubmitting = form.dataset.state === 'submitting';
    if (isSubmitting) return;
    const { senderId: senderID } = form.dataset;
    try {
      form.dataset.state = 'submitting';
      await chatModel.processCR({ senderID, status });
      const CRForm = chatView.setCRForm();
      CRForm.innerHTML = chatView.CRBtn(status);
    } finally {
      form.dataset.state = 'free';
    }
  }
}

export default new ChatController();
