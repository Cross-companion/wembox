import appView from '../views/appView.js';
import suggestionView from '../views/suggestionView.js';
import suggestionModel from '../models/suggestionModel.js';

class AppController {
  constructor() {
    this.contactSuggestions = suggestionView.defineSuggestionContainer();
    this.currentUser = {};
    this.suggestContacts();
  }

  async suggestContacts() {
    const { currentUser } = await suggestionModel.getCurrentUser();
    this.currentUser = currentUser;
    const itemsDataClass = [{ name: 'type', value: 'contact-request' }];
    const suggestionType = 'contact request';
    const topics = suggestionView.abstractTopics(this.currentUser.contentType);
    const { users } = await suggestionModel.suggestContactRequest(topics);
    suggestionView.insertNewPage(users, itemsDataClass, suggestionType, {
      clear: true,
    });
    suggestionView.setScrollEvent(
      suggestionModel.suggestContactRequest,
      topics,
      {
        data: itemsDataClass,
        type: 'contact request',
      }
    );
  }
}

export default new AppController();
