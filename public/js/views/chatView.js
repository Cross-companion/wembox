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

  chatTemplate({ name, profileImage }) {
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
      <section class="chat__container__content"><div data-type="chat-content-container"></div></section>
      <section class="chat__container__inputs">
        <form>
          <div>
            <input type="file" data-type="chat-preview-input" />
            ${Icons({
              type: 'add-image',
              dataStrings: 'data-type="add-image-icon"',
            })}
          </div>
          <textarea name="" id="" cols="30" rows="10"></textarea>
          <div>
          ${Icons({
            type: 'send-chat',
            dataStrings: 'data-type="send-chat-icon"',
          })}
          </div>
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
    const { createdAt: messageDay, receiver } = chats[chats.length - 1];
    const groupStatus = receiver === otherUserId ? 'sent' : 'received';

    return `
    <div class="message__group ${groupStatus}">
      <div data-type="message-time">${TimeManager.dateToCompleteTime(
        messageDay,
        { lowercase: true }
      )}</div>
      ${chats.map((chat) => this.messageItem(chat)).join(' ')}
    </div>
    `;
  }

  messageItem(chat) {
    const { message, status } = chat;
    return `
    <div class="message__group__item">
      <span class="${status}">
        ${Icons({ type: `chat/${status}` })}
      </span>
      <p>${message}</p>
    </div>`;
  }

  messageDay(day) {
    return `
    <div class="message__day" role="button">
      <span>${day === new Date().toDateString() ? 'today' : day}</span>
    </div>`;
  }

  bundleChatsToGroups(chats = []) {
    const maxSecDifference = 60;
    function isValidTimeDifference(curDateString, prevDateString) {
      const curDate = new Date(curDateString).getTime();
      const prevDate = new Date(prevDateString).getTime();
      const isValid = (curDate - prevDate) / 1000 < maxSecDifference;
      return isValid;
    }

    const bundledChats = chats.reduce((groups, currentChat, i, chatsArr) => {
      const previousChat = chatsArr[i - 1];
      if (!previousChat) groups.push([currentChat]);
      else if (currentChat.sender !== previousChat?.sender)
        groups.push([currentChat]);
      else if (
        !isValidTimeDifference(currentChat.createdAt, previousChat.createdAt)
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
}

export default new ChatView();
