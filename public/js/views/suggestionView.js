class suggestionView {
  constructor() {
    this.page = 1;
  }

  defineSuggestionContainer() {
    this.suggestionContainer = document.querySelector('#suggestion-container');
    return this.suggestionContainer;
  }

  createProfile(user) {
    const {
      name,
      username,
      profileImage,
      profileCoverImage,
      numberOfFollowing,
      numberOfFollowers,
    } = user;
    return `
    <div id="app-modal-overlay" class="app-modal__overlay"></div>
      <div
        id="app-modal-content-container" class="profile app-modal__modal app-modal__modal--no-padding glassmorph profile">
        <div class="profile__images">
          <img class="profile__images__cover" src="/images/${profileCoverImage}" alt="">
          <img class="profile__images__profile" src="/images/${profileImage}" alt="">
        </div>
        <div class="profile__details">
          <div class="profile__details__identity">
            <div class="profile__details__name">${name}</div>
            <div class="profile__details__username"><span>@</span>${username}</div>
          </div>
          <div class="profile__details__note">Gratittude is a must ♥</div>
          <div class="profile__details__following">
            <div><span>${numberOfFollowers}</span> followers</div>
            <div><span>${numberOfFollowing}</span> following</div>
          </div>
          <div><span></span><span></span></div>
        </div>
      </div>`;
  }

  createPerson(user, dataset = '', type = 'follow') {
    const { _id, name, profileImage, frontEndUsername } = user;
    return `
        <div id="suggestion-item-${_id}" data-class="suggestion-item" ${dataset} class="suggestion__person">
            <img
                src="images/${profileImage}"
                alt=""
                class="suggestion__person__img"
                data-type="profile-gateway"
                data-username="${frontEndUsername}"
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

  buildSuggestion(users = [], data = [], type) {
    let dataset = '';
    if (data) dataset = this.arrangeDatasets(data);
    const html = users.map((user) => this.createPerson(user, dataset, type));
    return html.join('');
  }

  arrangeDatasets(data) {
    return data.map((data) => `data-${data.name}="${data.value}"`).join(' ');
  }

  modalHTML(topic, interest, users = [], { data = [] } = {}) {
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

  IntersectionObserver(topic, data, type) {
    this.defineSuggestionContainer();
    let options = {
      root: this.suggestionContainer,
      threshold: 0.7,
    };
    this.observer = new IntersectionObserver(
      this.observerCallback.bind(this, topic, data, type),
      options
    );
  }

  async observerCallback(topic, data, type, entries, observer) {
    for (let i = 0; i < entries.length; i++) {
      const { isIntersecting } = entries[0];
      if (!isIntersecting) break;
      const { users } = await this.suggestionHandler(topic, (this.page += 1));
      if (!users.length) return this.closeObserver();
      this.insertNewPage(users, data, type);
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
    this.suggestionNodeList = document.querySelectorAll(
      '[data-class="suggestion-item"]'
    );
    const lengthOfNodeList = this.suggestionNodeList.length;
    const targetInversePosition = 3;
    this.scrollTarget =
      this.suggestionNodeList[lengthOfNodeList - (targetInversePosition + 1)];
    this.scrollTarget && this.observer.observe(this.scrollTarget);
  }

  setScrollEvent(
    suggestionHandler,
    topic,
    { data = [], type = 'follow' } = {}
  ) {
    this.suggestionHandler = suggestionHandler;
    this.IntersectionObserver(topic, data, type);
    this.setNewObserverTarget();
  }

  insertNewPage(users, data, type, { clear = false } = {}) {
    clear ? (this.suggestionContainer.innerHTML = '') : null;
    const pageHTML = this.buildSuggestion(
      users,
      data.length ? data : undefined,
      type
    );
    this.suggestionContainer.insertAdjacentHTML('beforeend', pageHTML);
  }

  closeSuggestion() {
    this.page = 1;
    this.closeObserver();
  }

  abstractTopics(baseArray = []) {
    const topics = baseArray.map((interest) => {
      return interest.topic;
    });
    return topics;
  }

  visitProfile(id) {}
}

export default new suggestionView();
