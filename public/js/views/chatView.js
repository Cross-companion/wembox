import Icons from '../utils/Icons.js';

class ChatView {
  constructor() {
    this.preLoad = `
      <div class="chat__container--pre-load" data-type="chat-preload">
        <img src="./../Imgs/logos/DALL-E/wembee-logo-v1.jpg" alt="" />
        <div class="logo">
          <span class="logo__text logo__text--burn">Wembox</span>
          <span>inc.</span>
        </div>
      </div>`;
  }

  removePreload() {
    const preLoad = document.querySelector('[data-type="chat-preload"]');
    preLoad?.remove();
  }

  chatTemplate({ name, profileImage }) {
    console.log(name);
    return `
      <section class="chat__container__header">
        <div data-type="profile">
          <img src="images/${profileImage}" alt="" />
          <div data-type="details">
            <p data-type="name">${name}</p>
            <p class="active" data-type="online-status">Online</p>
          </div>
        </div>
      </section>
      <section class="chat__container__content"></section>
      <section class="chat__container__inputs">
        <form>
          <div>
            <input type="file" data-type="chat-preview-input" />
            ${Icons({
              type: 'add-image',
              dataStrings: 'data-type="add-image-icon"',
            })}
          </div>
          <textarea name="" id="" cols="30" rows="10"></textarea>
          <div>
          ${Icons({
            type: 'send-chat',
            dataStrings: 'data-type="send-chat-icon"',
          })}
          </div>
        </form>
      </section>
      `;
  }
}

export default new ChatView();
