class suggestionView {
  constructor() {
    this.page = 1;
  }

  createPerson(user, dataset = '', type = 'follow') {
    const { _id, name, profileImage, frontEndUsername } = user;
    return `
        <div id="suggestion-item-${_id}" ${dataset} class="suggestion__person">
            <img
                src="images/${profileImage}"
                alt=""
                class="suggestion__person__img"
                data-user-id="${_id}"
            />
            <div class="suggestion__person__details">
                <div>
                <div class="suggestion__person__name">${name}</div>
                <div class="suggestion__person__username">@${frontEndUsername}</div>
                </div>
                <button
                type="button"
                data-value="action-btn"
                ${dataset}
                data-type="${type}"
                data-user-id="${_id}"
                class="suggestion__btn-main"
                >
                ${type}
                </button>
            </div>
        </div>`;
  }

  buildSuggestion(users = [], data, type) {
    let dataset = '';
    if (data) dataset = this.arrangeDatasets(data);
    const html = users.map((user) => this.createPerson(user, dataset, type));
    return html.join('');
  }

  arrangeDatasets(data) {
    return data.map((data) => `data-${data.name}="${data.value}"`).join(' ');
  }

  modalHTML(
    topic,
    interest,
    users = [],
    {
      data = [
        { name: 'interest', value: `${interest}` },
        { name: 'topic', value: `${topic}` },
      ],
    } = {}
  ) {
    return `
    <div class="suggestion__topic-heading">
      <span class="suggestion__topic-heading__text">
        ${topic}
      </span>
    </div>
    <div id="suggestion-container" class="suggestion__container">
        ${
          this.buildSuggestion(users, data) ||
          `<span style="grid-column: span 2; grid-row: span 2">No account to follow under ${topic}.<br/>You are the first 😃🎉</span>`
        }      
    </div>`;
  }

  IntersectionObserver(topic, interest) {
    this.suggestionContainer = document.querySelector('#suggestion-container');
    let options = {
      root: this.suggestionContainer,
      threshold: 0.7,
    };
    this.observer = new IntersectionObserver(
      this.observerCallback.bind(this, topic, interest),
      options
    );
  }

  async observerCallback(topic, interest, entries, observer) {
    for (let i = 0; i < entries.length; i++) {
      const { isIntersecting } = entries[0];
      if (!isIntersecting) break;
      const { users } = await this.suggestionHandler(topic, (this.page += 1));
      if (!users.length) return this.closeObserver();
      this.insertNewPage(users, topic, interest);
      this.setNewObserverTarget();
    }
  }

  closeObserver() {
    this.scrollTarget && this.observer.unobserve(this.scrollTarget);
  }

  setNewObserverTarget() {
    if (this.scrollTarget) {
      this.closeObserver();
    }
    this.suggestionNodeList = document.querySelectorAll('#suggestion-item');
    const lengthOfNodeList = this.suggestionNodeList.length;
    const targetInversePosition = 3;
    this.scrollTarget =
      this.suggestionNodeList[lengthOfNodeList - (targetInversePosition + 1)];
    this.scrollTarget && this.observer.observe(this.scrollTarget);
  }

  setScrollEvent(suggestionHandler, { topic, interest } = {}) {
    this.suggestionHandler = suggestionHandler;
    this.IntersectionObserver(topic, interest);
    this.setNewObserverTarget();
  }

  insertNewPage(users, topic, interest) {
    const pageHTML = this.buildSuggestion(users, [
      { name: 'interest', value: `${interest}` },
      { name: 'topic', value: `${topic}` },
    ]);
    this.suggestionContainer.insertAdjacentHTML('beforeend', pageHTML);
  }

  closeSuggestion() {
    this.page = 1;
    this.closeObserver();
  }
}

export default new suggestionView();
