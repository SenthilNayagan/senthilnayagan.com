const banner = document.getElementById('cookie-banner');
const acceptButton = document.getElementById('cookie-accept');
const declineButton = document.getElementById('cookie-decline');

if (banner && acceptButton && declineButton) {
  const COOKIE_NAME = 'cookiesAccepted';
  const gaId = banner.dataset.gaId;

  const getCookie = (name) => {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  };

  const setCookie = (name, value, days) => {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
  };

  // Injected only after the visitor actually accepts (or on a later visit, once the "accepted"
  // cookie is already set) — never on page load itself, which is what actually makes this consent
  // rather than just a notice.
  const loadGoogleAnalytics = () => {
    if (!gaId || document.getElementById('ga-script')) {
      return;
    }
    const script = document.createElement('script');
    script.id = 'ga-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', gaId);
  };

  const choice = getCookie(COOKIE_NAME);
  if (choice === 'true') {
    loadGoogleAnalytics();
  } else if (choice === null) {
    banner.classList.add('is-visible');
  }

  acceptButton.addEventListener('click', () => {
    setCookie(COOKIE_NAME, 'true', 365);
    banner.classList.remove('is-visible');
    loadGoogleAnalytics();
  });

  declineButton.addEventListener('click', () => {
    setCookie(COOKIE_NAME, 'false', 365);
    banner.classList.remove('is-visible');
  });
}
