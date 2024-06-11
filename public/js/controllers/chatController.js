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
    chatView.setChatMediaPreview()?.remove();
    const DOMChat = {
      createdAt: new Date().toISOString(),
      status: 'sending',
      chatImages: [],
    };
    formData.forEach((data, key) => {
      if (key === 'chatImages' && data?.size)
        return DOMChat[key].push(URL.createObjectURL(data));
      DOMChat[key] = data;
    });
    chatView.clearChatForm();
    if (!DOMChat.chatImages.length) chatView.insertNewChat(DOMChat);
    else
      DOMChat.chatImages.forEach((imgUrl, i, imgArr) =>
        chatView.insertNewChat({
          ...DOMChat,
          action: { type: 'image', payload: imgUrl },
          message: i === imgArr.length - 1 ? DOMChat.message : undefined,
        })
      );
    // This else block is called when an Image is sent along and it appends any message only to the last img

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

  addMediaPreview(input) {
    const chatInputContainer = chatView.setChatInputContainer();
    const chatMediaPreview = chatView.setChatMediaPreview();
    if (!chatInputContainer) return;
    if (!(input.files && input.files[0])) return chatMediaPreview.remove();

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
}

export default new ChatController();
