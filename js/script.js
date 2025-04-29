// script.js

// Wait for the DOM to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', function() {

    // Back to Top Button Functionality
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            // Use pageYOffset for broader compatibility, fallback to documentElement.scrollTop
            const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollPosition > 300) { // Show button after scrolling 300px
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        });
        // Smooth scroll is handled by CSS `html { scroll-behavior: smooth; }`
        // If CSS smooth scroll isn't supported or desired, add JS scroll logic here.
    }

    // Modal Functionality
    const modalTriggers = document.querySelectorAll('[data-modal-target]');
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.modal-close');
    let previouslyFocusedElement = null; // To restore focus after closing modal

    function openModal(modal) {
        if (modal) {
            previouslyFocusedElement = document.activeElement; // Store focus
            modal.style.display = 'block';
            // Accessibility: Focus the close button or the modal container itself
            const focusableElement = modal.querySelector('.modal-close') || modal;
            if(focusableElement) {
                 // Delay focus slightly to ensure modal is fully rendered
                 setTimeout(() => focusableElement.focus(), 50);
            }
             // Trap focus inside the modal (more advanced accessibility enhancement)
             // Add event listener for Tab key to cycle through focusable elements within modal
             // (Implementation omitted for brevity but recommended for production)
        }
    }

    function closeModal(modal) {
         if (modal) {
            modal.style.display = 'none';
            // Accessibility: Restore focus to the element that opened the modal
            if(previouslyFocusedElement) {
                 previouslyFocusedElement.focus();
                 previouslyFocusedElement = null; // Reset
            }
         }
    }

    // Add click listeners to all modal triggers
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            const modalId = this.getAttribute('data-modal-target');
            const modal = document.getElementById(modalId);
            openModal(modal);
        });
    });

    // Add click listeners to all close buttons
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            closeModal(this.closest('.modal'));
        });
    });

    // Close modal if user clicks outside the modal content (on the overlay)
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });

    // Close modal with Escape key
    window.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' || e.key === 'Esc') { // Handle both variations
            const openModals = document.querySelectorAll('.modal[style*="display: block"]');
            // Close the topmost open modal if multiple could be open (unlikely here)
            if(openModals.length > 0) {
                closeModal(openModals[openModals.length - 1]);
            }
        }
    });

    // Enhanced Newsletter Form Handler
    const newsletterForm = document.querySelector('.newsletter-form form');
    if (newsletterForm) {
        const emailInput = newsletterForm.querySelector('input[type="email"]');
        const messageDiv = newsletterForm.querySelector('.form-message');

        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevent default form submission

            // Clear previous messages
            if (messageDiv) {
                messageDiv.textContent = '';
                messageDiv.className = 'form-message'; // Reset classes
            }
            if (!emailInput || !messageDiv) return; // Exit if elements missing

            const email = emailInput.value.trim();

            // Basic validation
            if (!email || !validateEmail(email)) {
                messageDiv.textContent = 'Please enter a valid email address.';
                messageDiv.classList.add('error');
                emailInput.focus(); // Focus the input for correction
                return;
            }

            // --- Placeholder for actual form submission ---
            // Here you would typically use fetch() to send data to your server/service
            // fetch('/api/subscribe', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ email: email })
            // })
            // .then(response => response.json())
            // .then(data => {
            //     if (data.success) {
            //         messageDiv.textContent = 'Thank you for subscribing!';
            //         messageDiv.classList.add('success');
            //         emailInput.value = ''; // Clear input on success
            //     } else {
            //         messageDiv.textContent = data.message || 'Subscription failed. Please try again.';
            //         messageDiv.classList.add('error');
            //     }
            // })
            // .catch(error => {
            //     console.error('Subscription error:', error);
            //     messageDiv.textContent = 'An error occurred. Please try again later.';
            //     messageDiv.classList.add('error');
            // });

            // --- Simulation for this example ---
            console.log(`Simulating subscription for: ${email}`);
            // Simulate network delay
            newsletterForm.querySelector('button').disabled = true; // Disable button during processing
            setTimeout(() => {
                // Simulate success
                messageDiv.textContent = `Thank you! ${email} has been added. (Demo)`;
                messageDiv.classList.add('success');
                emailInput.value = ''; // Clear input
                newsletterForm.querySelector('button').disabled = false; // Re-enable button
                // Simulate error (uncomment to test error state)
                // messageDiv.textContent = 'Failed to subscribe. Please try again. (Demo)';
                // messageDiv.classList.add('error');
                // newsletterForm.querySelector('button').disabled = false;
            }, 1000); // 1 second delay

        });
    }

    // Basic email validation function
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

}); // End DOMContentLoaded

/* Technical Improvement: Comments for maintainers */
/*
  - Performance: Minify this file before deployment.
  - AJAX Submission: Replace the form submission simulation with actual fetch() calls.
  - Focus Trapping: Implement focus trapping within modals for enhanced accessibility.
*/