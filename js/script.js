document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Toggle ---
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const themeIconSun = document.getElementById('theme-icon-sun');
    const themeIconMoon = document.getElementById('theme-icon-moon');

    const applyTheme = (isDark) => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            themeIconSun.classList.add('hidden');
            themeIconMoon.classList.remove('hidden');
        } else {
            document.documentElement.classList.remove('dark');
            themeIconSun.classList.remove('hidden');
            themeIconMoon.classList.add('hidden');
        }
    };

    if (darkModeToggle) {
        // Check for saved theme preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('theme');
        let isDarkMode = savedTheme ? savedTheme === 'dark' : prefersDark;
        
        applyTheme(isDarkMode);

        darkModeToggle.addEventListener('click', () => {
            isDarkMode = !isDarkMode;
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
            applyTheme(isDarkMode);
        });
    }

    // --- Modal Logic ---
    const modalTriggers = document.querySelectorAll('[data-modal-target]');
    const closeButtons = document.querySelectorAll('.modal-close');
    let currentlyOpenModal = null;

    function openModal(modal) {
        if (!modal) return;
        modal.removeAttribute('hidden');
        // Delay to allow 'hidden' attribute removal to register before starting transition
        setTimeout(() => {
            modal.classList.remove('opacity-0', 'pointer-events-none');
            modal.querySelector('.modal-content').classList.remove('scale-95');
        }, 10); // Small delay
        document.body.classList.add('overflow-hidden'); // Prevent background scrolling
        currentlyOpenModal = modal;
        modal.focus(); // For accessibility, focus the modal
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.classList.add('opacity-0', 'pointer-events-none');
        modal.querySelector('.modal-content').classList.add('scale-95');
        // Wait for transition to finish before setting hidden attribute
        modal.addEventListener('transitionend', function handler() {
            modal.setAttribute('hidden', '');
            modal.removeEventListener('transitionend', handler);
        });
        document.body.classList.remove('overflow-hidden');
        currentlyOpenModal = null;
    }

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', async function(event) {
            event.preventDefault();
            const modalId = this.getAttribute('data-modal-target');
            const modalElement = document.getElementById(modalId);
            
            if (modalElement) {
                openModal(modalElement); // Open modal first

                const mdSource = this.getAttribute('data-md-source');
                if (mdSource) { // If it's a markdown-loading modal
                    const contentAreaId = modalId.replace('-modal', '-content');
                    const contentArea = modalElement.querySelector(`#${contentAreaId}`);

                    if (contentArea) {
                        contentArea.innerHTML = '<p class="text-center py-4">Loading...</p>';
                        try {
                            const response = await fetch(mdSource);
                            if (!response.ok) {
                                throw new Error(`Failed to fetch ${mdSource}: ${response.statusText} (${response.status})`);
                            }
                            const markdownText = await response.text();
                            if (typeof marked === 'function') {
                                contentArea.innerHTML = marked.parse(markdownText);
                            } else if (typeof window.marked === 'function') {
                                contentArea.innerHTML = window.marked.parse(markdownText);
                            }
                            else {
                                console.error('Marked.js library is not available.');
                                contentArea.innerHTML = '<p class="text-center py-4 text-red-500">Error: Markdown parser not available.</p>';
                            }
                        } catch (error) {
                            console.error('Error loading or parsing markdown:', error);
                            contentArea.innerHTML = `<p class="text-center py-4 text-red-500">Error loading content from ${mdSource}.</p>`;
                        }
                    } else {
                        console.error('Content area not found in modal:', modalId);
                    }
                }
            }
        });
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) closeModal(modal);
        });
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && currentlyOpenModal) {
            closeModal(currentlyOpenModal);
        }
    });

    // Close modal on click outside
    document.querySelectorAll('.modal').forEach(modalElement => {
        modalElement.addEventListener('click', (event) => {
            if (event.target === modalElement) { // Clicked on the backdrop
                closeModal(modalElement);
            }
        });
    });

    // --- Back to Top Button ---
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.classList.remove('opacity-0', 'pointer-events-none');
            } else {
                backToTopButton.classList.add('opacity-0', 'pointer-events-none');
            }
        });
        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- Newsletter Form ---
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        const emailInput = document.getElementById('email-sub');
        const feedbackDiv = document.getElementById('newsletter-feedback');
        const submitButton = document.getElementById('newsletter-submit-button');
        const buttonText = submitButton.querySelector('.button-text');
        const spinner = submitButton.querySelector('.spinner');

        newsletterForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            feedbackDiv.textContent = '';
            feedbackDiv.className = 'mt-2 text-sm'; // Reset classes
            const email = emailInput.value.trim();

            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                feedbackDiv.textContent = 'Please enter a valid email address.';
                feedbackDiv.classList.add('text-red-500');
                return;
            }

            buttonText.classList.add('hidden');
            spinner.classList.remove('hidden');
            submitButton.disabled = true;
            newsletterForm.setAttribute('aria-busy', 'true');

            try {
                const response = await fetch(newsletterForm.action, {
                    method: 'POST',
                    body: new FormData(newsletterForm),
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    feedbackDiv.textContent = 'Thanks for subscribing!';
                    feedbackDiv.classList.add('text-status-green');
                    newsletterForm.reset();
                } else {
                    const data = await response.json().catch(() => ({})); // Try to parse error
                    feedbackDiv.textContent = data.error || 'Oops! Something went wrong. Please try again.';
                    feedbackDiv.classList.add('text-red-500');
                }
            } catch (error) {
                console.error('Newsletter submission error:', error);
                feedbackDiv.textContent = 'Network error. Please try again.';
                feedbackDiv.classList.add('text-red-500');
            } finally {
                buttonText.classList.remove('hidden');
                spinner.classList.add('hidden');
                submitButton.disabled = false;
                newsletterForm.setAttribute('aria-busy', 'false');
            }
        });
    }

    // --- Current Year & Date ---
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
    const currentDateTimeSpan = document.getElementById('current-datetime');
    if (currentDateTimeSpan) {
        const now = new Date();
        currentDateTimeSpan.textContent = now.toLocaleString('en-MY', { 
            year: 'numeric', month: 'long', day: 'numeric', 
            hour: '2-digit', minute: '2-digit', timeZoneName: 'shortOffset' 
        });
    }
    
    // --- Animate on Scroll ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    if (animatedElements.length > 0 && "IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // Optional: unobserve after animation if it should only play once
                    // observerInstance.unobserve(entry.target); 
                } else {
                    // Optional: remove 'is-visible' if animation should replay on scroll away and back
                    // entry.target.classList.remove('is-visible'); 
                }
            });
        }, { threshold: 0.1 }); // Adjust threshold as needed (0.1 means 10% visible)

        animatedElements.forEach(el => observer.observe(el));
    } else if (animatedElements.length > 0) { 
        // Fallback for older browsers or if IntersectionObserver is not supported
        // Make all elements visible immediately
        animatedElements.forEach(el => el.classList.add('is-visible'));
    }


    // --- Social Share Buttons ---
    const socialShareContainer = document.getElementById('social-share-buttons');
    if (socialShareContainer) {
        socialShareContainer.addEventListener('click', (event) => {
            const button = event.target.closest('button[data-platform]');
            if (!button) return;

            const platform = button.dataset.platform;
            const pageUrl = encodeURIComponent(window.location.href);
            const pageTitle = encodeURIComponent(document.title);
            let shareUrl = '';

            switch (platform) {
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`;
                    break;
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
                    break;
                case 'linkedin':
                    shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${pageUrl}&title=${pageTitle}`;
                    break;
                case 'email':
                    shareUrl = `mailto:?subject=${pageTitle}&body=Check out this page: ${pageUrl}`;
                    break;
            }

            if (shareUrl) {
                window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
            }
        });
    }

    // --- Update Latest Videos (Placeholder for actual YouTube API integration) ---
    const latestVideosContainer = document.getElementById('latest-videos-container');
    if (latestVideosContainer && latestVideosContainer.querySelector('.fa-spinner')) {
        // This is where you would fetch data from YouTube API
        // For now, let's simulate a delay and then show a message or example cards
        setTimeout(() => {
            // Remove loading spinner
            latestVideosContainer.innerHTML = ''; 

            // Example: Add a message if API isn't implemented
            const comingSoonMessage = document.createElement('p');
            comingSoonMessage.className = 'col-span-full text-center text-slate-500 dark:text-dark-text-secondary';
            comingSoonMessage.textContent = 'Latest videos coming soon! (YouTube API integration needed here).';
            // latestVideosContainer.appendChild(comingSoonMessage);

            // Or, example of how you might add video cards (structure based on other cards)
            // This is just a placeholder to show structure
            const exampleVideos = [
                { title: "Example Video 1", description: "Description for video 1.", embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" }, // Example: Rick Astley
                { title: "Example Video 2", description: "Description for video 2.", embedUrl: "https://www.youtube.com/embed/ वीडियोआईडी2" },
                { title: "Example Video 3", description: "Description for video 3.", embedUrl: "https://www.youtube.com/embed/ वीडियोआईडी3" }
            ];

            if(exampleVideos.length > 0) {
                 exampleVideos.forEach(video => {
                    const article = document.createElement('article');
                    article.className = "bg-white dark:bg-dark-card p-6 rounded-xl shadow-lg flex flex-col";
                    article.innerHTML = `
                        <div class="mb-4 rounded-md overflow-hidden responsive-iframe-container bg-slate-300 dark:bg-slate-600">
                            <iframe src="${video.embedUrl}" title="${video.title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe>
                        </div>
                        <h3 class="text-lg font-semibold mb-1 text-primary dark:text-dark-text-primary">${video.title}</h3>
                        <p class="text-sm text-slate-500 dark:text-dark-text-secondary flex-grow">${video.description}</p>
                         <a href="${video.embedUrl.replace('embed/', 'watch?v=')}" target="_blank" rel="noopener noreferrer" class="mt-3 self-start text-secondary dark:text-dark-secondary-accent hover:underline">Watch on YouTube <i class="fas fa-external-link-alt text-xs"></i></a>
                    `;
                    latestVideosContainer.appendChild(article);
                });
            } else {
                latestVideosContainer.appendChild(comingSoonMessage);
            }

        }, 1500); // Simulate 1.5 second delay
    }

}); // End DOMContentLoaded