import React, { useEffect, useRef } from 'react';

const SCRIPT_ID = 'cloudflare-turnstile-script';

const loadTurnstile = () => new Promise((resolve, reject) => {
  if (window.turnstile) return resolve(window.turnstile);

  const existing = document.getElementById(SCRIPT_ID);
  if (existing) {
    existing.addEventListener('load', () => resolve(window.turnstile), { once: true });
    existing.addEventListener('error', reject, { once: true });
    return;
  }

  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
  script.async = true;
  script.defer = true;
  script.onload = () => resolve(window.turnstile);
  script.onerror = reject;
  document.head.appendChild(script);
});

const TurnstileWidget = ({ action, onVerify, resetKey = 0 }) => {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey) {
      if (import.meta.env.DEV) onVerify('development-bypass');
      return undefined;
    }

    let mounted = true;
    loadTurnstile().then((turnstile) => {
      if (!mounted || !containerRef.current) return;
      widgetIdRef.current = turnstile.render(containerRef.current, {
        sitekey: siteKey,
        action,
        theme: 'light',
        size: 'flexible',
        callback: onVerify,
        'expired-callback': () => onVerify(''),
        'error-callback': () => onVerify('')
      });
    }).catch(() => onVerify(''));

    return () => {
      mounted = false;
      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, [action, onVerify, resetKey, siteKey]);

  if (!siteKey && import.meta.env.DEV) {
    return <p className="text-center text-xs text-slate-400">Security check uses development mode locally.</p>;
  }

  return <div ref={containerRef} className="min-h-[65px] w-full overflow-hidden" />;
};

export default TurnstileWidget;
