import modal from './modal.js';
import appView from '../views/appView.js';
import suggestionView from '../views/suggestionView.js';
import suggestionModel from '../models/suggestionModel.js';

class AppController {
  constructor() {
    this.contactSuggestions = suggestionView.defineSuggestionContainer();
    this.currentUser = {};
    this.suggestContacts();
    this.contactSuggestions.addEventListener('click', (e) =>
      this.openContactRequestModal(e.target.dataset)
    );
  }

  openContactRequestModal(dataset) {
    const { value, type, name, username, profileImage, userID } = dataset;
    if (value !== 'action-btn') return;
    modal
      .showModal()
      .insertContent(
        suggestionView.contactRequestModalHTML(
          name,
          username,
          profileImage,
          userID
        )
      );
  }

  async follow(dataset, btn) {
    const { userId } = dataset;
    try {
      btn.classList.add('active');
      await suggestionModel.follow(userId);
    } catch (err) {
      alert(err.message);
    }
  }

  async suggestContacts() {
    const itemsDataClass = [{ name: 'type', value: 'contact-request' }];
    const suggestionType = 'contact request';
    const data = await suggestionModel.suggestContactRequest();
    console.log(data);
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
      const { type, username } = e.target.dataset;
      if (type !== 'profile-gateway') return;
      await this.visitProfile(username);
    });
  }

  handleActionBtns = async (e) => {
    const dataset = e.target.dataset;
    const { type, value } = dataset;
    if (value !== 'action-btn') return;
    if (type === 'contact-request')
      return this.openContactRequestModal(dataset);
    if (type === 'follow') await this.follow(dataset, e.target);
  };

  async visitProfile(username) {
    this.profileModal = modal.showModal(
      'app-modal__modal--no-padding profile'
    ).appModal;
    const { user } = await suggestionModel.getUser(username);
    modal.insertContent(suggestionView.createProfile(user));
    this.profileSocialActions = document.querySelector('#social-action-btns');
    this.profileSocialActions.addEventListener('click', this.handleActionBtns);
    console.log(user);
  }
}

export default new AppController();
