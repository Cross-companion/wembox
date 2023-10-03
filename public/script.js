const recaptcha = document.querySelector('#recaptcha');

recaptcha.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const captcha = document.getElementById('g-recaptcha-response').value;
  if (!email || !captcha) return;

  const verified = await fetch('/api/v1/users/captcha', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({ captcha, email }),
  }).then((res) => res.json());

  console.log(verified);
});
