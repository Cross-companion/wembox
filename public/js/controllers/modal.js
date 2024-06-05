class Modal {
  constructor() {
    this.defaultContent =
      '<div class="app-modal__loader app-modal__loader--modal"></div>';
  }
  modalTemplate(modifierClass, { topLevel = false } = {}) {
    return `
    <section id="app-modal" class="app-modal">
      <div id="app-modal-overlay" class="app-modal__overlay"></div>
      <div
        id="app-modal-content-container" class="app-modal__modal glassmorph ${modifierClass}"
      >
      ${this.defaultContent}
      </div>
    </section>`;
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
    newContentId = '#app-modal-content-container'
  ) {
    if (!this.modalIsOpen()) return;
    this.setContentContainer();
    this.contentContainer?.remove();
    this.appModal.insertAdjacentHTML('beforeend', newContent);
    this.contentContainer = document.querySelector(newContentId);
  }

  setContentContainer(elementId = '#app-modal-content-container') {
    this.contentContainer = document.querySelector(elementId);
  }

  setToDefault() {
    if (!this.modalIsOpen()) return;
    this.setContentContainer();
    this.contentContainer.innerHTML = this.defaultContent;
  }
}

export default new Modal();
