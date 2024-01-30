class suggestionView {
  constructor() {
    this.page = 1;
  }

  defineSuggestionContainer() {
    this.suggestionContainer = document.querySelector('#suggestion-container');
    return this.suggestionContainer;
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

  createProfile(user, isFollowed, isInContact) {
    const {
      _id,
      name,
      frontEndUsername: username,
      profileImage,
      profileCoverImage,
      numberOfFollowing,
      numberOfFollowers,
    } = user;
    return `
        <div class="profile__images">
          <img class="profile__images__cover" src="${
            profileCoverImage
              ? `/images/${profileCoverImage}`
              : '/Imgs/users/mars-spacex-starship-wallpapers.jpg'
          }" alt="">
          <img class="profile__images__profile" src="/images/${profileImage}" alt="">
          <div id="social-action-btns" class="profile__social-actions">
            ${
              isInContact
                ? ''
                : `
            <button
              type="button"
              data-profile-image="${profileImage}"
              data-name="${name}"
              data-username="${username}"
              data-type="contact-request"
              data-value="action-btn"
              data-user-id="${_id}"
              class="suggestion__btn-main profile__social-actions__btn"
            >
              Contact Request
            </button>`
            }
            <button
              type="button"
              data-profile-image="${profileImage}"
              data-name="${name}"
              data-username="${username}"
              data-user-id="${_id}"
              data-value="action-btn"
              data-type="follow"
              class="suggestion__btn-main profile__social-actions__btn ${
                isFollowed ? 'active' : ''
              }"
            >
              ${isFollowed ? 'following' : 'follow'}
            </button>
          </div>
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
        </div>`;
  }

  createPerson(user, dataset = '', type = 'follow') {
    const {
      _id,
      name,
      profileImage,
      frontEndUsername: username,
      isFollowed,
      isInContact,
    } = user;
    return `
        <div id="suggestion-item-${_id}" data-class="suggestion-item" ${dataset} class="suggestion__person">
            <img
                src="images/${profileImage}"
                alt=""
                class="suggestion__person__img"
                data-type="profile-gateway"
                data-username="${username}"
                data-user-id="${_id}"
                data-is-followed="${isFollowed}" 
                data-is-in-contact="${isInContact}"
            />
            <div class="suggestion__person__details">
                <div>
                <div class="suggestion__person__name">${name}</div>
                <div class="suggestion__person__username">@${username}</div>
                </div>
                <button
                type="button"
                data-value="action-btn"
                ${dataset}
                data-type="${type}"
                data-profile-image="${profileImage}"
                data-name="${name}"
                data-username="${username}"
                data-user-id="${_id}"
                class="suggestion__btn-main"
                >
                ${type}
                </button>
            </div>
        </div>`;
  }

  contactRequestModalHTML(name, username, profileImage, userID) {
    return `
    <form class="app-form contact-request__modal" data-user-id="${userID}">
      <div class="contact-request__details">
        <img src="/images/${profileImage}" class="contact-request__img person__img person__img--me" alt="profile image of ${name}">
        <div class="contact-request__identities">
          <div>
            <span class="suggestion__person__name">${name}</span>
            <span class="suggestion__person__username">@<span>${username}</span></span>
          </div>
          <div class="contact-request__type-tag">contact request</div>
        </div>
      </div>
      <textarea id="contact-request-message" class="contact-request__textarea" placeholder="Optional message..."></textarea>
      <div class="contact-request__characters-note">max 250 characters</div>
      <input id="contact-request-submit-btn" type="submit" value="Send">
    </form>`;
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
}

export default new suggestionView();
