import appView from '../views/appView.js';
import suggestionView from '../views/suggestionView.js';
import suggestionModel from '../models/suggestionModel.js';

class AppController {
  constructor() {
    this.contactSuggestions = document.querySelector('#suggestion-container');
    this.suggestContacts();
  }

  async suggestContacts() {
    const { topics } = {
      topics: ['software'],
    };
    const { users } = await suggestionModel.suggestContactRequest(topics);
    const suggestions = suggestionView.buildSuggestion(
      users,
      [{ name: 'type', value: 'contact-request' }],
      'contact request'
    );
    this.contactSuggestions.innerHTML = '';
    this.contactSuggestions.insertAdjacentHTML('afterbegin', suggestions);
  }
}

export default new AppController();
