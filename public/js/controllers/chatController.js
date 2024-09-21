import chatModel from '../models/chatModel.js';
import chatView from '../views/chatView.js';
import Config from '../config.js';
import socket from '../utils/socket.js';

const { maxChatImages } = Config;

class ChatController {
  constructor() {
    this.page = document.querySelector('[data-page-name="chats"]');
    this.currentChatRoom = undefined;
    this.setSocketHandlers();
  }

  setSocketHandlers() {
    const handlers = [
      { event: 'chatReceived', func: this.chatReceived.bind(this) },
      { event: 'chatProcessed', func: this.chatProcessed.bind(this) },
      {
        event: 'chatStatusUpdated',
        func: chatView.setMultiplechatStatus.bind(chatView),
      },
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
      contactId,
    }
  ) {
    chatView.removePreload();
    this.page.innerHTML = chatView.chatTemplate(userData, userData.contactId);
    const chatContentContainer = chatView.setChatContentContainer();
    this.changeChatRoom(userData.contactId);
    const { chats } = await chatModel.getChats(userData.otherUserId);
    const chatsHtml = chatView.chatsHtml(chats, userData.otherUserId);
    chatContentContainer.innerHTML = chatsHtml;
    socket.emit('updateChatStatus', {
      newStatus: 'seen',
      contactData: [
        {
          otherUser: userData.otherUserId,
          contactId: userData.contactId,
        },
      ],
    });
    this.addChatInputListener();
  }

  changeChatRoom(contactId) {
    socket.emit('changeChatRoom', {
      leave: this.currentChatRoom,
      join: contactId,
    });
    this.currentChatRoom = contactId;
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
    if (!formData) return;
    chatView.setChatMediaPreview()?.remove();
    const DOMChat = {
      status: 'sending',
      media: { type: 'image', payload: [] },
    };
    formData.append('createdAt', new Date().toISOString());
    formData.forEach((data, key) => {
      if (key === 'chatImages' && data?.size)
        return DOMChat.media.payload.push(URL.createObjectURL(data));
      DOMChat[key] = data;
    });
    const chatIsValid =
      DOMChat.media?.payload?.length ||
      (DOMChat.message && DOMChat.message.trim().length);
    if (!chatIsValid) throw new Error('Chat is empty');
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
      });
      chatView.updateChatElement(newChat);
      return {
        newChat,
        updatedContact,
      };
    } catch (err) {
      chatView.updateChatElement({ ...DOMChat, status: 'error' });
    }
  }

  chatReceived({ newChat, updatedContact } = {}) {
    const contactId = updatedContact?.id;
    if (!newChat || !contactId)
      throw new Error('A new Chat was received but is invalid.');
    if (!chatView.contactIsActive(contactId)) return;

    newChat.wasReceived = true;
    chatView.mediaCheckChat(newChat).forEach((chat) => {
      return chatView.insertNewChat(chat);
    });
  }

  chatProcessed({ newChat } = {}) {
    if (!newChat) throw new Error('A new Chat was processed but is invalid.');
    chatView.updateChatElement(newChat);
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

  closeChat() {
    if (!this.currentChatRoom) return;
    this.changeChatRoom();
    chatView.insertPreload();
  }
}

export default new ChatController();
