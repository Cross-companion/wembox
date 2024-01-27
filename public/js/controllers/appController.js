import modal from './modal.js';
import appView from '../views/appView.js';
import suggestionView from '../views/suggestionView.js';
import suggestionModel from '../models/suggestionModel.js';

class AppController {
  constructor() {
    this.contactSuggestions = suggestionView.defineSuggestionContainer();
    this.currentUser = {};
    this.suggestContacts();
    this.contactSuggestions.addEventListener(
      'click',
      this.openContactRequestModal
    );
  }

  openContactRequestModal(e) {
    const { value, type, name, username, profileImage, userID } =
      e.target.dataset;
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

  async suggestContacts() {
    const itemsDataClass = [{ name: 'type', value: 'contact-request' }];
    const suggestionType = 'contact request';
    const { users } = await suggestionModel.suggestContactRequest();
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

  async visitProfile(username) {
    this.profileModal = modal.showModal(
      'app-modal__modal--no-padding profile'
    ).appModal;
    const { user } = await suggestionModel.getUser(username);
    modal.insertContent(suggestionView.createProfile(user));
    console.log(user);
  }
}

export default new AppController();
