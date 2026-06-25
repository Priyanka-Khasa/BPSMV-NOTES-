import { useEffect, useRef } from 'react';

export function useScrollAnimation(selector = '.scroll-reveal') {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current || document;
    const elements = container.querySelectorAll(selector);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [selector]);

  return containerRef;
}

export default useScrollAnimation;
