import Icons from '../utils/Icons.js';
import TimeManager from '../utils/TimeManager.js';

class ChatView {
  constructor() {
    this.preLoad = `
      <div class="chat__container--pre-load" data-type="chat-preload">
        <img src="./../Imgs/app-images/logo-mid.png" alt="" />
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

  setCRForm() {
    const CRForm = document.querySelector('[data-type="cr-form"]');
    return CRForm;
  }

  setChatPage() {
    const chatPage = document.querySelector(
      '[data-page-name="chats"][data-type="page"]'
    );
    return chatPage;
  }

  removePreload() {
    const preLoad = document.querySelector('[data-type="chat-preload"]');
    preLoad?.remove();
  }

  insertPreload() {
    const chatPage = this.setChatPage();
    chatPage.innerHTML = this.preLoad;
  }

  chatTemplate({ otherUserId, name, profileImage }, contactId) {
    return `
      <section class="chat__container__header">
        <button data-type="close-chat-btn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 -960 960 960"
          >
            <path
              d="m142-480 294 294q15 15 14.5 35T435-116q-15 15-35 15t-35-15L57-423q-12-12-18-27t-6-30q0-15 6-30t18-27l308-308q15-15 35.5-14.5T436-844q15 15 15 35t-15 35L142-480Z"
            />
          </svg>
        </button>
        <div data-type="profile">
          <img src="${profileImage}" alt="" />
          <div data-type="details">
            <p data-type="name">${name}</p>
            <p class="active" data-type="online-status">Active</p>
          </div>
        </div>
      </section>
      <section class="chat__container__content">
        <div data-type="chat-content-container" data-contact-id="${contactId}"></div>
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
          <textarea name="message" data-type="chat-text-input" id="" cols="30" rows="10" required></textarea>
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
    const { message, status, media, createdAt } = chat;
    return `
    <div class="message__group__item" 
      ${media?.type ? `data-carrying="${media.type}"` : ''}
      data-created-at="${createdAt}">
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

  CRForm(senderID, status) {
    const isPending = status === 'pending';
    return `
    <div>
      <form class="CR" data-type="cr-form" data-sender-id="${senderID}">
        ${
          isPending
            ? `
        <button data-value="declined" type="submit" class="declined">
          Decline
        </button>
        <button data-value="accepted" type="submit">
          Accept Request
        </button>`
            : this.CRBtn(status)
        }
      </form>
    </div>`;
  }

  CRBtn(type) {
    return `
    <button class="${type}" data-type="${type}">
      Request ${type}
    </button>
    `;
  }

  mediaCheckChat(chat) {
    if (!chat.media?.payload.length) return [{ ...chat, media: undefined }];

    const checkedChats = chat.media.payload.map((payload, i, payloadArr) => {
      const media = { type: chat.media.type, payload };
      if (i === payloadArr.length - 1) return { ...chat, media };
      else return { ...chat, media, message: undefined };
    });
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
    if (!chatContainer) return;
    if (!chatContainer?.children.length) return this.insertChatGroup(newChat); //

    const { messageTime: lastChatTime, groupStatus: lastGroupStatus } =
      chatContainer?.children[0].dataset;
    const wasReceived = newChat?.wasReceived;
    const newGroupStatus = wasReceived ? 'received' : 'sent';
    const isValidTimeDifference = this.isValidTimeDifference(
      newChat.createdAt,
      lastChatTime
    );

    if (isValidTimeDifference && lastGroupStatus === newGroupStatus)
      return this.insertChatGroupItem(newChat, wasReceived);
    else return this.insertChatGroup(newChat, wasReceived);
  }

  insertChatGroup(newChat, receiver = newChat?.receiver) {
    const html = this.messageGroup([newChat], receiver);
    const container = this.setChatContentContainer();
    container.insertAdjacentHTML('afterbegin', html);
  }

  insertChatGroupItem(newChat) {
    const html = this.messageItem(newChat);
    const container = this.setChatContentContainer();
    container.children[0].insertAdjacentHTML('beforeend', html);
  }

  updateChatElement(chat) {
    const chatContainer = this.setChatContentContainer();
    const createdAt = chat.createdAt;
    if (!createdAt || !chatContainer) return;
    const chatElements = chatContainer.querySelectorAll(
      `[data-created-at="${createdAt}"]`
    );

    chatElements.forEach(
      (chatEl) => this.setChatStatus(chatEl, chat.status)
      // A message edit function can be added here
    );
  }

  setChatStatus(chatEl, newStatus) {
    const statusEl = chatEl?.querySelector(
      `[data-type="status-icon-container"]`
    );
    if (!statusEl) return;

    statusEl.innerHTML = Icons({ type: `chat/${newStatus}` });
    statusEl.dataset.chatItemStatus = newStatus;
  }

  setMultiplechatStatus({ newStatus, possiblePrevStatus = [], contactId }) {
    const chatContainer = this.setChatContentContainer();
    if (
      !chatContainer ||
      !this.contactIsActive(contactId) ||
      !possiblePrevStatus?.length
    )
      return;
    const queryStr = possiblePrevStatus
      .map(
        (status) =>
          `[data-type="status-icon-container"][data-chat-item-status="${status}"]`
      )
      .join(',');
    const statusContainers = chatContainer.querySelectorAll(queryStr);
    this.replaceChatStatus(statusContainers, newStatus);
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

  contactIsActive(contactId) {
    const chatContainer = this.setChatContentContainer();
    if (!chatContainer) return false;
    return chatContainer.dataset?.contactId === contactId;
  }

  chatPageIsActive() {
    const chatPage = this.setChatPage();
    if (!chatPage) return false;
    return chatPage.classList.contains('active');
  }
}

export default new ChatView();
