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

  removePreload() {
    const preLoad = document.querySelector('[data-type="chat-preload"]');
    preLoad?.remove();
  }

  chatTemplate({ otherUserId, name, profileImage }) {
    return `
      <section class="chat__container__header">
        <div data-type="profile">
          <img src="images/${profileImage}" alt="" />
          <div data-type="details">
            <p data-type="name">${name}</p>
            <p class="active" data-type="online-status">Online</p>
          </div>
        </div>
      </section>
      <section class="chat__container__content">
        <div data-type="chat-content-container"></div>
      </section>
      <section class="chat__container__inputs">
        <form data-type="chat-input-form">
          <input type="hidden" name="receiverID" value="${otherUserId}"/>
          <button type="button">
            <input type="file" name="chatImages" data-type="chat-preview-input" />
            ${Icons({
              type: 'add-image',
              dataStrings: 'data-type="add-image-icon"',
            })}
          </button>
          <textarea name="message" id="" cols="30" rows="10"></textarea>
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

  setChatContentContainer() {
    this.chatContentContainer = document.querySelector(
      '[data-type="chat-content-container"]'
    );
    return this.chatContentContainer;
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

  messageItem(chat) {
    const { message, status } = chat;
    return `
    <div class="message__group__item">
      <span data-type="status-icon-container" data-chat-item-status="${status}">
        ${Icons({ type: `chat/${status}` })}
      </span>
      <pre>${message}</pre>
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

  bundleChatsToGroups(chats = []) {
    const bundledChats = chats.reduce((groups, currentChat, i, chatsArr) => {
      const previousChat = chatsArr[i - 1];
      if (!previousChat) groups.push([currentChat]);
      else if (currentChat.sender !== previousChat?.sender)
        groups.push([currentChat]);
      else if (
        !this.isValidTimeDifference(
          currentChat.createdAt,
          previousChat.createdAt
        )
      )
        groups.push([currentChat]);
      else groups[groups.length - 1].push(currentChat);
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
    console.log(groupStatus);
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
}

export default new ChatView();
