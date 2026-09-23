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

function selectGalleryView(view, focusTab = false) {
  const selectedTab = tabs.find((tab) => tab.dataset.galleryView === view) || tabs[0];
  const selectedView = selectedTab.dataset.galleryView;

  tabs.forEach((tab) => {
    const isSelected = tab === selectedTab;
    tab.classList.toggle('is-active', isSelected);
    tab.setAttribute('aria-selected', String(isSelected));
    tab.tabIndex = isSelected ? 0 : -1;
  });

  panels.forEach((panel) => {
    panel.hidden = panel.dataset.galleryPanel !== selectedView;
  });

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
}

function closeLightbox() {
  if (!lightbox) return;
  if (typeof lightbox.close === 'function' && lightbox.open) lightbox.close();
  else lightbox.removeAttribute('open');
  document.body.classList.remove('lightbox-open');
}

function openLightbox(trigger) {
  if (!lightbox || !lightboxImage || !lightboxTitle || !lightboxMeta) return;

  const isRotated = trigger.dataset.lightboxRotate === '90';

  lightboxImage.src = trigger.dataset.lightboxImage;
  lightboxImage.alt = trigger.querySelector('img')?.alt || trigger.dataset.lightboxTitle || 'Gallery portrait';
  lightboxImage.classList.toggle('is-rotated-90', isRotated);
  lightbox.classList.toggle('has-rotated-image', isRotated);
  lightboxTitle.textContent = trigger.dataset.lightboxTitle || 'Gallery portrait';
  lightboxMeta.textContent = trigger.dataset.lightboxMeta || '';
  document.body.classList.add('lightbox-open');

  if (typeof lightbox.showModal === 'function') lightbox.showModal();
  else lightbox.setAttribute('open', '');
}

function setupLightbox() {
  if (!lightbox) return;

  document.querySelectorAll('[data-lightbox-image]').forEach((trigger) => {
    trigger.addEventListener('click', () => openLightbox(trigger));
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  lightbox.addEventListener('close', () => document.body.classList.remove('lightbox-open'));
}

setupNavigation();
setupGalleryTabs();
setupLightbox();
