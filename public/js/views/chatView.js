import Icons from '../utils/Icons.js';
import TimeManager from '../utils/TimeManager.js';

class ChatView {
  constructor() {
    this.preLoad = `
      <div class="chat__container--pre-load" data-type="chat-preload">
        <img src="./../Imgs/logos/DALL-E/wembee-logo-v1.jpg" alt="" />
        <div class="logo">
          <span class="logo__text logo__text--burn">Wembox</span>
          <span>inc.</span>
        </div>
      </div>`;
  }

  setChatContentContainer() {
    this.chatContentContainer = document.querySelector(
      '[data-type="chat-content-container"]'
    );
    return this.chatContentContainer;
  }

  setChatMediaPreview() {
    this.chatMediaPreview = document.querySelector(
      '[data-type="chat-media-preview-container"]'
    );
    return this.chatMediaPreview;
  }

  setChatForm() {
    this.chatForm = document.querySelector('[data-type="chat-input-form"]');
    return this.chatForm;
  }

  setChatInputContainer() {
    this.chatInputContainer = document.querySelector(
      '[data-type="chat-inputs-container"]'
    );
    return this.chatInputContainer;
  }

  setChatTextInput() {
    this.chatTextInput = document.querySelector(
      '[data-type="chat-text-input"]'
    );
    return this.chatTextInput;
  }

  setChatMediaInput() {
    this.chatMediaInput = document.querySelector(
      '[data-type="chat-media-preview-input"]'
    );
    return this.chatMediaInput;
  }

  removePreload() {
    const preLoad = document.querySelector('[data-type="chat-preload"]');
    preLoad?.remove();
  }

  chatTemplate({ otherUserId, name, profileImage }) {
    return `
      <section class="chat__container__header">
        <div data-type="profile">
          <img src="${profileImage}" alt="" />
          <div data-type="details">
            <p data-type="name">${name}</p>
            <p class="active" data-type="online-status">Online</p>
          </div>
        </div>
      </section>
      <section class="chat__container__content">
        <div data-type="chat-content-container"></div>
      </section>
      <section class="chat__container__inputs" data-type="chat-inputs-container">
        <form data-type="chat-input-form">
          <input type="hidden" name="receiverID" value="${otherUserId}"/>
          <button type="button">
            <input type="file" 
            name="chatImages" 
            data-type="chat-media-preview-input" 
            accept="image/*"
            multiple/>
            ${Icons({
              type: 'add-image',
              dataStrings: 'data-type="add-image-icon"',
            })}
          </button>
          <textarea name="message" data-type="chat-text-input" id="" cols="30" rows="10"></textarea>
          <button type="submit">
          ${Icons({
            type: 'send-chat',
            dataStrings: 'data-type="send-chat-icon"',
          })}
          </button>
        </form>
      </section>
      `;
  }

  chatImagePreview(imgs = []) {
    return `
    <div data-type="chat-media-preview-container">
      ${imgs.map((img) => this.chatImagePreviewItem(img)).join(' ')}
    </div>`;
  }

  chatImagePreviewItem({ imageUrl, title }) {
    return `
    <div data-type="chat-media-preview">
      <img src="${imageUrl}" alt="${title}" />
      <span data-type="delete-chat-media-preview">
        ${Icons({ type: 'cancel' })}
      </span>
    </div>`;
  }

  messageGroup(chats = [], otherUserId) {
    const { createdAt, receiver } = chats[chats.length - 1];
    const messageTime = TimeManager.dateToCompleteTime(createdAt, {
      lowercase: true,
    });
    const groupStatus = receiver === otherUserId ? 'sent' : 'received';

    return `
    <div class="message__group ${groupStatus}" data-group-status="${groupStatus}" data-message-time=${createdAt}>
      <div data-type="message-time">${messageTime}</div>
      ${chats.map((chat) => this.messageItem(chat)).join(' ')}
    </div>
    `;
  }

  mediaTypes(media) {
    switch (media.type) {
      case 'image':
        return `
        <div data-type="image-carrier">
          <img
            src="${media.payload}"
            alt=""
          />
        </div>`;
      default:
        throw new Error('Invalid message type specified.');
    }
  }

  messageItem(chat) {
    const { message, status, media } = chat;
    return `
    <div class="message__group__item" ${
      media?.type ? `data-carrying="${media.type}"` : ''
    }>
      <span data-type="status-icon-container" data-chat-item-status="${status}">
        ${Icons({ type: `chat/${status}` })}
      </span>
      ${media?.type ? this.mediaTypes(media) : ''}
      ${message ? `<pre>${message}</pre>` : ''}
    </div>`;
  }

  messageDay(day) {
    return `
    <div class="message__day" role="button">
      <span>${day === new Date().toDateString() ? 'today' : day}</span>
    </div>`;
  }

  isValidTimeDifference(curDateString, prevDateString) {
    const maxSecDifference = 60;
    const curDate = new Date(curDateString).getTime();
    const prevDate = new Date(prevDateString).getTime();
    const isValid = (curDate - prevDate) / 1000 < maxSecDifference;
    return isValid;
  }

  mediaCheckChat(chat) {
    if (!chat.media?.payload.length) return [{ ...chat, media: undefined }];

    const checkedChats = chat.media.payload.map((payload, i, payloadArr) => {
      const media = { type: chat.media.type, payload };
      if (i === payloadArr.length - 1) return { ...chat, media };
      else return { ...chat, media, message: undefined };
    });
    console.log(checkedChats);
    return checkedChats;
  }

  bundleChatsToGroups(chats = []) {
    const bundledChats = chats.reduce((groups, currentChat, i, chatsArr) => {
      const mediaCheckedChat = this.mediaCheckChat(currentChat);

      const previousChat = chatsArr[i - 1];
      const conditionForNewGroup =
        !previousChat ||
        currentChat.sender !== previousChat?.sender ||
        !this.isValidTimeDifference(
          currentChat.createdAt,
          previousChat.createdAt
        );

      if (conditionForNewGroup) groups.push([...mediaCheckedChat]);
      else groups[groups.length - 1].push(...mediaCheckedChat);
      return groups;
    }, []);

    return bundledChats;
  }

  chatsHtml(chats = [], otherUserId) {
    const bundledChats = this.bundleChatsToGroups(chats).reverse();
    return bundledChats
      .map((chatGroup, i, chatsArr) => {
        const chatDay = new Date(
          chatGroup[chatGroup.length - 1].createdAt
        ).toDateString();
        const lastChatDay =
          chatsArr[i + 1] &&
          new Date(chatsArr[i + 1][0]?.createdAt).toDateString();
        const isTheSameDay = chatDay === lastChatDay;
        if (isTheSameDay) return this.messageGroup(chatGroup, otherUserId);
        else
          return (
            this.messageGroup(chatGroup, otherUserId) + this.messageDay(chatDay)
          );
      })
      .join(' ');
  }

  insertNewChat(newChat) {
    const chatContainer = this.setChatContentContainer();
    if (!chatContainer?.children.length) return this.insertChatGroup(newChat); //

    const { messageTime: lastChatTime, groupStatus } =
      chatContainer?.children[0].dataset;
    if (groupStatus !== 'sent') return this.insertChatGroup(newChat);
    const isValidTimeDifference = this.isValidTimeDifference(
      newChat.createdAt,
      lastChatTime
    );

    if (!isValidTimeDifference) return this.insertChatGroup(newChat); //
    else return this.insertChatGroupItem(newChat);
  }

  insertChatGroup(newChat) {
    const html = this.messageGroup([newChat], newChat.receiver);
    const container = this.setChatContentContainer();
    container.insertAdjacentHTML('afterbegin', html);
  }

  insertChatGroupItem(newChat) {
    const html = this.messageItem(newChat);
    const container = this.setChatContentContainer();
    container.children[0].insertAdjacentHTML('beforeend', html);
  }

  setChatStatus(newStatus, priorStatus = ['sending', 'sent']) {
    const container = this.setChatContentContainer();
    if (!container) return;

    const statusContainersToUpdate = [];
    priorStatus.forEach((status) =>
      statusContainersToUpdate.push(
        container.querySelectorAll(
          `[data-type="status-icon-container"][data-chat-item-status="${status}"]`
        )
      )
    );

    statusContainersToUpdate.forEach((nodeList) =>
      this.replaceChatStatus(nodeList, newStatus)
    );
  }

  replaceChatStatus(statusContainers = [], newStatus) {
    statusContainers.forEach((container) => {
      container.innerHTML = Icons({ type: `chat/${newStatus}` });
      container.dataset.chatItemStatus = newStatus;
    });
  }

  clearChatForm() {
    const chatForm = this.setChatForm();
    if (!chatForm) return;
    const chatInputs = chatForm.querySelectorAll(
      'input:not([type="hidden"]), textarea'
    );
    chatInputs.forEach((input) => (input.value = ''));
  }

  deleteChatPreview(deleteBtn) {
    const chatMediaPreviews = this.setChatMediaPreview();
    const previewElement = deleteBtn.closest(
      '[data-type="chat-media-preview"]'
    );
    if (!chatMediaPreviews || !previewElement) return;
    const previewIndex = [...chatMediaPreviews.children].findIndex(
      (el) => el === previewElement
    );

    const input = this.setChatMediaInput();
    if (!input || !input.files || !input.files[0])
      return previewElement.remove();

    const filteredFiles = [...input.files].filter(
      (file, i) => i !== previewIndex
    );
    const newFiles = new DataTransfer();
    filteredFiles.forEach((file) => newFiles.items.add(file));
    previewElement.remove();
    input.files = newFiles.files;
  }
}

export default new ChatView();
