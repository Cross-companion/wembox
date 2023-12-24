import icons from './icons.js';

class flowAfterSignupView {
  constructor() {
    this.defineElements();
  }

  defineElements() {
    this.interestContainer = document.querySelector('#interest-container');
    this.interestMainContainer = document.querySelector('#interest-main');
    this.submitBtn = document.querySelector('#submit-btn');
  }

  interestGroupHTML(interest, topics = []) {
    const html = `
        <section id="interest-group" class="interest__group">
          <div class="interest__group-head">
            <span class="interest__group-head--text">${interest}</span
            >
          </div>
          ${this.assignTopics(interest, topics)}
          </section>`;
    // <span class="interest__people-btn">Follow accounts</span>;
    return html;
  }

  topicsContainerHTML(slotElements) {
    const html = `<div class="interest__topics--container">
            <div class="interest__topics--container--slot" data-slot-number="1">
            ${slotElements.slot1}
            </div>
            <div class="interest__topics--container--slot" data-slot-number="2">
              ${slotElements.slot2}
            </div>
            <div class="interest__topics--container--slot" data-slot-number="3">
              ${slotElements.slot3}
            </div>
          </div>`;

    return html;
  }

  assignTopics(interest, topics) {
    const topicSpan = (topic) =>
      `<div class="interest__topics__item">
      <span class="interest__topics--topic" data-interest="${interest}" data-topic="${topic}" data-type="interest-topic">${topic}</span>
      ${icons.person_add('interest__topics__follow-icon')}
      </div>`;

    const slotElements = topics.reduce(
      (acc, topic) => {
        if (acc.slotNum > 3) acc.slotNum = 1;
        acc[`slot${acc.slotNum}`] += topicSpan(topic);
        acc.slotNum++;
        return acc;
      },
      { slot1: '', slot2: '', slot3: '', slotNum: 1 }
    );

    const assignedTopics = this.topicsContainerHTML(slotElements);
    return assignedTopics;
  }

  modalHTML(topic, user) {
    return `
    <div class="suggestion__topic-heading">
          <span class="suggestion__topic-heading__text">
            ${topic}
          </span>
        </div>
    <div class="suggestion__container">
          <div class="suggestion__person">
            <img
              src="../Imgs/users/upwork-profile_edited.jpg"
              alt=""
              class="suggestion__person__img"
            />
            <div class="suggestion__person__details">
              <div>
                <div class="suggestion__person__name">Nwodoh Izuchukwu</div>
                <div class="suggestion__person__username">@me</div>
              </div>
              <button
                type="button"
                data-type="follow"
                class="suggestion__btn-main"
              >
                follow
              </button>
            </div>
          </div>
          <div class="suggestion__person">
            <img
              src="../Imgs/users/leo.jpg"
              alt=""
              class="suggestion__person__img"
            />
            <div class="suggestion__person__details">
              <div>
                <div class="suggestion__person__name">Leo Juvere</div>
                <div class="suggestion__person__username">@LeoJuvy</div>
              </div>
              <button
                type="button"
                data-type="follow"
                class="suggestion__btn-main"
              >
                follow
              </button>
            </div>
          </div>
          <div class="suggestion__person">
            <img
              src="../Imgs/users/monica.jpg"
              alt=""
              class="suggestion__person__img"
            />
            <div class="suggestion__person__details">
              <div>
                <div class="suggestion__person__name">Monica long</div>
                <div class="suggestion__person__username">@monicalong</div>
              </div>
              <button
                type="button"
                data-type="follow"
                class="suggestion__btn-main"
              >
                follow
              </button>
            </div>
          </div>
          <div class="suggestion__person">
            <img
              src="../Imgs/users/upwork-profile_edited.jpg"
              alt=""
              class="suggestion__person__img"
            />
            <div class="suggestion__person__details">
              <div>
                <div class="suggestion__person__name">Nwodoh Daniel</div>
                <div class="suggestion__person__username">@_longboy</div>
              </div>
              <button
                type="button"
                data-type="follow"
                class="suggestion__btn-main"
              >
                follow
              </button>
            </div>
          </div>
        </div>`;
  }
}

export default new flowAfterSignupView();
