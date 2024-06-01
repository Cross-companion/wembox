import modal from './modal.js';
import appView from '../views/appView.js';
import appModel from '../models/appModel.js';
import suggestionView from '../views/suggestionView.js';
import suggestionModel from '../models/suggestionModel.js';

class AppController {
  constructor() {
    this.contactSuggestions = suggestionView.defineSuggestionContainer();
    this.currentUser = {};
    this.suggestContacts();
    this.contactSuggestions.addEventListener('click', (e) =>
      this.openContactRequestModal(e.target)
    );
    this.getContacts();
  }

  async getContacts() {
    const contacts = await appModel.getContacts();
    if (!contacts?.length) return this.insertContacts(appView.noContactsHtml());
    const contactList = appView.buildContactList(contacts);
    this.insertContacts(contactList);
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
    this.handleProfileVisits(suggestionView.suggestionContainer);
  }

  handleProfileVisits(suggestionContainer) {
    suggestionContainer.addEventListener('click', async (e) => {
      const { type, username, isFollowed, isInContact } = e.target.dataset;
      if (type !== 'profile-gateway') return;
      await this.visitProfile(username, isFollowed, isInContact, e.target);
    });
  }

  handleActionBtns = async (initializer, e) => {
    const dataset = e.target.dataset;
    const { type, value } = dataset;
    if (value !== 'action-btn') return;
    if (type === 'contact-request')
      return this.openContactRequestModal(e.target, initializer);
    if (type === 'follow') await this.follow(dataset, e.target, initializer);
  };

  async visitProfile(username, isFollowed, isInContact, initializer) {
    this.profileModal = modal.showModal(
      'app-modal__modal--no-padding profile'
    ).appModal;
    const { user } = await suggestionModel.getUser(username);
    modal.insertContent(
      suggestionView.createProfile(
        user,
        JSON.parse(isFollowed),
        JSON.parse(isInContact)
      )
    );
    this.profileSocialActions = document.querySelector('#social-action-btns');
    this.profileSocialActions.addEventListener(
      'click',
      this.handleActionBtns.bind(this, initializer)
    );
  }

  setFollowInitializer(initializer) {
    initializer.dataset.isFollowed = true;
  }
}

export default new AppController();
