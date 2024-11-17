export function formify(dataObject) {
  const form = new FormData();
  Object.keys(dataObject).forEach((key) => {
    form.append(key, dataObject[key]);
  });
  return form;
}

export function sendMessageToSW(message = { action: '', payload: {} }) {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(message);
  } else {
    console.error('No active service worker to send message to.');
  }
}
