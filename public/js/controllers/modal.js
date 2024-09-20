class Modal {
  constructor() {
    this.defaultContent =
      '<div class="app-modal__loader app-modal__loader--modal"></div>';
  }
  modalTemplate(modifierClass, { topLevel = false } = {}) {
    return `
    <section id="app-modal" class="app-modal">
      <div id="app-modal-overlay" class="app-modal__overlay"></div>
      <div id="app-modal-content-parent-container" data-type="app-modal-content-parent-container" class="app-modal__container">
        <div
          id="app-modal-content-container" class="app-modal__modal glassmorph ${modifierClass}"
        >
        ${this.defaultContent}
        </div>
      </div>
    </section>`;
  }

  createModalOptions(
    options = [
      {
        prompt: 'test',
        action: 'Test me!',
        url: 'testurl',
      },
    ]
  ) {
    if (!options?.length) return;
    return `
    <div data-type="modal-options" class="app-modal--options glassmorph">
      ${options.map((option) => {
        return `<div data-type="modal-option-item">
            <span>${option.prompt}</span>
            <span>
              <span data-type="modal-option-item-cancel">cancel</span>
              <a href="${option.url}">${option.action}</a>
            </span>
          </div>`;
      })}
    </div>`;
  }

  insertContent(modalContent) {
    this.contentContainer.innerHTML = modalContent;
    return { contentContainer: this.contentContainer };
  }

  modalIsOpen() {
    const isOpen = document.querySelector('#app-modal') ? true : false;
    return isOpen;
  }

  showModal(
    modifierClass,
    onCloseEvents = [
      {
        event: () => {},
        args: [''],
      },
    ]
  ) {
    if (this.modalIsOpen()) this.closeModal(onCloseEvents);
    const modalHTML = this.modalTemplate(modifierClass);
    const pageBody = document.querySelector('body');
    pageBody.insertAdjacentHTML('afterbegin', modalHTML);
    this.appModal = document.querySelector('#app-modal');
    this.overlay = document.querySelector('#app-modal-overlay');
    this.contentContainer = document.querySelector(
      '#app-modal-content-container'
    );
    this._listenForClose(onCloseEvents);

    return this;
  }

  _overlayHandler(onCloseEvents) {
    this.closeModal(onCloseEvents);
  }

  _documentHandler(onCloseEvents, e) {
    const { key } = e;
    if (key !== 'Escape') return;
    document.removeEventListener('keydown', this._documentHandler.bind(this));
    this.closeModal(onCloseEvents);
  }

  _listenForClose(onCloseEvents) {
    this.handlers = [
      this._overlayHandler.bind(this, onCloseEvents),
      this._documentHandler.bind(this, onCloseEvents),
    ];
    this.overlay.addEventListener('click', this.handlers[0]);
    document.addEventListener('keydown', this.handlers[1]);
  }

  closeModal(onCloseEvents) {
    onCloseEvents?.length &&
      onCloseEvents.forEach((event) => event.event(...event.args));
    this.overlay.removeEventListener('click', this.handlers[0]);
    document.removeEventListener('keydown', this.handlers[1]);
    this.appModal.remove();
  }

  replaceContentContainer(
    newContent = '',
    newContentId = '#app-modal-content-parent-container'
  ) {
    if (!this.modalIsOpen()) return;
    this.setContentContainer();
    this.contentContainer?.remove();
    this.appModal.insertAdjacentHTML('beforeend', newContent);
    this.contentContainer = document.querySelector(newContentId);
  }

  setContentContainer(elementId = '#app-modal-content-parent-container') {
    this.contentContainer = document.querySelector(elementId);
  }

  setToDefault() {
    if (!this.modalIsOpen()) return;
    this.setContentContainer();
    this.contentContainer.innerHTML = this.defaultContent;
  }

  closeModalOptions() {
    const options = document.querySelector('[data-type="modal-options"]');
    if (!options) return;
    options.remove();
  }

  insertModalOptions(
    options = [
      {
        prompt: 'test',
        action: 'Test me!',
        url: 'testurl',
      },
    ]
  ) {
    if (!this.modalIsOpen()) return;
    this.closeModalOptions();

    const optionsParentContainer = document
      .querySelector('#app-modal')
      .querySelector('[data-type="app-modal-content-parent-container"]');
    const html = this.createModalOptions(options);
    optionsParentContainer.insertAdjacentHTML('beforeend', html);
  }

  profileContentContainer(profile) {
    return `
      <div id="app-modal-content-parent-container" data-type="app-modal-content-parent-container" class="app-modal__container">
        <div
          id="app-modal-content-container" class="app-modal__modal glassmorph app-modal__modal--no-padding profile"
        >
        ${profile}
        </div>
      </div>`;
  }
}

export default new Modal();
