/* Shared adapter installed in remote widgets by the article page's asset message. */
(() => {
  'use strict';

  if (window.parent === window) return;

  const root = document.documentElement;
  root.dataset.embedded = '';

  let widget;
  let pending = false;
  let forceReport = false;
  let lastHeight = 0;

  function scheduleMeasure(force = false) {
    forceReport = forceReport || force;
    if (!widget || pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      const force = forceReport;
      forceReport = false;
      const height = Math.ceil(widget.getBoundingClientRect().height);
      if (height <= 0) return;

      // The current article page caps iframe height at 3000px. Keep long widgets scrollable.
      root.toggleAttribute('data-embed-scroll', height > 3000);
      if (!force && height === lastHeight) return;
      lastHeight = height;
      window.parent.postMessage({ type: 'blog-embed:resize', height }, '*');
    });
  }

  window.addEventListener('message', event => {
    if (event.source !== window.parent || event.data?.type !== 'blog-embed:measure') return;

    const theme = event.data.theme;
    if ((theme === 'light' || theme === 'dark') && root.dataset.theme !== theme) {
      root.dataset.theme = theme;
      // SVG/CSS colors update automatically. Canvas widgets can redraw on this event.
      window.dispatchEvent(new CustomEvent('blog-embed:themechange', { detail: { theme } }));
    }

    root.dataset.autoHeight = '';
    scheduleMeasure(true);
  });

  function initialize() {
    widget = document.querySelector('.blog-widget');
    if (!widget) return;

    if (typeof ResizeObserver === 'function') {
      new ResizeObserver(() => scheduleMeasure()).observe(widget);
    } else {
      new MutationObserver(() => scheduleMeasure()).observe(widget, {
        subtree: true, childList: true, attributes: true, characterData: true
      });
    }

    window.addEventListener('resize', () => scheduleMeasure());
    window.addEventListener('load', () => scheduleMeasure(true), { once: true });
    document.addEventListener('load', () => scheduleMeasure(), true);
    document.fonts?.ready.then(() => scheduleMeasure());
    if (root.dataset.theme === 'light' || root.dataset.theme === 'dark') {
      window.dispatchEvent(new CustomEvent('blog-embed:themechange', {
        detail: { theme: root.dataset.theme }
      }));
    }
    scheduleMeasure(true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
