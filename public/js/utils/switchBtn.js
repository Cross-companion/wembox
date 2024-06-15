class SwitchBtn {
  constructor(container) {
    if (!container) throw new Error('Invalid switch button container.');
    this.container = container;
    this.btns = [...container.querySelectorAll('[data-value="switch-btn"]')];
    this.setActiveBtn();
  }

  setActiveBtn() {
    this.btns.forEach((btn, i) => {
      if (![...btn.classList].includes('active')) return;
      this.activeBtn = btn;
      this.activeBtnIndex = i;
    });
  }

  switch({ outClasses = [] } = {}) {
    const newActiveBtnIndex =
      this.activeBtnIndex + 1 < this.btns.length ? this.activeBtnIndex + 1 : 0;
    [...outClasses, 'active'].forEach((className) => {
      this.activeBtn.classList.toggle(className);
      this.btns[newActiveBtnIndex].classList.toggle(className);
    });
    const prevPageType = this.activeBtn.dataset?.type;
    this.setActiveBtn();
    return prevPageType;
  }
}

export default SwitchBtn;
