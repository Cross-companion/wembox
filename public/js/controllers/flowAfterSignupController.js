import { Gradient } from './Gradient.js';
import authModel from '../models/authModel.js';
import flowAfterSignupView from '../views/flowAfterSignupView.js';
import modal from './modal.js';
import suggestionModel from '../models/suggestionModel.js';
import suggestionView from '../views/suggestionView.js';

class signUpFlowController {
  constructor() {
    this.gradient();
    this.displayInterest();
    this.init();
  }

  init() {
    flowAfterSignupView.interestMainContainer.addEventListener('click', (e) => {
      const target = e.target;
      const { type } = target.dataset;
      if (type === 'interest-topic') return this.toogleTopicSelection(target);
      const iconElement = target?.closest('svg');
      if (iconElement?.dataset.type === 'person-add')
        return this.suggestFollows(iconElement);
      return;
    });
  }

  toogleTopicSelection(target) {
    const { interest, topic, isSelected } = target.dataset;
    if (isSelected === 'true') {
      this.removeTopic(topic);
      target.dataset.isSelected = 'false';
    } else {
      this.addTopic(topic, interest);
      target.dataset.isSelected = 'true';
    }
  }

  addTopic(topic, interest) {
    const interestObj = this.newInterestOBJ(topic, interest);
    authModel.userDetails.interests.push(interestObj);
    this.toogleSubmitBtnState(authModel.userDetails.interests.length);
  }

  removeTopic(topic) {
    authModel.userDetails.interests.find((interest, i, arr) => {
      if (arr[i].topic !== topic) return false;
      arr.splice(i, 1);
      return true;
    });
    this.toogleSubmitBtnState(authModel.userDetails.interests.length);
  }

  async displayInterest() {
    const { interests } = await authModel.getInterests();
    interests.forEach((interest) => {
      const interestGroupHTML = flowAfterSignupView.interestGroupHTML(
        interest._id,
        interest.topics
      );
      flowAfterSignupView.interestContainer.insertAdjacentHTML(
        'beforeend',
        interestGroupHTML
      );
    });
  }

  async suggestFollows(target) {
    const { topic } = target.previousElementSibling.dataset;
    const { users } = await suggestionModel.suggestFollow(topic);
    modal.showModal(
      suggestionView.modalHTML(topic, users),
      'app-modal__modal--topic-suggestion'
    );
  }

  toogleSubmitBtnState(numberOfInterests) {
    const minNumberOfInterests = 3;
    if (numberOfInterests > minNumberOfInterests) return;
    if (numberOfInterests === minNumberOfInterests)
      return (flowAfterSignupView.submitBtn.dataset.state = 'active');
    else flowAfterSignupView.submitBtn.dataset.state = 'inactive';
  }

  newInterestOBJ(topic, interest) {
    return {
      topic: topic,
      interest,
      engagements: 0,
    };
  }

  gradient(canvas = '#gradient-canvas') {
    const gradient = new Gradient();
    gradient.initGradient(canvas);
  }
}

new signUpFlowController();
