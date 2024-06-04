export function formify(dataObject) {
  const form = new FormData();
  Object.keys(dataObject).forEach((key) => {
    form.append(key, dataObject[key]);
  });
  return form;
}
