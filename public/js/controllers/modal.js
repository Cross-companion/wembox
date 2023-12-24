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
  }

  overlayHandler() {
    this.closeModal();
  }
  documentHandler(e) {
    const { key } = e;
    console.log(key);
    if (key !== 'Escape') return;
    document.removeEventListener('keydown', this.documentHandler.bind(this));
    this.closeModal();
  }

  listenForClose() {
    this.handles = [
      this.overlayHandler.bind(this),
      this.documentHandler.bind(this),
    ];
    this.overlay.addEventListener('click', this.handles[0]);
    document.addEventListener('keydown', this.handles[1]);
  }

  closeModal() {
    this.overlay.removeEventListener('click', this.handles[0]);
    document.removeEventListener('keydown', this.handles[1]);
    this.appModal.remove();
  }
}

export default new Modal();
