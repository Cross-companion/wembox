const recaptcha = document.querySelector('#recaptcha');

recaptcha.addEventListener('submit', async (e) => {
  e.preventDefault();

  const captcha = document.getElementById('g-recaptcha-response').value;

  const verified = await fetch('/api/v1/users/captcha', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({ captcha, email: 'volunteer102@wm.com' }),
  }).then((res) => res.json());

  console.log(verified);
});
