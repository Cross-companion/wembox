class suggestionView {
  createPerson(user, type = 'follow') {
    const { _id, name, profileImage, frontEndUsername } = user;
    return `
        <div class="suggestion__person">
            <img
                src="${profileImage}"
                alt=""
                class="suggestion__person__img"
            />
            <div class="suggestion__person__details">
                <div>
                <div class="suggestion__person__name">${name}</div>
                <div class="suggestion__person__username">@${frontEndUsername}</div>
                </div>
                <button
                type="button"
                data-value="action-btn"
                data-type="${type}"
                data-user-id="${_id}"
                class="suggestion__btn-main"
                >
                ${type}
                </button>
            </div>
        </div>`;
  }

  buildSuggestion(users = []) {
    const html = users.map((user) => this.createPerson(user));
    return html.join('');
  }

  modalHTML(topic, users = []) {
    return `
    <div class="suggestion__topic-heading">
      <span class="suggestion__topic-heading__text">
        ${topic}
      </span>
    </div>
    <div class="suggestion__container">
        ${this.buildSuggestion(users)}      
    </div>`;
  }
}

export default new suggestionView();
