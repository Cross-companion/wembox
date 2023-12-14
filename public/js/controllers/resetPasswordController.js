import { Gradient } from './Gradient.js';

class resetPasswordController {
  constructor() {
    this.gradient();
  }

  gradient(canvas = '#gradient-canvas') {
    const gradient = new Gradient();
    gradient.initGradient(canvas);
  }
}

export default new resetPasswordController();
