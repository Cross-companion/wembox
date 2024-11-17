import modal from './modal.js';
import appView from '../views/appView.js';
import appModel from '../models/appModel.js';
import suggestionView from '../views/suggestionView.js';
import suggestionModel from '../models/suggestionModel.js';
import userModel from '../models/userModel.js';
import userViews from '../views/userViews.js';
import chatController from './chatController.js';
import SwitchBtn from '../utils/switchBtn.js';
import socket from '../utils/socket.js';
import Notifications from '../utils/Notifications.js';

class AppController {
  constructor() {
    this.contactSuggestions = suggestionView.defineSuggestionContainer();
    this.exploreBtn = suggestionView.defineExploreBtn();
    this.currentUser = {};
    this.notificationSwitchBtn = new SwitchBtn(
      document.querySelector('[data-type="header-notifications"]')
    );
    this.suggestContacts();
    this.contactSuggestions.addEventListener('click', (e) =>
      this.openContactRequestModal(e.target)
    );
    this.getContacts();
    appModel.getNotifications();
    this.eventHandler();
    this.setSocketHandlers();
    this.windowEvent();
  }

  windowEvent() {
    window.addEventListener('popstate', (event) => {
      if (!window.location.search) {
        this.closeChat();
      }
    });
  }

  setSocketHandlers() {
    const handlers = [
      { event: 'chatReceived', func: this.chatReceived.bind(this) },
      { event: 'chatProcessed', func: this.chatReceived.bind(this) },
      { event: 'chatStatusUpdated', func: this.updateContactStatus.bind(this) },
      {
        event: 'requestNotificationSubscription',
        func: Notifications.showPermissionModal.bind(Notifications),
      },
    ];
    socket.socketListeners(handlers);
  }

  eventHandler() {
    const app = appView.app;
    app.addEventListener('click', this.clickHandlers.bind(this));
    app.addEventListener('submit', this.submitHandlers.bind(this));
    app.addEventListener('change', this.changeHandlers.bind(this));
  }

  clickHandlers(e) {
    const target = e.target;
    const isProfileGateway = target.dataset.type === 'profile-gateway';
    const isCancelUpdateMe = target.dataset.type === 'cancel-update-me';
    const isProfileLogout = target.dataset.type === 'profile-logout';
    const isProfileOptionsClose =
      target.dataset.type === 'modal-option-item-cancel';
    const isExploreBtn =
      target.dataset.type === 'explore-btn' ||
      target.closest('[data-type="explore-btn"]')
        ? true
        : false;
    const isDeleteChatMediaPreview =
      target.dataset.type === 'delete-chat-media-preview' ||
      target.closest('[data-type="delete-chat-media-preview"]')
        ? true
        : false;
    const isCloseChatBtn =
      target.dataset.type === 'close-chat-btn' ||
      target.closest('[data-type="close-chat-btn"]')
        ? true
        : false;
    const isContactEntity =
      target.dataset.type === 'contact-entity' ||
      target.closest('[data-type="contact-entity"]')
        ? true
        : false;
    const isCREntity =
      target.dataset.type === 'contact-request-entity' ||
      target.closest('[data-type="contact-request-entity"]')
        ? true
        : false;

    const isEditProfile =
      target.dataset.type === 'profile-edit' ||
      target.closest('[data-type="profile-edit"]')
        ? true
        : false;
    const isNotificationToogle =
      target.dataset.type === 'header-notifications' ||
      target.closest('[data-type="header-notifications"]')
        ? true
        : false;
    const isNotificationPromptBtn =
      target.dataset.type === 'notifications-prompt-btn';

    if (isExploreBtn) return this.openExplorer();
    if (isProfileGateway) return this.handleProfileVisits(target); // Imgs in this have a higher prioity than it being part of a contact entity, hence, not needed to bubble up.
    if (isContactEntity)
      return this.openChats(target.closest('[data-type="contact-entity"]'));
    if (isCloseChatBtn) return this.closeChat();
    if (isCREntity)
      return this.openCR(
        target.closest('[data-type="contact-request-entity"]')
      );
    if (isEditProfile)
      return modal.replaceContentContainer(
        userViews.updateMeForm(this.PUBLIC_USER_DATA)
      );
    if (isCancelUpdateMe) return modal.closeModal();
    if (isDeleteChatMediaPreview)
      return chatController.deleteChatPreview(target);
    if (isNotificationToogle) return this.notificationToogle();
    if (isProfileLogout) return this.logout();
    if (isProfileOptionsClose) return modal.closeModalOptions();
    if (isNotificationPromptBtn)
      return Notifications.requestPermission(
        target.dataset.value === 'accepted'
      );
  }

  submitHandlers(e) {
    e.preventDefault();
    const form = e.target;
    const isUpdateMeForm = form.dataset.type === 'update-me-form';
    const isChatInputForm = form.dataset.type === 'chat-input-form';
    const isCRForm = form.dataset.type === 'cr-form';

    if (isUpdateMeForm) return this.updateMe(form);
    if (isChatInputForm) return this.sendChat(form);
    if (isCRForm)
      return chatController.processCR(form, e.submitter.dataset.value);
  }

  changeHandlers(e) {
    const input = e.target;
    const isImagePreviewInput =
      e.target.dataset.type === 'update-me-image-preview-input';
    const isChatMediaPreviewInput =
      e.target.dataset.type === 'chat-media-preview-input';

    if (isImagePreviewInput)
      return suggestionView.setProfileImagePreview(input);
    if (isChatMediaPreviewInput) chatController.addMediaPreview(input);
  }

  async getContacts() {
    try {
      const { contacts } = await appModel.getContacts();
      if (!contacts?.length)
        return this.insertContacts(appView.noContactsHtml());
      const contactList = appView.buildContactList(contacts);
      this.insertContacts(contactList);
      const contactData = contacts.map((contact) => {
        return { contactId: contact._id, otherUser: contact.otherUser._id };
      });
      socket.emit('updateChatStatus', {
        newStatus: 'delivered',
        contactData,
      });
      history.pushState(null, '', '/');
    } catch (err) {
      console.error(err.message);
    } finally {
      this.toogleLoader(appView.app, undefined, { remove: true });
    }
  }

  async openNotifications() {
    const { notifications } = await appModel.getNotifications();
    if (!notifications?.length)
      return this.insertContacts(appView.noNotificationsHtml());
    const notificationList = appView.buildNotifications(notifications);
    this.insertContacts(notificationList);
    history.pushState(null, '', '?notification');
  }

  insertContacts(html) {
    appView.contactList.innerHTML = '';
    appView.contactList.insertAdjacentHTML('beforeend', html);
  }

  openContactRequestModal(btn, initializer) {
    const { value, type, name, username, profileImage, userId } = btn.dataset;
    if (value !== 'action-btn') return;
    const requestModal = modal
      .showModal()
      .insertContent(
        suggestionView.contactRequestModalHTML(
          name,
          username,
          profileImage,
          userId
        )
      ).contentContainer;
    const parentInitailizer =
      initializer?.closest('[data-class="suggestion-item"]') ||
      btn.closest('[data-class="suggestion-item"]');
    const requestForm = requestModal.children[0];
    requestForm.addEventListener(
      'submit',
      this.sendContactRequest.bind(this, parentInitailizer)
    );
  }

  async follow(dataset, btn, initializer) {
    if ([...btn.classList].includes('active')) return;
    const { userId } = dataset;
    try {
      btn.classList.add('active');
      btn.textContent = 'following';
      await suggestionModel.follow(userId);
      this.setFollowInitializer(initializer);
    } catch (err) {
      alert(err.message);
    }
  }

  async sendContactRequest(parentInitailizer, e) {
    const submitBtn = document.querySelector('#contact-request-submit-btn');
    if ([...submitBtn.classList].includes('active') || !submitBtn) return;
    try {
      e.preventDefault();

      const { userId: receiverID } = e.srcElement.dataset;
      submitBtn.classList.add('active');
      submitBtn.value = 'sending';
      const message = document.querySelector('#contact-request-message').value;
      await suggestionModel.sendContactRequest(receiverID, { message });
      submitBtn.value = 'sent';
      alert('contact request sent successfully');
      modal.closeModal();
      parentInitailizer.remove();
    } catch (err) {
      alert(err.message);
      submitBtn.classList.remove('active');
      submitBtn.value = 'send';
    }
  }

  async suggestContacts() {
    const itemsDataClass = [{ name: 'type', value: 'contact-request' }];
    const suggestionType = 'contact request';
    const data = await suggestionModel.suggestContactRequest();
    const { users } = data;
    suggestionView.insertNewPage(users, itemsDataClass, suggestionType, {
      clear: true,
    });
    suggestionView.setScrollEvent(
      suggestionModel.suggestContactRequest,
      undefined,
      {
        data: itemsDataClass,
        type: 'contact request',
      }
    );
  }

  handleProfileVisits(profileGateway) {
    const { type, username } = profileGateway.dataset;
    if (type !== 'profile-gateway')
      throw new Error(
        'Wrong arguement is been passed into handleProfileVisits'
      );
    this.visitProfile(username, profileGateway);
  }

  handleActionBtns = async (initializer, e) => {
    const target = e.target;
    const dataset = target.dataset;

    const isContactRequest = dataset.type === 'contact-request';
    const isFollow = dataset.type === 'follow';

    if (isContactRequest)
      return this.openContactRequestModal(target, initializer);
    if (isFollow) return await this.follow(dataset, target, initializer);
  };

  async visitProfile(username, initializer) {
    this.profileModal = modal.showModal(
      'app-modal__modal--no-padding profile'
    ).appModal;
    const { user } = await suggestionModel.getUser(username);
    const isMe = initializer?.dataset.me === 'me';
    modal.insertContent(suggestionView.createProfile(user, isMe));
    if (isMe) this.PUBLIC_USER_DATA = suggestionView.PUBLIC_USER_DATA;
    this.profileSocialActions = document.querySelector('#social-action-btns');
    this.profileSocialActions.addEventListener(
      'click',
      this.handleActionBtns.bind(this, initializer)
    );
  }

  setFollowInitializer(initializer) {
    initializer.dataset.isFollowed = true;
  }

  toogleLoader(parentEl, loader, { remove } = {}) {
    if (remove) {
      parentEl.dataset.loadState = 'loaded';
      const loader = parentEl.querySelector('[data-loader="loader"]');
      loader?.remove();
      return;
    }

    if (parentEl?.dataset.loadState === 'loading') return;
    parentEl.dataset.loadState = 'loading';
    parentEl.insertAdjacentHTML('afterbegin', loader);
  }

  async updateMe(form) {
    try {
      const isMe = true;
      const formData = new FormData(form);
      modal.setToDefault();
      const { user: updatedMe } = await userModel.updateMe(formData);
      modal.replaceContentContainer(
        modal.profileContentContainer(
          suggestionView.createProfile(updatedMe, isMe)
        )
      );
      this.PUBLIC_USER_DATA = suggestionView.setPublicUserData(updatedMe);
      suggestionView.updateMyProfiles(this.PUBLIC_USER_DATA.profileImage);
    } catch (err) {
      console.error(err);
      alert(err.message);
      modal.closeModal();
    }
  }

  activatePage(pageName, param = `?${pageName}`) {
    if (pageName !== 'chats' && pageName !== 'contacts')
      throw new Error('Invalid page name');

    appView.pages.forEach((page) => {
      page.dataset.pageName === pageName
        ? page.classList.add('active')
        : page.classList.remove('active');
    });

    history.pushState(null, '', param);
  }

  async openChats(entity) {
    this.activatePage('chats');
    appView.activateChatEntity(entity);
    await chatController.openChats({ ...entity.dataset });
    if (entity.dataset.entityState === 'received-unseen')
      entity.dataset.entityState = 'received-seen';
  }

  async openCR(entity) {
    this.activatePage('chats');
    appView.activateChatEntity(entity);
    chatController.openCR({ ...entity.dataset });
  }

  async sendChat(form) {
    const chatData = await chatController.sendChat(new FormData(form));
    appView.updateContactList(chatData);
    appModel.updateRemoteData('contacts', chatData.updatedContact);
  }

  chatReceived(chatData) {
    appView.updateContactList(chatData);
    const { lastMessage, otherUser } = appModel.updateRemoteData(
      'contacts',
      chatData.updatedContact
    )[0];
    const wasSentByOtherUser = lastMessage.sender === otherUser._id;

    wasSentByOtherUser &&
      Notifications.send(
        lastMessage.message,
        otherUser.profileImage,
        otherUser.name,
        lastMessage?.media?.type === 'image'
          ? lastMessage.media.payload[0]
          : undefined
      );
  }

  notificationToogle() {
    const pageType = this.notificationSwitchBtn.switch();
    const page = pageType.split('show-')[1];
    if (page === 'chats') return this.getContacts();
    else if (page === 'notifications') this.openNotifications();
  }

  updateContactStatus({ newStatus, possiblePrevStatus = [], contactId }) {
    if (!newStatus || !possiblePrevStatus?.length || !contactId) return;
    appModel.updateContactStatus(newStatus, contactId);
    appView.setContactStatus({ newStatus, possiblePrevStatus, contactId });
  }

  closeChat() {
    this.activatePage('contacts', '/');
    appView.deactivateEntity();
    chatController.closeChat();
  }

  logout() {
    modal.insertModalOptions([
      {
        prompt: 'Please confirm Log out',
        url: '/api/v1/users/logout',
        action: 'Log out',
      },
    ]);
  }

  openExplorer() {
    const notActive = this.exploreBtn.classList.contains('active');
    this.contactSuggestions.classList.toggle('explore__active');
    this.contactSuggestions.classList.toggle('app__contact-suggestion');
    this.contactSuggestions.classList.toggle('suggestion__container');
    this.exploreBtn.classList.toggle('active');
    this.exploreBtn.querySelector('span').textContent = notActive
      ? 'explore'
      : 'close';
  }
}

export default new AppController();
