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

  showModal(modifierClass) {
    if (document.querySelector('#app-modal')) return;
    const modalHTML = this.modalTemplate(modifierClass);
    const pageBody = document.querySelector('body');
    pageBody.insertAdjacentHTML('afterbegin', modalHTML);
    this.appModal = document.querySelector('#app-modal');
    this.overlay = document.querySelector('#app-modal-overlay');
    this.contentContainer = document.querySelector(
      '#app-modal-content-container'
    );
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
