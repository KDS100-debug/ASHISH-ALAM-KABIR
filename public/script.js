const projectList = document.getElementById('project-list');
const topbar = document.querySelector('.topbar');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const googleCertToggle = document.querySelector('.google-cert-toggle');
const googleCertList = document.querySelector('.google-cert-collapse');
const udemyCertToggle = document.querySelector('.udemy-cert-toggle');
const udemyCertList = document.querySelector('.udemy-cert-collapse');
const linkedinCertToggle = document.querySelector('.linkedin-cert-toggle');
const linkedinCertList = document.querySelector('.linkedin-cert-collapse');
const linkedinCertGrid = document.getElementById('linkedin-cert-grid');
const be10xCertToggle = document.querySelector('.be10x-cert-toggle');
const be10xCertList = document.querySelector('.be10x-cert-collapse');
const data = portfolioData;
const resumePreviewTrigger = document.getElementById('resume-preview-trigger');
const resumeModal = document.getElementById('resume-modal');
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
const CONTACT_FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwRkqy8ycDhNvnHynvNd1YEB7vJrXqI99m6FiDYtldlR6Cckx-G4wjwF8k8G5PfxiBT/exec';

function setupProfileVideo() {
  const video = document.querySelector('.profile-card .bg-video');
  if (!video) return;

  video.load();
  video.play().catch(() => {});
}

function renderProjects() {
  if (!projectList || !data?.featuredProjects) return;
  const projectIcons = {
    'Data Analytics': 'bi-bar-chart-line-fill',
    'Business Intelligence': 'bi-pie-chart-fill',
    'SQL Analytics': 'bi-database-fill',
    'Web Application': 'bi-window-stack',
    'Machine Learning': 'bi-cpu-fill',
    'Full-Stack': 'bi-braces-asterisk',
  };
  const tagIcons = {
    Python: 'https://cdn.simpleicons.org/python',
    Pandas: 'https://cdn.simpleicons.org/pandas',
    Visualization: 'https://cdn.simpleicons.org/chartdotjs',
    SQL: 'bi-database-fill',
    'Power BI': 'https://cdn.simpleicons.org/powerbi',
    Excel: 'https://cdn.simpleicons.org/microsoftexcel',
    Dashboard: 'bi-speedometer2',
    Analytics: 'bi-graph-up-arrow',
    Reporting: 'bi-file-earmark-bar-graph-fill',
    Flask: 'bi-flask-fill',
    'Web App': 'bi-window-stack',
    'User Experience': 'bi-person-check-fill',
    XGBoost: 'bi-lightning-charge-fill',
    'Random Forest': 'bi-diagram-3-fill',
    Forecasting: 'bi-graph-up',
    'Time Series': 'bi-clock-history',
    HTML: 'bi-filetype-html',
    CSS: 'bi-filetype-css',
    Content: 'bi-file-text-fill',
  };

  projectList.innerHTML = data.featuredProjects
    .map((project, index) => {
      const icon = projectIcons[project.category] || 'bi-grid-1x2-fill';
      return `
      <article class="project-card${index === 0 ? ' project-card-featured' : ''}" data-delay="${index % 3}">
        <div class="project-card-topline">
          <span class="project-icon" aria-hidden="true"><i class="bi ${icon}"></i></span>
          <span class="project-meta">${project.category}</span>
        </div>
        <div class="project-card-content">
          <h3>${project.title}</h3>
          <p>${project.description}</p>
        </div>
        <div class="project-tags" aria-label="Technologies used">
          ${project.tags.map(tag => {
            const tagIcon = tagIcons[tag] || 'bi-circle-fill';
            const iconMarkup = tagIcon.startsWith('https://')
              ? `<img src="${tagIcon}" alt="" aria-hidden="true" />`
              : `<i class="bi ${tagIcon}" aria-hidden="true"></i>`;
            return `<span>${iconMarkup}${tag}</span>`;
          }).join('')}
        </div>
        <div class="project-card-footer">
          <span class="project-type"><i class="bi bi-github" aria-hidden="true"></i> Open source work</span>
          <div class="project-card-actions">
            <button class="project-ai-trigger" type="button" data-ai-project="${project.title}">Ask AI</button>
            <a href="${project.repo}" target="_blank" rel="noreferrer">View Repository <i class="bi bi-arrow-up-right" aria-hidden="true"></i></a>
          </div>
        </div>
      </article>
    `;
    })
    .join('');
}

function updateLinkedInCard() {
  const metrics = document.querySelectorAll('.profile-metrics div');
  if (!metrics.length) return;
  metrics[0].querySelector('span').textContent = data.linkedIn.followers;
  metrics[1].querySelector('span').textContent = data.linkedIn.connections;
}

function updateScrollState() {
  if (!topbar) return;
  const scrollY = window.scrollY;
  topbar.classList.toggle('scrolled', scrollY > 24);
}

function renderLinkedInCertificates() {
  if (!linkedinCertGrid || !data?.linkedInCertificates) return;

  const titleOverrides = {
    'Basics of Data Visualization Analysis': 'Data Visualization Analysis',
    'Career Essentials in Generative AI by Microsoft and LinkedIn': 'Generative AI',
    'Ethics in the Age of Generative AI': 'Ethics in the Age of Generative AI',
    'Generative AI The Evolution of Thoughtful Online Search': 'Generative AI Evolution',
    'Introduction to Artificial Intelligence 2023': 'Introduction to Artificial Intelligence 2023',
    'Introduction to Career Skills in Data Analytics 2022': 'Data Analytics',
    'Learning Data Analytics Part 2 Extending and Applying Core Knowledge': 'Data Analytics Foundations 2',
    'Learning Microsoft 365 Copilot December 2023': 'Microsoft 365 Copilot',
    'Learning Microsoft 365': 'Microsoft 365',
    'Power BI Essential Training 2024': 'Power BI',
    'Python Essential Training': 'Python',
    'SQL Essential Training': 'SQL',
  };

  linkedinCertGrid.innerHTML = data.linkedInCertificates.map(([file, verifyUrl]) => {
    const sourceTitle = file.replace(/^CertificateOfCompletion_/, '').replace(/\.pdf$/i, '');
    const title = titleOverrides[sourceTitle] || sourceTitle;
    const normalizedTitle = sourceTitle.toLowerCase();
    let icon = 'bi-award-fill';
    if (normalizedTitle.includes('visualization')) icon = 'bi-bar-chart-line-fill';
    else if (normalizedTitle.includes('ethics')) icon = 'bi-shield-check';
    else if (normalizedTitle.includes('online search')) icon = 'bi-search-heart-fill';
    else if (normalizedTitle.includes('artificial intelligence')) icon = 'bi-cpu-fill';
    else if (normalizedTitle.includes('career skills')) icon = 'bi-briefcase-fill';
    else if (normalizedTitle.includes('data analytics 1')) icon = 'bi-layers-fill';
    else if (normalizedTitle.includes('data analytics part 2')) icon = 'bi-graph-up-arrow';
    else if (normalizedTitle.includes('copilot')) icon = 'bi-robot';
    else if (normalizedTitle.includes('microsoft 365')) icon = 'bi-grid-1x2-fill';
    else if (normalizedTitle.includes('power bi')) icon = 'bi-pie-chart-fill';
    else if (normalizedTitle.includes('python')) icon = 'bi-code-slash';
    else if (normalizedTitle.includes('sql')) icon = 'bi-database-fill';
    else if (normalizedTitle.includes('generative ai')) icon = 'bi-stars';
    const pdfUrl = `assets/LINKDIN%20CERTIFICATES/${encodeURIComponent(file)}`;
    return `
      <article class="google-cert-card linkedin-cert-card">
        <span class="certificate-icon linkedin-certificate-icon" aria-hidden="true"><i class="bi ${icon}"></i></span>
        <h4>${title}</h4>
        <div class="certificate-preview">
          <iframe src="${pdfUrl}#toolbar=0&navpanes=0" title="${title} certificate" loading="lazy"></iframe>
        </div>
        <div class="certificate-actions">
          <a class="btn btn-ghost" href="${verifyUrl}" target="_blank" rel="noreferrer"><i class="bi bi-patch-check"></i> Verify</a>
        </div>
      </article>`;
  }).join('');
}

function setupNavigation() {
  if (!navToggle || !navLinks) return;

  const closeMenu = () => {
    topbar.classList.remove('menu-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation menu');
  };

  navToggle.addEventListener('click', () => {
    const isOpen = topbar.classList.toggle('menu-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  });

  navLinks.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => {
    if (window.innerWidth > 980) closeMenu();
  });

  const sectionLinks = [...navLinks.querySelectorAll('a[href^="#"]')];
  const sections = sectionLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    sectionLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${visible.target.id}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-25% 0px -60% 0px', threshold: [0, 0.2, 0.5] });

  sections.forEach((section) => sectionObserver.observe(section));
}

function setupGoogleCertificates() {
  if (!googleCertToggle || !googleCertList) return;

  googleCertToggle.addEventListener('click', () => {
    const isOpen = googleCertToggle.getAttribute('aria-expanded') === 'true';
    googleCertToggle.setAttribute('aria-expanded', String(!isOpen));
    googleCertToggle.querySelector('span').textContent = isOpen ? 'Show Certificates' : 'Hide Certificates';
    googleCertList.classList.toggle('is-open', !isOpen);
    googleCertList.style.maxHeight = isOpen ? '0px' : `${googleCertList.scrollHeight}px`;
  });

  window.addEventListener('resize', () => {
    if (googleCertList.classList.contains('is-open')) {
      googleCertList.style.maxHeight = `${googleCertList.scrollHeight}px`;
    }
  });
}

function setupUdemyCertificates() {
  if (!udemyCertToggle || !udemyCertList) return;

  udemyCertToggle.addEventListener('click', () => {
    const isOpen = udemyCertToggle.getAttribute('aria-expanded') === 'true';
    udemyCertToggle.setAttribute('aria-expanded', String(!isOpen));
    udemyCertToggle.querySelector('span').textContent = isOpen ? 'Show Certificates' : 'Hide Certificates';
    udemyCertList.classList.toggle('is-open', !isOpen);
    udemyCertList.style.maxHeight = isOpen ? '0px' : `${udemyCertList.scrollHeight}px`;
  });

  window.addEventListener('resize', () => {
    if (udemyCertList.classList.contains('is-open')) {
      udemyCertList.style.maxHeight = `${udemyCertList.scrollHeight}px`;
    }
  });
}

function setupLinkedInCertificates() {
  if (!linkedinCertToggle || !linkedinCertList) return;

  linkedinCertToggle.addEventListener('click', () => {
    const isOpen = linkedinCertToggle.getAttribute('aria-expanded') === 'true';
    linkedinCertToggle.setAttribute('aria-expanded', String(!isOpen));
    linkedinCertToggle.querySelector('span').textContent = isOpen ? 'Show Certificates' : 'Hide Certificates';
    linkedinCertList.classList.toggle('is-open', !isOpen);
    linkedinCertList.style.maxHeight = isOpen ? '0px' : `${linkedinCertList.scrollHeight}px`;
  });

  window.addEventListener('resize', () => {
    if (linkedinCertList.classList.contains('is-open')) {
      linkedinCertList.style.maxHeight = `${linkedinCertList.scrollHeight}px`;
    }
  });
}

function setupBe10xCertificate() {
  if (!be10xCertToggle || !be10xCertList) return;

  be10xCertToggle.addEventListener('click', () => {
    const isOpen = be10xCertToggle.getAttribute('aria-expanded') === 'true';
    be10xCertToggle.setAttribute('aria-expanded', String(!isOpen));
    be10xCertToggle.querySelector('span').textContent = isOpen ? 'Show Certificates' : 'Hide Certificates';
    be10xCertList.classList.toggle('is-open', !isOpen);
    be10xCertList.style.maxHeight = isOpen ? '0px' : `${be10xCertList.scrollHeight}px`;
  });

  window.addEventListener('resize', () => {
    if (be10xCertList.classList.contains('is-open')) {
      be10xCertList.style.maxHeight = `${be10xCertList.scrollHeight}px`;
    }
  });
}

function setupRevealAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        // set a CSS variable from data-delay for staggered reveals
        const delay = Number(entry.target.dataset.delay) || 0;
        entry.target.style.setProperty('--reveal-delay', `${delay * 120}ms`);
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.05,
      rootMargin: '0px 0px -10% 0px',
    }
  );

  document.querySelectorAll('.reveal').forEach((section) => {
    observer.observe(section);
  });
}

function setupEducationAnimations() {
  const cards = document.querySelectorAll('.education-card');
  if (!cards.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const delay = Number(entry.target.dataset.educationDelay) || 0;
      entry.target.style.setProperty('--education-delay', `${delay * 110}ms`);
      entry.target.classList.add('is-arrived');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

  cards.forEach((card) => observer.observe(card));
}

function setupResumeModal() {
  if (!resumePreviewTrigger || !resumeModal) return;

  const closeModal = () => {
    resumeModal.hidden = true;
    document.body.classList.remove('modal-open');
    resumePreviewTrigger.focus();
  };

  resumePreviewTrigger.addEventListener('click', (event) => {
    event.preventDefault();
    resumeModal.hidden = false;
    document.body.classList.add('modal-open');
    resumeModal.querySelector('.resume-modal-close').focus();
  });

  resumeModal.querySelectorAll('[data-resume-close]').forEach((element) => {
    element.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !resumeModal.hidden) closeModal();
  });
}

function setupContactForm() {
  if (!contactForm || !formStatus) return;

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!CONTACT_FORM_ENDPOINT) {
      formStatus.textContent = 'Form endpoint is not configured yet.';
      formStatus.className = 'form-status is-error';
      return;
    }

    const submitButton = contactForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    formStatus.textContent = 'Sending message...';
    formStatus.className = 'form-status';

    try {
      await fetch(CONTACT_FORM_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        body: new FormData(contactForm),
      });
      contactForm.reset();
      formStatus.textContent = 'Thanks, your message was sent.';
      formStatus.className = 'form-status is-success';
    } catch (error) {
      formStatus.textContent = 'Something went wrong. Please try Email instead.';
      formStatus.className = 'form-status is-error';
    } finally {
      submitButton.disabled = false;
    }
  });
}

function setupHeroTitleAnimation() {
  const hero = document.querySelector('#hero');
  const title = hero?.querySelector('h1');
  if (!hero || !title) return;

  let hasEntered = false;
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      title.classList.remove('is-exiting');
      title.classList.add('is-visible');
      hasEntered = true;
      return;
    }

    if (hasEntered) title.classList.add('is-exiting');
  }, { threshold: 0.35 });

  observer.observe(hero);
}

function initAiChat() {
  const launcher = document.getElementById('ai-launcher');
  const panel = document.getElementById('ai-chat-panel');
  const closeButton = document.getElementById('ai-chat-close');
  const input = document.getElementById('ai-chat-input');
  const sendButton = document.getElementById('ai-send');
  const body = document.getElementById('ai-chat-body');
  const suggestions = document.querySelectorAll('.ai-suggestion');
  const recruiterToggle = document.getElementById('ai-recruiter-toggle');
  const recruiterBox = document.getElementById('ai-job-description');
  const githubSuggestion = document.getElementById('ai-github-suggestion');

  if (!launcher || !panel || !body || !input || !sendButton) return;

  const state = {
    messageHistory: [],
    selectedProject: null,
    recruiterMode: false,
  };

  const escapeHtml = (value) => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const formatMessage = (message) => {
    const text = escapeHtml(message || '').replace(/\n/g, '<br />');
    return text.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noreferrer">$1</a>');
  };

  const appendMessage = (role, message, options = {}) => {
    const wrapper = document.createElement('div');
    wrapper.className = `ai-message ai-message-${role}`;
    const bubble = document.createElement('div');
    bubble.className = 'ai-message-bubble';

    if (role === 'assistant') {
      bubble.innerHTML = formatMessage(message);
    } else {
      bubble.textContent = message;
    }

    if (options.actions) {
      const actions = document.createElement('div');
      actions.className = 'ai-message-actions';
      options.actions.forEach((action) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'ai-inline-action';
        button.textContent = action.label;
        button.addEventListener('click', () => {
          if (action.type === 'project') {
            const target = action.slug || action.value;
            if (target) {
              state.selectedProject = target;
              const askText = `Explain the ${target.replace(/-/g, ' ')} project.`;
              input.value = askText;
              handleSubmit(askText);
            }
          }

          if (action.type === 'question' && action.value) {
            openPanel();
            handleSubmit(action.value);
          }
        });
        actions.appendChild(button);
      });
      bubble.appendChild(actions);
    }

    wrapper.appendChild(bubble);
    body.appendChild(wrapper);
    body.scrollTop = body.scrollHeight;
  };

  const setTyping = (isTyping) => {
    let indicator = document.getElementById('ai-typing-indicator');
    if (isTyping) {
      if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'ai-typing-indicator';
        indicator.className = 'ai-message ai-message-assistant';
        indicator.innerHTML = '<div class="ai-message-bubble ai-typing-bubble"><span></span><span></span><span></span></div>';
        body.appendChild(indicator);
      }
    } else if (indicator) {
      indicator.remove();
    }
    body.scrollTop = body.scrollHeight;
  };

  const submitRecruiterMode = async () => {
    if (!recruiterBox) return;
    const description = recruiterBox.value.trim();
    if (!description) {
      appendMessage('assistant', 'Paste a job description to compare it against Kabir\'s verified portfolio evidence.');
      return;
    }
    recruiterBox.value = '';
    state.recruiterMode = false;
    recruiterToggle?.classList.remove('is-active');
    recruiterBox.hidden = true;
    await handleSubmit(`Compare this job description with Kabir's skills:\n${description}`);
  };

  const handleSubmit = async (draftText) => {
    const value = (draftText || input.value || '').trim();
    if (!value) return;

    input.value = '';
    input.style.height = 'auto';
    appendMessage('user', value);
    state.messageHistory.push({ role: 'user', content: value });
    setTyping(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: value,
          messages: state.messageHistory.slice(-10),
          selectedProject: state.selectedProject,
          recruiterMode: state.recruiterMode ? value : null,
        }),
      });
      const data = await response.json();
      const answer = data.answer || 'I could not find a verified answer in the current portfolio data.';
      state.messageHistory.push({ role: 'assistant', content: answer });
      setTyping(false);
      appendMessage('assistant', answer, { actions: (data.relatedQuestions || []).slice(0, 3).map((question) => ({ label: question, type: 'question', value: question })) });
      if (data.warning) {
        appendMessage('assistant', data.warning);
      }
    } catch (error) {
      setTyping(false);
      appendMessage('assistant', 'I could not connect to the AI service right now. Please try again shortly.');
    }

    state.recruiterMode = false;
    if (recruiterBox) recruiterBox.hidden = true;
    recruiterToggle?.classList.remove('is-active');
  };

  const openPanel = () => {
    panel.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => input.focus());
  };

  const closePanel = () => {
    panel.hidden = true;
    launcher.setAttribute('aria-expanded', 'false');
  };

  launcher.addEventListener('click', () => {
    if (panel.hidden) openPanel(); else closePanel();
  });

  closeButton.addEventListener('click', closePanel);
  sendButton.addEventListener('click', () => handleSubmit(input.value));

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  });

  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 140)}px`;
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) closePanel();
  });

  suggestions.forEach((button) => {
    button.addEventListener('click', () => {
      const value = button.textContent.trim();
      if (button === githubSuggestion) {
        openPanel();
        appendMessage('assistant', 'I am fetching the latest public GitHub metadata for Kabir and comparing it with the portfolio context.');
        fetch('/api/ai/github')
          .then((response) => response.json())
          .then((data) => {
            const repos = Array.isArray(data.repos) ? data.repos : [];
            const summary = repos.map((repo) => `- ${repo.name}: ${repo.description || 'No description provided.'} (${repo.language || 'Unknown'})`).join('\n');
            appendMessage('assistant', summary || 'GitHub metadata is not available right now.');
          })
          .catch(() => appendMessage('assistant', 'GitHub metadata is unavailable right now, but the portfolio still provides verified project context.'));
        return;
      }
      openPanel();
      handleSubmit(value);
    });
  });

  recruiterToggle?.addEventListener('click', () => {
    state.recruiterMode = !state.recruiterMode;
    recruiterToggle.classList.toggle('is-active', state.recruiterMode);
    if (recruiterBox) {
      recruiterBox.hidden = !state.recruiterMode;
      if (state.recruiterMode) {
        recruiterBox.focus();
      }
    }
    if (!state.recruiterMode && recruiterBox) recruiterBox.value = '';
  });

  recruiterBox?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      submitRecruiterMode();
    }
  });

  sendButton.addEventListener('click', () => {
    if (state.recruiterMode && recruiterBox && !recruiterBox.hidden) {
      submitRecruiterMode();
      return;
    }
    handleSubmit();
  });

  const projectAskTriggers = document.querySelectorAll('[data-ai-project]');
  projectAskTriggers.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      const projectName = trigger.getAttribute('data-ai-project');
      state.selectedProject = projectName;
      openPanel();
      handleSubmit(`Explain the ${projectName} project.`);
    });
  });
}

function init() {
  document.body.classList.add('js-enabled');
  renderProjects();
  renderLinkedInCertificates();
  updateLinkedInCard();
  updateScrollState();
  setupNavigation();
  setupGoogleCertificates();
  setupUdemyCertificates();
  setupLinkedInCertificates();
  setupBe10xCertificate();
  setupRevealAnimations();
  setupEducationAnimations();
  setupHeroTitleAnimation();
  setupResumeModal();
  setupContactForm();
  setupProfileVideo();
  initAiChat();

  window.addEventListener('scroll', updateScrollState, { passive: true });
}

init();
