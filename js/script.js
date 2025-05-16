// script.js for Talking Book Website

document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const htmlElement = document.documentElement;

    // --- Dark Mode Toggle ---
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const themeIconSun = document.getElementById('theme-icon-sun');
    const themeIconMoon = document.getElementById('theme-icon-moon');

    function applyTheme(theme) {
        if (theme === 'dark') {
            htmlElement.classList.add('dark');
            if (themeIconSun) themeIconSun.classList.add('hidden');
            if (themeIconMoon) themeIconMoon.classList.remove('hidden');
            if (darkModeToggle) darkModeToggle.setAttribute('aria-label', 'Switch to light mode');
        } else {
            htmlElement.classList.remove('dark');
            if (themeIconSun) themeIconSun.classList.remove('hidden');
            if (themeIconMoon) themeIconMoon.classList.add('hidden');
            if (darkModeToggle) darkModeToggle.setAttribute('aria-label', 'Switch to dark mode');
        }
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            const isDarkMode = htmlElement.classList.toggle('dark');
            const newTheme = isDarkMode ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });
    }

    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (systemPrefersDark) {
        applyTheme('dark');
    } else {
        applyTheme('light');
    }

    // --- Modal Functionality ---
    const modalTriggers = document.querySelectorAll('[data-modal-target]');
    const modals = document.querySelectorAll('.modal');
    const modalCloses = document.querySelectorAll('.modal-close');
    let previouslyFocusedElement;

    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            previouslyFocusedElement = document.activeElement;
            modal.removeAttribute('hidden');
            body.classList.add('overflow-hidden');
            modal.classList.remove('opacity-0', 'pointer-events-none');
            modal.classList.add('opacity-100');
            const modalContent = modal.querySelector('.modal-content');
            if(modalContent){
                modalContent.classList.remove('scale-95');
                modalContent.classList.add('scale-100');
            }
            const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            const firstFocusable = focusableElements[0];
            const lastFocusable = focusableElements[focusableElements.length - 1];
            if (firstFocusable) firstFocusable.focus();
            else modal.focus();
            modal.addEventListener('keydown', (e) => trapFocus(e, firstFocusable, lastFocusable));
        }
    }

    function closeModal(modal) {
        if (modal) {
            body.classList.remove('overflow-hidden');
            modal.classList.add('opacity-0', 'pointer-events-none');
            const modalContent = modal.querySelector('.modal-content');
            if(modalContent){
                modalContent.classList.add('scale-95');
                modalContent.classList.remove('scale-100');
            }
            setTimeout(() => {
                modal.setAttribute('hidden', 'true');
                modal.classList.remove('opacity-0');
                if(modalContent) modalContent.classList.remove('scale-95');
            }, prefersReducedMotion ? 0 : 300);
            if (previouslyFocusedElement) previouslyFocusedElement.focus();
            modal.removeEventListener('keydown', trapFocus);
        }
    }

    function trapFocus(e, firstFocusable, lastFocusable) {
        if (e.key === 'Tab' && firstFocusable && lastFocusable) {
            if (e.shiftKey) { if (document.activeElement === firstFocusable) { lastFocusable.focus(); e.preventDefault(); } }
            else { if (document.activeElement === lastFocusable) { firstFocusable.focus(); e.preventDefault(); } }
        }
    }

    modalTriggers.forEach(trigger => trigger.addEventListener('click', (event) => { event.preventDefault(); openModal(trigger.getAttribute('data-modal-target')); }));
    modalCloses.forEach(closeButton => closeButton.addEventListener('click', () => closeModal(closeButton.closest('.modal'))));
    modals.forEach(modal => modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(modal); }));
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { const openModalElement = document.querySelector('.modal:not([hidden])'); if (openModalElement) closeModal(openModalElement); } });

    // --- Back to Top Button ---
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.classList.remove('opacity-0', 'pointer-events-none');
                backToTopButton.classList.add('opacity-100');
            } else {
                backToTopButton.classList.add('opacity-0');
                setTimeout(() => { if (window.scrollY <= 300) backToTopButton.classList.add('pointer-events-none'); }, prefersReducedMotion ? 0 : 300);
            }
        }, { passive: true });
        backToTopButton.addEventListener('click', (event) => { event.preventDefault(); window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' }); });
    }

    // --- Newsletter Form ---
    const newsletterForm = document.getElementById('newsletter-form');
    const newsletterFeedback = document.getElementById('newsletter-feedback');
    const newsletterSubmitButton = document.getElementById('newsletter-submit-button');
    const NbuttonText = newsletterSubmitButton?.querySelector('.button-text');
    const Nspinner = newsletterSubmitButton?.querySelector('.spinner');

    if (newsletterForm && newsletterSubmitButton && NbuttonText && Nspinner) {
        newsletterForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const emailInput = newsletterForm.querySelector('#email-sub');
            const email = emailInput.value.trim();
            if (!email || !isValidEmail(email)) {
                displayNewsletterFeedback(!email ? 'Please enter your email address.' : 'Please enter a valid email address.', 'text-status-red dark:text-red-400', emailInput);
                return;
            }
            setFormSubmitting(true);
            const formAction = newsletterForm.getAttribute('action');
            if (formAction && formAction !== 'YOUR_FORMSPREE_ENDPOINT_OR_OTHER_SERVICE') {
                 try {
                    const response = await fetch(formAction, { method: 'POST', body: new FormData(newsletterForm), headers: { 'Accept': 'application/json' } });
                    if (response.ok) {
                        displayNewsletterFeedback('Thanks for subscribing!', 'text-status-green dark:text-green-400');
                        emailInput.value = '';
                    } else {
                        const data = await response.json().catch(() => ({})); // Graceful fallback for non-JSON response
                        const errorMsg = data.errors && data.errors.length > 0 ? data.errors.map(err => err.message).join(', ') : 'Subscription failed. Please try again.';
                        displayNewsletterFeedback(errorMsg, 'text-status-red dark:text-red-400');
                    }
                } catch (error) {
                    displayNewsletterFeedback('Subscription failed. Check connection.', 'text-status-red dark:text-red-400');
                } finally { setFormSubmitting(false); }
            } else {
                console.warn("Newsletter form submission is simulated.");
                setTimeout(() => {
                    displayNewsletterFeedback('Thanks for subscribing! (Simulated)', 'text-status-green dark:text-green-400');
                    emailInput.value = ''; setFormSubmitting(false);
                }, 1500);
            }
        });
    }
    function setFormSubmitting(isSubmitting) {
        if (newsletterSubmitButton && NbuttonText && Nspinner) {
            newsletterSubmitButton.disabled = isSubmitting;
            newsletterForm.setAttribute('aria-busy', isSubmitting.toString());
            NbuttonText.classList.toggle('hidden', isSubmitting);
            Nspinner.classList.toggle('hidden', !isSubmitting);
        }
    }
    function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
    function displayNewsletterFeedback(message, className, inputToFocus = null) {
        if (newsletterFeedback) {
            newsletterFeedback.textContent = message;
            newsletterFeedback.className = `mt-2 text-sm ${className}`;
            newsletterFeedback.setAttribute('role', 'alert');
        }
        const emailInp = newsletterForm?.querySelector('#email-sub');
        if (emailInp) {
            if (inputToFocus) { inputToFocus.focus(); inputToFocus.setAttribute('aria-invalid', 'true'); inputToFocus.setAttribute('aria-describedby', 'newsletter-feedback'); }
            else { emailInp.removeAttribute('aria-invalid'); emailInp.removeAttribute('aria-describedby'); }
        }
    }

    // --- Update Copyright Year & Current Date ---
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();
    const currentDateTimeSpan = document.getElementById('current-datetime');
    if (currentDateTimeSpan) {
        const now = new Date();
        currentDateTimeSpan.textContent = now.toLocaleDateString('en-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'shortOffset' });
    }

    // --- Smooth Scroll for Skip Link (Fallback) ---
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
        skipLink.addEventListener('click', function(e) {
            const targetElement = document.querySelector(this.getAttribute('href'));
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
                targetElement.setAttribute('tabindex', '-1'); targetElement.focus({ preventScroll: true });
            }
        });
    }

    // --- Animate elements on scroll ---
    if (!prefersReducedMotion) {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        const observer = new IntersectionObserver((entries) => entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('is-visible'); }), { threshold: 0.1 });
        animatedElements.forEach(el => observer.observe(el));
    } else {
        document.querySelectorAll('.animate-on-scroll').forEach(el => { el.classList.add('is-visible'); el.style.transform = 'none'; el.style.opacity = '1'; });
    }

    // --- Load Latest Videos (Placeholder) ---
    function loadLatestVideos() {
        const container = document.getElementById('latest-videos-container');
        if (!container) return;
        const placeholderVideos = [
            { id: 'VIDEO_ID_1', title: 'Understanding The Lean Startup', description: 'Key takeaways from Eric Ries\'s groundbreaking book.', thumbnail: './images/placeholder_video_1.jpg', youtubeLink: 'YOUR_VIDEO_1_YOUTUBE_URL' },
            { id: 'VIDEO_ID_2', title: 'Deep Dive: Atomic Habits Ch. 5', description: 'Breaking down the power of environment in habit formation.', thumbnail: './images/placeholder_video_2.jpg', youtubeLink: 'YOUR_VIDEO_2_YOUTUBE_URL' },
            { id: 'VIDEO_ID_3', title: 'Song: The Power of Now', description: 'A musical summary of Eckhart Tolle\'s masterpiece.', thumbnail: './images/placeholder_video_3.jpg', youtubeLink: 'YOUR_VIDEO_3_YOUTUBE_URL' }
        ];
        setTimeout(() => {
            container.innerHTML = '';
            if (placeholderVideos.length === 0) { container.innerHTML = '<p class="text-slate-500 dark:text-dark-text-secondary col-span-full text-center">No videos to display.</p>'; return; }
            placeholderVideos.forEach(video => {
                container.insertAdjacentHTML('beforeend', `
                    <article class="bg-white dark:bg-dark-card p-5 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col motion-safe:hover:-translate-y-1">
                        <a href="${video.youtubeLink}" target="_blank" rel="noopener noreferrer" class="group">
                            <div class="mb-4 rounded-md overflow-hidden aspect-video bg-slate-300 dark:bg-slate-600 flex items-center justify-center">
                                <img src="${video.thumbnail}" alt="Thumbnail for ${video.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"></div>
                            <h3 class="text-lg font-semibold mb-1 text-primary dark:text-dark-text-primary group-hover:text-secondary dark:group-hover:text-dark-secondary-accent">${video.title}</h3></a>
                        <p class="text-slate-600 dark:text-dark-text-secondary text-sm mb-3 flex-grow">${video.description}</p>
                        <a href="${video.youtubeLink}" target="_blank" rel="noopener noreferrer" title="Watch '${video.title}' on YouTube" class="mt-auto self-start text-secondary dark:text-dark-secondary-accent hover:text-secondary-hover dark:hover:text-amber-400 font-medium py-1 text-sm">Watch Video <i class="fas fa-arrow-right ml-1 text-xs"></i></a></article>`);
            });
        }, 500);
    }
    loadLatestVideos();

    // --- Social Sharing ---
    const socialShareButtons = document.getElementById('social-share-buttons');
    if (socialShareButtons) {
        socialShareButtons.addEventListener('click', function(event) {
            const button = event.target.closest('button[data-platform]');
            if (!button) return;
            const platform = button.dataset.platform;
            const pageUrl = encodeURIComponent(window.location.href);
            const pageTitle = encodeURIComponent(document.title);
            let shareUrl = '';
            if (platform === 'twitter') shareUrl = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`;
            else if (platform === 'facebook') shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
            else if (platform === 'linkedin') shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${pageUrl}&title=${pageTitle}`;
            else if (platform === 'email') shareUrl = `mailto:?subject=${pageTitle}&body=Check out this page: ${pageUrl}`;
            if (shareUrl) window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
        });
    }
});