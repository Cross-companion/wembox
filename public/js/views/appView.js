import Icons from '../utils/Icons.js';
import TimeManager from '../utils/TimeManager.js';

class AppView {
  constructor() {
    this.app = document.querySelector('#app');
    this.pages = document.querySelectorAll('[data-type="page"]');
    this.appNav = document.querySelector('#app-nav');
    this.appHeader = document.querySelector('#app-header');
    this.contactList = document.querySelector('[data-type="contact-list"]');
    this.currentContactEntity = document.querySelector(
      '.active[data-type="contact-entity"]'
    );
    this.watchAppHeader();
  }

  watchAppHeader() {
    const handleNavPosition = (entries) => {
      this.appNav.classList.toggle('fixed');
      //   for (let i = 0; i < entries.length; i++) {
      //     const entry = entries[i];
      //     const appNav = document.querySelector('#app-nav');
      //     appNav.classList.add('fixed');
      //   }
    };

    let options = {
      root: null,
      threshold: 0.1,
    };

    const observer = new IntersectionObserver(handleNavPosition, options);
    observer.observe(this.appHeader);
  }

  appLoader() {
    return `
    <div class="app__loader" data-loader="loader">
      <div class="app__loader__logo">
        <img src="./../Imgs/logos/DALL-E/wembee-logo-v1.jpg" alt="" />
        <div class="logo">
          <span class="logo__text logo__text--burn">Wembox</span>
          <span>inc.</span>
        </div>
      </div>
      <div class="app__loader__loader"></div>
    </div>`;
  }

  setContactList() {
    this.contactList = document.querySelector('[data-type="contact-list"]');
    return this.contactList;
  }

  setCurrentEntity() {
    this.currentContactEntity = document.querySelector(
      '.active[data-type="contact-entity"]'
    );
    return this.currentContactEntity;
  }

  noContactsHtml() {
    return `
  <div class="glassmorph app__no-contacts">
      <div class="app__no-contacts__logo">
        <svg
          class="app__no-contacts__logo-icon"
          xmlns="http://www.w3.org/2000/svg"
          height="90"
          viewBox="0 -960 960 960"
          width="90"
        >
          <path
            d="m438-452-58-57q-11-11-27.5-11T324-508q-11 11-11 28t11 28l86 86q12 12 28 12t28-12l170-170q12-12 11.5-28T636-592q-12-12-28.5-12.5T579-593L438-452ZM326-90l-58-98-110-24q-15-3-24-15.5t-7-27.5l11-113-75-86q-10-11-10-26t10-26l75-86-11-113q-2-15 7-27.5t24-15.5l110-24 58-98q8-13 22-17.5t28 1.5l104 44 104-44q14-6 28-1.5t22 17.5l58 98 110 24q15 3 24 15.5t7 27.5l-11 113 75 86q10 11 10 26t-10 26l-75 86 11 113q2 15-7 27.5T802-212l-110 24-58 98q-8 13-22 17.5T584-74l-104-44-104 44q-14 6-28 1.5T326-90Zm52-72 102-44 104 44 56-96 110-26-10-112 74-84-74-86 10-112-110-24-58-96-102 44-104-44-56 96-110 24 10 112-74 86 74 84-10 114 110 24 58 96Zm102-318Z"
          />
        </svg>
        <h3>You have no contacts yet!</h3>
      </div>
      <h5>
        You can Send a contact request below to people you might know or find
        interesting.
      </h5>
  </div>`;
  }

  contactEntity(contact = {}, isActive) {
    const { otherUser, lastMessage, unseenMessages } = contact;
    const {
      _id: otherUserId,
      profileImage,
      name,
      frontEndUsername: username,
    } = otherUser;
    const { status, message, createdAt, sender } = lastMessage;
    const isReceived = sender === otherUserId;
    const elementStatus = status !== 'seen' ? 'unseen' : 'seen';
    const elementClass = isReceived
      ? `received-${elementStatus}`
      : `sent-${elementStatus}`;
    const showAlertNumber = unseenMessages > 0;

    return `
    <div class="entity ${isActive ? 'active' : ''} ${elementClass}"
      data-type="contact-entity"
      data-other-user-id="${otherUserId}"
      data-username="${username}"
      data-name="${name}"
      data-profile-image="${profileImage}"
      data-entity-state='${elementClass}'
      >
      <div>
        <img
          data-type="profile-gateway"
          data-username="${username}"
          src="${profileImage}"
          alt="${name}'s profile image"
          class="entity__img"
        />
      </div>
      <div class="entity__content">
        <div class="entity__title">${name}</div>
        <div class="entity__message" title="${message}">
          <p class="entity__message__message">
            ${message}
          </p>
        </div>
        <span class="entity__message__time">
          <span>${TimeManager.dateToCompleteTime(createdAt, {
            lowercase: true,
          })}</span>
          ${
            isReceived && showAlertNumber
              ? `<span class="entity__alert-number">${unseenMessages}</span>`
              : Icons({ type: `chat/${status}` })
          }
        </span>
      </div>
    </div>`;
  }

  buildContactList(contacts = []) {
    const contactListHtml = contacts
      .map((contact) => this.contactEntity(contact))
      .join(' ');
    return contactListHtml;
  }

  updateContactList({ newChat, updatedContact, otherUser }) {
    const contactEntity = document.querySelector(
      `[data-type="contact-entity"][data-other-user-id="${otherUser._id}"]`
    );
    const contact = { ...updatedContact };
    const dataset = contactEntity.dataset;
    contact.lastMessage = newChat;
    contact.otherUser = {
      _id: otherUser._id,
      profileImage: dataset.profileImage,
      name: dataset.name,
      frontEndUsername: dataset.username,
    };

    contactEntity.remove();
    const contactList = this.setContactList();
    contactList.insertAdjacentHTML(
      'afterbegin',
      this.contactEntity(contact, true)
    );
  }
}

export default new AppView();
