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
        <img src="./../Imgs/app-images/logo-mid.png" alt="" />
        <div class="logo">
          <span class="logo__text logo__text--burn">Wembox</span>
          <span>inc.</span>
        </div>
      </div>
      <div class="app__loader__loader"></div>
    </div>`;
  }

  getContactEntity(contactId) {
    const contactEntity = document.querySelector(
      `[data-type="contact-entity"][data-contact-id="${contactId}"]`
    );
    return contactEntity;
  }

  setContactList() {
    this.contactList = document.querySelector('[data-type="contact-list"]');
    return this.contactList;
  }

  setCurrentEntity() {
    this.currentContactEntity = document.querySelector(
      '.active[data-type="contact-entity"], .active[data-type="contact-request-entity"]'
    );
    return this.currentContactEntity;
  }

  setContactStatus(
    { newStatus, possiblePrevStatus, contactId },
    { isReceived = false } = {}
  ) {
    const contactEntity = this.getContactEntity(contactId);
    if (!newStatus || !contactEntity) return;

    const queryStr = possiblePrevStatus
      .map(
        (status) =>
          `[data-type="contact-entity-status"][data-contact-entity-status="${status}"]`
      )
      .join(',');
    const contactStatus = contactEntity.querySelector(queryStr);
    if (!contactStatus) return;
    contactStatus.outerHTML = Icons({
      type: `chat/${newStatus}`,
      dataStrings: `data-type="contact-entity-status" data-contact-entity-status="${newStatus}"`,
    });

    const elementStatus = newStatus !== 'seen' ? 'unseen' : 'seen';
    const elementClassPrefix = isReceived ? 'received' : 'sent';
    const elementClass = `${elementClassPrefix}-${elementStatus}`;
    contactEntity.classList.add(elementClass);
    contactEntity.dataset.entityState = elementClass;
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

  noNotificationsHtml() {
    return `
  <div class="glassmorph app__no-contacts">
      <div class="app__no-contacts__logo">
        ${Icons({ type: 'bell', iconClasses: 'app__no-contacts__logo-icon' })}
        <h3>No new notification.</h3>
      </div>
      <h5>
        When You get a new notification, if pops up here.
      </h5>
  </div>`;
  }

  mediaTypes(media) {
    const mediaTag = media.payload.length > 1 ? 'multi' : 'single';

    switch (media.type) {
      case 'image':
        return Icons({ type: `image/${mediaTag}` });
      default:
        throw new Error('Invalid message type specified.');
    }
  }

  contactEntity(contact = {}, isActive) {
    const { _id: contactId, otherUser, lastMessage, unseenMessages } = contact;
    const {
      _id: otherUserId,
      profileImage,
      name,
      frontEndUsername: username,
    } = otherUser;
    const { status, message, createdAt, sender, media } = lastMessage;
    const isReceived = sender === otherUserId;
    let elementStatus = status !== 'seen' ? 'unseen' : 'seen';
    if (isActive && isReceived) elementStatus = 'seen';
    const elementClass = isReceived
      ? `received-${elementStatus}`
      : `sent-${elementStatus}`;
    const showAlertNumber = unseenMessages > 0;

    return `
    <div class="entity ${isActive ? 'active' : ''} ${elementClass}"
      data-type="contact-entity"
      data-contact-id="${contactId}"
      data-other-user-id="${otherUserId}"
      data-username="${username}"
      data-name="${name}"
      data-profile-image="${profileImage}"
      data-entity-state="${elementClass}"
      data-active="${isActive ? 'active' : ''}"
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
          ${media?.payload.length ? this.mediaTypes(media) : ''}
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
              : Icons({
                  type: `chat/${status}`,
                  dataStrings: `data-type="contact-entity-status" data-contact-entity-status="${status}"`,
                })
          }
        </span>
      </div>
    </div>`;
  }

  activateChatEntity(selectedEntity) {
    const currentEntity = this.setCurrentEntity();
    currentEntity?.classList.remove('active');
    if (currentEntity?.dataset.active) currentEntity.dataset.active = '';
    selectedEntity.classList.add('active');
    selectedEntity.dataset.active = 'active';
  }

  deactivateEntity(entity = this.setCurrentEntity()) {
    if (entity?.dataset.active) {
      entity.dataset.active = '';
      entity.classList.remove('active');
    }
  }

  isActiveEntity(otherUserId) {
    const activeUserId = this.currentContactEntity?.dataset.otherUserId;
    return activeUserId === otherUserId;
  }

  buildContactList(contacts = []) {
    const contactListHtml = contacts
      .map((contact) => this.contactEntity(contact))
      .join(' ');
    return contactListHtml;
  }

  updateContactList({ newChat, updatedContact: contact }) {
    const contactEntity = this.getContactEntity(contact?._id);
    if (!contactEntity) return;
    const dataset = contactEntity.dataset;
    contact.lastMessage = newChat;
    contact.otherUser = {
      _id: dataset.otherUserId,
      profileImage: dataset.profileImage,
      name: dataset.name,
      frontEndUsername: dataset.username,
    };

    contactEntity.remove();
    const contactList = this.setContactList();
    contactList.insertAdjacentHTML(
      'afterbegin',
      this.contactEntity(contact, dataset.active)
    );
  }

  CREntity({ _id, sender, message, createdAt } = {}) {
    const { profileImage, name, username, _id: otherUserId } = sender;
    const { message: requestMessage = '' } = message || {};

    return `
    <div
      data-type="contact-request-entity"
      class="entity"
      data-chat-id="${_id}"
      data-other-user-id="${otherUserId}"
      data-username="${username}"
      data-name="${name}"
      data-profile-image="${profileImage}"
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
        <div>
          <span class="entity__title">${name}</span
          ><span> sent you a contact request.</span>
        </div>
        <div class="entity__message" title="${requestMessage}">
          <p class="entity__message__message">
            ${requestMessage}
          </p>
        </div>
        <span class="entity__message__time">
          <span>${TimeManager.dateToCompleteTime(createdAt, {
            lowercase: true,
          })}</span>
        </span>
      </div>
    </div>`;
  }

  followEntity({ sender, createdAt } = {}) {
    const { profileImage, name, username } = sender;
    return `
    <div data-type="follow-entity" class="entity">
      <div>
        <img
          data-type="profile-gateway"
          data-username="${username}"
          src="${profileImage}"
          alt="profile image of ${name}"
          class="entity__img"
        />
      </div>
      <div class="entity__content">
        <div><span class="entity__title">${name}</span> followed you</div>
        <span class="entity__message__time">
          <span>${TimeManager.dateToCompleteTime(createdAt, {
            lowercase: true,
          })}</span>
        </span>
      </div>
    </div>`;
  }

  buildNotifications(notifications = []) {
    return notifications
      .map((element) => {
        const { notificationType, sender, createdAt } = element;

        if (notificationType === 'follow')
          return this.followEntity({ sender, createdAt });
        else if (notificationType === 'contact-request')
          return this.CREntity(element);
      })
      .join(' ');
  }
}

export default new AppView();
