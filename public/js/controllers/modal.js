class Modal {
  constructor() {}
  modalTemplate(modifierClass) {
    return `
    <section id="app-modal" class="app-modal">
      <div id="app-modal-overlay" class="app-modal__overlay"></div>
      <div
        id="app-modal-content-container" class="app-modal__modal glassmorph ${modifierClass}"
      >
      <div style="margin: 1rem 0.7rem; border-radius: 5px ">Loading....</div>
      </div>
    </section>`;
  }

  insertContent(modalContent) {
    this.contentContainer.innerHTML = modalContent;
  }

  showModal(
    modifierClass,
    onCloseEvents = [{ event: console.log, args: [''] }]
  ) {
    if (document.querySelector('#app-modal')) return;
    const modalHTML = this.modalTemplate(modifierClass);
    const pageBody = document.querySelector('body');
    pageBody.insertAdjacentHTML('afterbegin', modalHTML);
    this.appModal = document.querySelector('#app-modal');
    this.overlay = document.querySelector('#app-modal-overlay');
    this.contentContainer = document.querySelector(
      '#app-modal-content-container'
    );
    this.listenForClose(onCloseEvents);

    return this.appModal;
  }

  overlayHandler(onCloseEvents) {
    this.closeModal(onCloseEvents);
  }
  documentHandler(onCloseEvents, e) {
    const { key } = e;
    if (key !== 'Escape') return;
    document.removeEventListener('keydown', this.documentHandler.bind(this));
    this.closeModal(onCloseEvents);
  }

  listenForClose(onCloseEvents) {
    this.handlers = [
      this.overlayHandler.bind(this, onCloseEvents),
      this.documentHandler.bind(this, onCloseEvents),
    ];
    this.overlay.addEventListener('click', this.handlers[0]);
    document.addEventListener('keydown', this.handlers[1]);
  }

  closeModal(onCloseEvents) {
    onCloseEvents.forEach((event) => event.event(...event.args));
    this.overlay.removeEventListener('click', this.handlers[0]);
    document.removeEventListener('keydown', this.handlers[1]);
    this.appModal.remove();
  }
}

export default new Modal();
