class Modal {
  constructor() {}
  modalTemplate(modalContent, modifierClass) {
    return `
    <section id="app-modal" class="app-modal">
      <div id="app-modal-overlay" class="app-modal__overlay"></div>
      <div
        class="app-modal__modal glassmorph ${modifierClass}"
      >
      ${modalContent}
      </div>
    </section>`;
  }

  showModal(modalContent, modifierClass) {
    const modalHTML = this.modalTemplate(modalContent, modifierClass);
    const pageBody = document.querySelector('body');
    pageBody.insertAdjacentHTML('afterbegin', modalHTML);
    this.appModal = document.querySelector('#app-modal');
    this.overlay = document.querySelector('#app-modal-overlay');
    this.listenForClose();

    return this.appModal;
  }

  overlayHandler() {
    this.closeModal();
  }
  documentHandler(e) {
    const { key } = e;
    if (key !== 'Escape') return;
    document.removeEventListener('keydown', this.documentHandler.bind(this));
    this.closeModal();
  }

  listenForClose() {
    this.handlers = [
      this.overlayHandler.bind(this),
      this.documentHandler.bind(this),
    ];
    this.overlay.addEventListener('click', this.handlers[0]);
    document.addEventListener('keydown', this.handlers[1]);
  }

  closeModal() {
    this.overlay.removeEventListener('click', this.handlers[0]);
    document.removeEventListener('keydown', this.handlers[1]);
    this.appModal.remove();
  }
}

export default new Modal();
