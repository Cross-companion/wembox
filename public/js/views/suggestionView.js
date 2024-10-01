class suggestionView {
  constructor() {
    this.page = 1;
  }

  defineSuggestionContainer() {
    this.suggestionContainer = document.querySelector('#suggestion-container');
    return this.suggestionContainer;
  }

  defineExploreBtn() {
    this.exploreBtn = document.querySelector('[data-type="explore-btn"]');
    return this.exploreBtn;
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

  createProfile(user, isMe) {
    const {
      _id,
      name,
      frontEndUsername: username,
      profileImage,
      profileCoverImage,
      numberOfFollowing,
      numberOfFollowers,
      isFollowed,
      isInContact,
      note,
    } = user;

    isMe &&
      this.setPublicUserData({
        name,
        username,
        profileImage,
        profileCoverImage,
        note,
      });

    return `
        <div class="profile__images">
          <img class="profile__images__cover" src="${
            profileCoverImage
              ? `${profileCoverImage}`
              : '/Imgs/users/mars-spacex-starship-wallpapers.jpg'
          }" alt="">
          <img class="profile__images__profile" src="${profileImage}" alt="">
          <div id="social-action-btns" class="profile__social-actions">
            ${
              isMe
                ? `
            <button
              type="button"
              data-type="profile-edit"
              class="suggestion__btn-main profile__social-actions__btn profile__social-actions__btn--edit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                <path
                  d="M480-240Zm-320 40v-72q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q37 0 73 4.5t72 14.5l-67 68q-20-3-39-5t-39-2q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32h240v80H200q-17 0-28.5-11.5T160-200Zm400 40v-50q0-16 6.5-30.5T584-266l197-197q9-9 20-13t22-4q12 0 23 4.5t20 13.5l37 37q8 9 12.5 20t4.5 22q0 11-4 22.5T903-340L706-143q-11 11-25.5 17t-30.5 6h-50q-17 0-28.5-11.5T560-160Zm300-223-37-37 37 37ZM620-180h38l121-122-18-19-19-18-122 121v38Zm141-141-19-18 37 37-18-19ZM480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm0-80q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Z"
                />
              </svg>
              <span>Edit</span>
            </button>`
                : `${
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
            </button>`
            }
          </div>
        </div>
        <div class="profile__details">
          <div class="profile__details__identity">
            <div class="profile__details__name">${name}</div>
            <div class="profile__details__username"><span>@</span>${username}</div>
          </div>
          <div class="profile__details__note">${
            note ||
            (!isMe
              ? 'Hi, I am active on wembox inc.' // An '!' at the end might be more interactive.
              : 'Change Dummy text  "Hi, I am active on wembox inc." by clicking on edit to customize your profile!.')
          }</div>
          <div class="profile__details__following">
            <div><span>${numberOfFollowers}</span> followers</div>
            <div><span>${numberOfFollowing}</span> following</div>
          </div>
          ${
            isMe
              ? '<span data-type="profile-logout" class="profile__logout">Log out</span>'
              : ''
          }
        </div>`;
  }

  createPerson(user, dataset = '', type = 'follow') {
    const { _id, name, profileImage, frontEndUsername: username } = user;
    return `
        <div id="suggestion-item-${_id}" data-class="suggestion-item" ${dataset} class="suggestion__person">
            <img
                src="${profileImage}"
                alt=""
                class="suggestion__person__img"
                data-type="profile-gateway"
                data-username="${username}"
                data-user-id="${_id}"
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
        <img src="${profileImage}" class="contact-request__img person__img person__img--me" alt="profile image of ${name}">
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

  setPublicUserData(
    publicData = { username, name, profileImage, profileCoverImage, note }
  ) {
    const { username, name, profileImage, profileCoverImage, note } =
      publicData;
    this.PUBLIC_USER_DATA = {
      username,
      name,
      profileImage,
      profileCoverImage,
      note,
    };
    return this.PUBLIC_USER_DATA;
  }

  setProfileImagePreview(input) {
    if (!(input.files && input.files[0])) return;
    const container = input.closest('[data-type="previewer"]');
    const imagePreview = container.querySelector('[data-type="preview"]');
    const imageUrl = URL.createObjectURL(input.files[0]);
    imagePreview.src = imageUrl;
  }

  updateMyProfiles(newUrl = this.PUBLIC_USER_DATA) {
    const myProfiles = document.querySelectorAll(
      '[data-value="my-profile-gateway"]'
    );
    myProfiles?.forEach((img) => (img.src = `${newUrl}`));
  }
}

export default new suggestionView();
