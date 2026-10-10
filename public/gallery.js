'use strict';

const topbar = document.querySelector('.topbar');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const tabs = [...document.querySelectorAll('[data-gallery-view]')];
const panels = [...document.querySelectorAll('[data-gallery-panel]')];
const lightbox = document.getElementById('photo-lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxMeta = document.getElementById('lightbox-meta');
const lightboxClose = document.querySelector('.lightbox-close');
const lightboxPrevious = document.querySelector('.lightbox-previous');
const lightboxNext = document.querySelector('.lightbox-next');
const lightboxCounter = document.getElementById('lightbox-counter');
const lightboxProgress = document.querySelector('.lightbox-progress span');
const lightboxStage = document.querySelector('.lightbox-stage');
const galleryTabs = document.querySelector('.gallery-tabs');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let activeLightboxItems = [];
let activeLightboxIndex = 0;
let lightboxChangeToken = 0;
let closeTimer;
let swipeStartX = null;

function closeNavigation() {
  if (!topbar || !navToggle) return;
  topbar.classList.remove('menu-open');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Open navigation menu');
}

function setupNavigation() {
  if (!topbar || !navToggle || !navLinks) return;

  navToggle.addEventListener('click', () => {
    const isOpen = topbar.classList.toggle('menu-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  });

  navLinks.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeNavigation));
  window.addEventListener('resize', () => {
    if (window.innerWidth > 980) closeNavigation();
  });
  window.addEventListener('scroll', () => topbar.classList.toggle('scrolled', window.scrollY > 24), { passive: true });
}

function updateTabIndicator(selectedTab) {
  if (!galleryTabs || !selectedTab) return;
  galleryTabs.style.setProperty('--active-tab-x', `${selectedTab.offsetLeft}px`);
  galleryTabs.style.setProperty('--active-tab-width', `${selectedTab.offsetWidth}px`);
}

function commitGalleryView(selectedView) {
  panels.forEach((panel) => {
    panel.hidden = panel.dataset.galleryPanel !== selectedView;
  });
}

function selectGalleryView(view, focusTab = false) {
  const selectedTab = tabs.find((tab) => tab.dataset.galleryView === view) || tabs[0];
  const selectedView = selectedTab.dataset.galleryView;
  const currentPanel = panels.find((panel) => !panel.hidden);
  const nextPanel = panels.find((panel) => panel.dataset.galleryPanel === selectedView);

  tabs.forEach((tab) => {
    const isSelected = tab === selectedTab;
    tab.classList.toggle('is-active', isSelected);
    tab.setAttribute('aria-selected', String(isSelected));
    tab.tabIndex = isSelected ? 0 : -1;
  });

  updateTabIndicator(selectedTab);

  if (currentPanel !== nextPanel && document.startViewTransition && !prefersReducedMotion.matches) {
    document.startViewTransition(() => commitGalleryView(selectedView));
  } else {
    commitGalleryView(selectedView);
    if (currentPanel !== nextPanel && nextPanel && !prefersReducedMotion.matches) {
      nextPanel.animate(
        [
          { opacity: 0, transform: 'translateY(12px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ],
        { duration: 420, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
      );
    }
  }

  if (focusTab) selectedTab.focus();
  history.replaceState(null, '', `#${selectedView}`);
}

function setupGalleryTabs() {
  if (!tabs.length || !panels.length) return;

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectGalleryView(tab.dataset.galleryView));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabs.length - 1;
      selectGalleryView(tabs[nextIndex].dataset.galleryView, true);
    });
  });

  const initialView = window.location.hash.replace('#', '');
  if (tabs.some((tab) => tab.dataset.galleryView === initialView)) selectGalleryView(initialView);
  else updateTabIndicator(tabs.find((tab) => tab.classList.contains('is-active')) || tabs[0]);

  galleryTabs?.addEventListener('scroll', () => {
    updateTabIndicator(tabs.find((tab) => tab.classList.contains('is-active')));
  }, { passive: true });
  window.addEventListener('resize', () => {
    updateTabIndicator(tabs.find((tab) => tab.classList.contains('is-active')));
  });
}

function closeLightbox() {
  if (!lightbox || lightbox.classList.contains('is-closing')) return;

  const finishClose = () => {
    if (typeof lightbox.close === 'function' && lightbox.open) lightbox.close();
    else lightbox.removeAttribute('open');
    lightbox.classList.remove('is-open', 'is-closing');
    document.body.classList.remove('lightbox-open');
    clearTimeout(closeTimer);
  };

  if (prefersReducedMotion.matches) {
    finishClose();
    return;
  }

  lightbox.classList.remove('is-open');
  lightbox.classList.add('is-closing');
  closeTimer = window.setTimeout(finishClose, 260);
}

function getLightboxItems(trigger) {
  const panel = trigger.closest('[data-gallery-panel]');
  const hero = trigger.closest('.gallery-hero-frames');
  const scope = panel || hero || document;
  return [...scope.querySelectorAll('[data-lightbox-image]')];
}

function preloadNearbyPhotos() {
  if (activeLightboxItems.length < 2) return;
  [-1, 1].forEach((offset) => {
    const index = (activeLightboxIndex + offset + activeLightboxItems.length) % activeLightboxItems.length;
    const preload = new Image();
    preload.src = activeLightboxItems[index].dataset.lightboxImage;
  });
}

function updateLightboxDetails(trigger) {
  const isRotated = trigger.dataset.lightboxRotate === '90';
  const position = activeLightboxIndex + 1;
  const total = activeLightboxItems.length;

  lightboxImage.src = trigger.dataset.lightboxImage;
  lightboxImage.alt = trigger.querySelector('img')?.alt || trigger.dataset.lightboxTitle || 'Gallery portrait';
  lightboxImage.classList.toggle('is-rotated-90', isRotated);
  lightbox.classList.toggle('has-rotated-image', isRotated);
  lightboxTitle.textContent = trigger.dataset.lightboxTitle || 'Gallery portrait';
  lightboxMeta.textContent = trigger.dataset.lightboxMeta || '';
  if (lightboxCounter) lightboxCounter.textContent = `${String(position).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
  if (lightboxProgress) lightboxProgress.style.setProperty('--lightbox-progress', `${(position / total) * 100}%`);
  const hasMultiplePhotos = total > 1;
  if (lightboxPrevious) lightboxPrevious.hidden = !hasMultiplePhotos;
  if (lightboxNext) lightboxNext.hidden = !hasMultiplePhotos;
  preloadNearbyPhotos();
}

async function showLightboxPhoto(index, direction = 1) {
  if (!activeLightboxItems.length || !lightboxStage || !lightboxImage) return;

  const nextIndex = (index + activeLightboxItems.length) % activeLightboxItems.length;
  const token = ++lightboxChangeToken;
  const distance = direction > 0 ? 28 : -28;

  if (!prefersReducedMotion.matches) {
    await lightboxStage.animate(
      [
        { opacity: 1, transform: 'translateX(0) scale(1)' },
        { opacity: 0, transform: `translateX(${-distance}px) scale(0.985)` }
      ],
      { duration: 170, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' }
    ).finished.catch(() => {});
  }

  if (token !== lightboxChangeToken) return;
  activeLightboxIndex = nextIndex;
  updateLightboxDetails(activeLightboxItems[activeLightboxIndex]);

  try {
    await lightboxImage.decode();
  } catch {
    // The browser still displays the image if decoding is unsupported or interrupted.
  }

  if (token !== lightboxChangeToken) return;
  lightboxStage.getAnimations().forEach((animation) => animation.cancel());

  if (!prefersReducedMotion.matches) {
    lightboxStage.animate(
      [
        { opacity: 0, transform: `translateX(${distance}px) scale(0.985)` },
        { opacity: 1, transform: 'translateX(0) scale(1)' }
      ],
      { duration: 300, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'both' }
    );
  }
}

function openLightbox(trigger) {
  if (!lightbox || !lightboxImage || !lightboxTitle || !lightboxMeta) return;

  activeLightboxItems = getLightboxItems(trigger);
  activeLightboxIndex = Math.max(0, activeLightboxItems.indexOf(trigger));
  updateLightboxDetails(trigger);
  document.body.classList.add('lightbox-open');
  lightbox.classList.remove('is-closing');

  if (typeof lightbox.showModal === 'function') lightbox.showModal();
  else lightbox.setAttribute('open', '');

  requestAnimationFrame(() => lightbox.classList.add('is-open'));
}

function stepLightbox(direction) {
  showLightboxPhoto(activeLightboxIndex + direction, direction);
}

function setupLightbox() {
  if (!lightbox) return;

  document.querySelectorAll('[data-lightbox-image]').forEach((trigger) => {
    trigger.addEventListener('click', () => openLightbox(trigger));
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  lightboxPrevious?.addEventListener('click', () => stepLightbox(-1));
  lightboxNext?.addEventListener('click', () => stepLightbox(1));
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  lightbox.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeLightbox();
  });
  lightbox.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') stepLightbox(-1);
    if (event.key === 'ArrowRight') stepLightbox(1);
  });
  lightbox.addEventListener('close', () => {
    document.body.classList.remove('lightbox-open');
    lightbox.classList.remove('is-open', 'is-closing');
  });

  lightboxStage?.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse') swipeStartX = event.clientX;
  });
  lightboxStage?.addEventListener('pointerup', (event) => {
    if (swipeStartX === null) return;
    const distance = event.clientX - swipeStartX;
    swipeStartX = null;
    if (Math.abs(distance) > 48) stepLightbox(distance < 0 ? 1 : -1);
  });
  lightboxStage?.addEventListener('pointercancel', () => { swipeStartX = null; });
}

function setupScrollReveals() {
  const targets = [...document.querySelectorAll(
    '.photo-card, .place-feature, .timeline-intro, .photo-timeline > li, .map-layout, .gallery-note'
  )];

  if (!targets.length || prefersReducedMotion.matches || !('IntersectionObserver' in window)) {
    targets.forEach((target) => target.classList.add('is-revealed'));
    return;
  }

  document.documentElement.classList.add('gallery-motion-ready');
  targets.forEach((target, index) => {
    target.classList.add('gallery-reveal');
    target.style.setProperty('--reveal-delay', `${(index % 4) * 55}ms`);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -7% 0px', threshold: 0.08 });

  targets.forEach((target) => observer.observe(target));
}

setupNavigation();
setupGalleryTabs();
setupLightbox();
setupScrollReveals();
