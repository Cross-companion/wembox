import icons from './icons.js';

class flowAfterSignupView {
  constructor() {
    this.defineElements();
  }

  mainHTML() {
    return `
    <canvas id="gradient-canvas" data-transition-in></canvas>
    <button
      type="submit"
      id="submit-btn"
      data-state="inactive"
      class="btn__main interest__submit-btn"
      >
      Next
      </button>
      <main id="interest-main" class="main__interest glassmorph">
      <section id="interest-container" class="interest__container">
      <header>
      <h1 class="interest__heading">interests</h1>
      <p>What would you like to see on wembox?</p>
      </header>
      </section>
      </main>
      `;
  }

  defineElements() {
    this.htmlBody = document.querySelector('body');
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
}

export default new flowAfterSignupView();
