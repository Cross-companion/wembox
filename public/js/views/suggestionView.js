class suggestionView {
  createPerson(user, dataset = '', type = 'follow') {
    const { _id, name, profileImage, frontEndUsername } = user;
    return `
        <div class="suggestion__person">
            <img
                src="images/${profileImage}"
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

  buildSuggestion(users = [], data) {
    let dataset = '';
    if (data) dataset = this.arrangeDatasets(data);
    const html = users.map((user) => this.createPerson(user, dataset));
    return html.join('');
  }

  arrangeDatasets(data) {
    return data.map((data) => `data-${data.name}="${data.value}"`).join(' ');
  }

  modalHTML(
    topic,
    users = [],
    { data = [{ name: 'topic', value: `${topic}` }] } = {}
  ) {
    console.log(data);
    return `
    <div class="suggestion__topic-heading">
      <span class="suggestion__topic-heading__text">
        ${topic}
      </span>
    </div>
    <div class="suggestion__container">
        ${
          this.buildSuggestion(users, data) ||
          `<span style="grid-column: span 2; grid-row: span 2">No account to follow under ${topic}.<br/>You are the first 😃🎉</span>`
        }      
    </div>`;
  }
}

export default new suggestionView();
