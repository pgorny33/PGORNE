document.addEventListener('submit', async (event) => {
  const form = event.target.closest('form.newsletter');
  if (!form) return;

  event.preventDefault();

  const email = form.querySelector('input[type="email"]');
  const status = form.querySelector('.newsletter-status');
  const button = form.querySelector('button[type="submit"]');

  if (!email.checkValidity()) {
    status.textContent = 'Please enter a valid email address.';
    email.focus();
    return;
  }

  if (form.elements.namedItem('website').value) {
    form.classList.add('is-done');
    status.textContent = 'Thank you. Please check your inbox to confirm.';
    return;
  }

  const formId = form.dataset.kitForm;
  if (!formId) {
    status.textContent = "Thank you. (Preview: sign-ups aren't saved yet.)";
    return;
  }

  button.disabled = true;
  try {
    const response = await fetch(`https://app.kit.com/forms/${formId}/subscriptions`, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.status !== 'success') throw new Error('Newsletter subscription failed');
    form.classList.add('is-done');
    status.textContent = 'Thank you. Please check your inbox to confirm.';
  } catch {
    status.textContent = 'Something went wrong. Please try again.';
    button.disabled = false;
  }
});
