import modal from './modal.js';
import appView from '../views/appView.js';
import appModel from '../models/appModel.js';
import suggestionView from '../views/suggestionView.js';
import suggestionModel from '../models/suggestionModel.js';
import userModel from '../models/userModel.js';
import userViews from '../views/userViews.js';

class AppController {
  constructor() {
    this.contactSuggestions = suggestionView.defineSuggestionContainer();
    this.currentUser = {};
    this.suggestContacts();
    this.contactSuggestions.addEventListener('click', (e) =>
      this.openContactRequestModal(e.target)
    );
    this.getContacts();
    this.eventHandler();
  }

  eventHandler() {
    const app = appView.app;
    app.addEventListener('click', this.clickHandlers.bind(this));
    app.addEventListener('change', this.changeHandlers.bind(this));
    app.addEventListener('submit', this.submitHandlers.bind(this));
  }

  clickHandlers(e) {
    const target = e.target;
    const isProfileGateway = target.dataset.type === 'profile-gateway';

    if (isProfileGateway) return this.handleProfileVisits(target);
  }

  submitHandlers(e) {
    e.preventDefault();
    const form = e.target;
    const isUpdateMeForm = form.dataset.type === 'update-me-form';

    if (isUpdateMeForm) return userModel.updateMe(new FormData(form));
  }

  changeHandlers(e) {
    const input = e.target;
    const isImagePreviewInput = e.target.dataset.type === 'image-preview-input';

    if (isImagePreviewInput)
      return suggestionView.setProfileImagePreview(input);
  }

  async getContacts() {
    try {
      const { contacts } = await appModel.getContacts();
      if (!contacts?.length)
        return this.insertContacts(appView.noContactsHtml());
      const contactList = appView.buildContactList(contacts);
      this.insertContacts(contactList);
    } catch (err) {
      // alert(err.message);
    } finally {
      this.toogleLoader(appView.app, undefined, { remove: true });
    }
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
    const isEditProfile =
      dataset.type === 'profile-edit' ||
      target.closest('[data-type="profile-edit"]')
        ? true
        : false;
    const isContactRequest = dataset.type === 'contact-request';
    const isFollow = dataset.type === 'follow';

    if (isContactRequest)
      return this.openContactRequestModal(target, initializer);
    if (isFollow) return await this.follow(dataset, target, initializer);
    if (isEditProfile)
      return modal.replaceContentContainer(
        userViews.updateMeForm(this.PUBLIC_USER_DATA)
      );
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
      loader.remove();
      return;
    }
    console.log(typeof parentEl);
    console.log(typeof loader);

    if (parentEl?.dataset.loadState === 'loading') return;
    parentEl.dataset.loadState = 'loading';
    parentEl.insertAdjacentHTML('afterbegin', loader);
  }
}

export default new AppController();
