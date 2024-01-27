import { Gradient } from './Gradient.js';
import authModel from '../models/authModel.js';
import flowAfterSignupView from '../views/flowAfterSignupView.js';
import modal from './modal.js';
import suggestionModel from '../models/suggestionModel.js';
import suggestionView from '../views/suggestionView.js';

class signUpFlowController {
  constructor() {
    this.init();
  }

  init() {
    this.gradient();
    this.displayInterest();
    flowAfterSignupView.interestMainContainer.addEventListener('click', (e) => {
      const target = e.target;
      const { type } = target.dataset;
      if (type === 'interest-topic') return this.toogleTopicSelection(target);
      const iconElement = target?.closest('svg');
      if (iconElement?.dataset.type === 'person-add')
        return this.suggestFollows(iconElement);
      return;
    });
    flowAfterSignupView.submitBtn.addEventListener('click', this.submitTopics);
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
    try {
      const { appModal } = modal.showModal(
        'app-modal__modal--topic-suggestion',
        [
          {
            event: suggestionView.closeSuggestion.bind(suggestionView),
            args: [],
          },
        ]
      );
      if (!appModal) return;

      const { topic, interest } = target.previousElementSibling.dataset;
      const { users } = await suggestionModel.suggestFollow(topic);
      const itemsDataClass = [
        { name: 'interest', value: interest },
        { name: 'topic', value: topic },
      ];
      modal.insertContent(
        suggestionView.modalHTML(topic, interest, users, {
          data: itemsDataClass,
        })
      );
      appModal.addEventListener('click', (e) => {
        const { target } = e;
        const { value, type, userId } = target.dataset;
        if (value !== 'action-btn') return;
        this[type](target, userId);
      });
      suggestionView.setScrollEvent(suggestionModel.suggestFollow, topic, {
        data: itemsDataClass,
      });
    } catch (err) {
      alert(err.message);
    }
  }

  async follow(btn, userId) {
    const { topic, interest } = btn.dataset;
    const followBasis = { topic, interest };
    const newBtnText = 'unfollow';
    btn.textContent = 'following...';
    try {
      await suggestionModel.follow(userId, { followBasis });
      authModel.reflectEngageMent({ followBasis });
    } catch (err) {
      alert(err.message);
    }
    btn.dataset.type = newBtnText;
    btn.textContent = newBtnText;
  }

  async unfollow(btn, userId) {
    const { topic, interest } = btn.dataset;
    const followBasis = { topic, interest };
    const newBtnText = 'follow';
    btn.textContent = 'unfollowing....';
    try {
      await suggestionModel.follow(userId, { followBasis, follow: false });
      authModel.reflectEngageMent({ followBasis, follow: false });
    } catch (err) {
      alert(err.message);
    }
    btn.dataset.type = newBtnText;
    btn.textContent = newBtnText;
  }

  toogleSubmitBtnState(numberOfInterests) {
    const minNumberOfInterests = 3;
    if (numberOfInterests > minNumberOfInterests) return;
    if (numberOfInterests === minNumberOfInterests)
      return (flowAfterSignupView.submitBtn.dataset.state = 'active');
    else flowAfterSignupView.submitBtn.dataset.state = 'inactive';
  }

  async submitTopics(e, submitBtn = e.target) {
    if (submitBtn.dataset.state !== 'active') return;
    submitBtn.dataset.state = 'inactive';
    try {
      await authModel.setInterests();
      window.location.replace('/');
      submitBtn.dataset.state = 'active';
    } catch (err) {
      alert(err);
    }
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

export default new signUpFlowController();
