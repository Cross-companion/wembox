// import {} from './socket.io.js';

class Socket {
  constructor() {
    if (!io) throw new Error('Unable to create a client Socket');
    this.socket = io();
  }

  socketListeners(
    handles = [{ event: 'connection', func: () => console.log('connected') }]
  ) {
    handles.forEach((handle) =>
      this.socket.on(handle?.event, (...args) => handle?.func(...args))
    );
  }

  emit(event, arg) {
    this.socket.emit(event, arg);
  }
}

export default new Socket();
