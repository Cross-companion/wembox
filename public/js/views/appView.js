class AppView {
  constructor() {
    this.appNav = document.querySelector('#app-nav');
    this.appHeader = document.querySelector('#app-header');
    this.watchAppHeader();
  }

  watchAppHeader() {
    const handleNavPosition = (entries) => {
      this.appNav.classList.toggle('fixed');
      //   for (let i = 0; i < entries.length; i++) {
      //     const entry = entries[i];
      //     const appNav = document.querySelector('#app-nav');
      //     appNav.classList.add('fixed');
      //   }
      console.log('fixed');
    };

    let options = {
      root: null,
      threshold: 0.1,
    };

    const observer = new IntersectionObserver(handleNavPosition, options);
    observer.observe(this.appHeader);
  }
}

export default new AppView();
