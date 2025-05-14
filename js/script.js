// script.js for Talking Book Website

document.addEventListener('DOMContentLoaded', () => {
    // --- Modal Functionality ---
    const modalTriggers = document.querySelectorAll('[data-modal-target]');
    const modals = document.querySelectorAll('.modal');
    const modalCloses = document.querySelectorAll('.modal-close');
    const body = document.body;
    let previouslyFocusedElement;

    // Function to open a modal
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            previouslyFocusedElement = document.activeElement; // Save current focus
            modal.removeAttribute('hidden');
            modal.classList.remove('opacity-0', 'pointer-events-none', 'scale-95');
            modal.classList.add('opacity-100', 'scale-100');
            body.classList.add('overflow-hidden'); // Prevent background scrolling

            // Focus the modal itself or the first focusable element within it
            const focusableElements = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusableElements.length > 0) {
                focusableElements[0].focus();
            } else {
                modal.focus(); // Fallback to modal container
            }
        }
    }

    // Function to close a modal
    function closeModal(modal) {
        if (modal) {
            modal.classList.add('opacity-0', 'pointer-events-none', 'scale-95');
            modal.classList.remove('opacity-100', 'scale-100');
            setTimeout(() => modal.setAttribute('hidden', 'true'), 300); // Wait for transition
            body.classList.remove('overflow-hidden');

            if (previouslyFocusedElement) {
                previouslyFocusedElement.focus(); // Restore focus
            }
        }
    }

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (event) => {
            event.preventDefault();
            const modalId = trigger.getAttribute('data-modal-target');
            openModal(modalId);
        });
    });

    modalCloses.forEach(closeButton => {
        closeButton.addEventListener('click', () => {
            const modal = closeButton.closest('.modal');
            closeModal(modal);
        });
    });

    // Close modal on clicking outside the modal content
    modals.forEach(modal => {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) { // Check if click is on the backdrop
                closeModal(modal);
            }
        });
    });

    // Close modal on Escape key press
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const openModal = document.querySelector('.modal:not([hidden])');
            if (openModal) {
                closeModal(openModal);
            }
        }
    });

    // --- Back to Top Button ---
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.classList.remove('opacity-0', 'pointer-events-none');
                backToTopButton.classList.add('opacity-100');
            } else {
                backToTopButton.classList.add('opacity-0');
                // Delay pointer-events-none to allow fade-out transition
                setTimeout(() => {
                     if (window.scrollY <= 300) { // Re-check in case user scrolled back up fast
                        backToTopButton.classList.add('pointer-events-none');
                     }
                }, 300);
            }
        });

        backToTopButton.addEventListener('click', (event) => {
            event.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // --- Newsletter Form ---
    const newsletterForm = document.getElementById('newsletter-form');
    const newsletterFeedback = document.getElementById('newsletter-feedback');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent actual submission for this demo
            const emailInput = newsletterForm.querySelector('#email-sub');
            const email = emailInput.value.trim();

            // Basic email validation
            if (!email) {
                displayNewsletterFeedback('Please enter your email address.', 'text-red-500');
                emailInput.focus();
                return;
            } else if (!isValidEmail(email)) {
                displayNewsletterFeedback('Please enter a valid email address.', 'text-red-500');
                emailInput.focus();
                return;
            }

            // Simulate form submission (replace with actual AJAX call)
            displayNewsletterFeedback('Subscribing...', 'text-blue-500');
            setTimeout(() => {
                // Simulate success
                displayNewsletterFeedback('Thanks for subscribing! Please check your email to confirm.', 'text-green-500');
                emailInput.value = ''; // Clear input

                // Simulate error (uncomment to test error case)
                // displayNewsletterFeedback('Subscription failed. Please try again.', 'text-red-500');
            }, 1500);
        });
    }

    function isValidEmail(email) {
        // Basic regex for email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function displayNewsletterFeedback(message, className) {
        if (newsletterFeedback) {
            newsletterFeedback.textContent = message;
            newsletterFeedback.className = `mt-2 text-sm ${className}`; // Reset classes and add new one
        }
    }

    // --- Update Copyright Year ---
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Smooth Scroll for Skip Link (if not handled by html.scroll-smooth) ---
    // Tailwind's `scroll-smooth` on <html> should handle this, but as a fallback:
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
        skipLink.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: 'smooth' });
                // Optionally, set focus to the main content after scrolling
                targetElement.setAttribute('tabindex', '-1'); // Make it focusable
                targetElement.focus();
            }
        });
    }

    // --- Animate elements on scroll ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Optional: unobserve after animation to save resources
                // observer.unobserve(entry.target);
            } else {
                // Optional: remove class if you want animation to repeat when scrolling up and down
                // entry.target.classList.remove('is-visible');
            }
        });
    }, {
        threshold: 0.1 // Trigger when 10% of the element is visible
    });

    animatedElements.forEach(el => {
        observer.observe(el);
    });

});
