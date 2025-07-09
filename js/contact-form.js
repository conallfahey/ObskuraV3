/**
 * Contact Form Submission Handler
 * This script handles the contact form submission and validation
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get the contact form element
    const contactForm = document.getElementById('consultationForm');
    
    // Check if the form exists on the page
    if (contactForm) {
        // Add submit event listener to the form
        contactForm.addEventListener('submit', function(event) {
            // Prevent the default form submission
            event.preventDefault();
            
            // Get form fields
            const nameField = document.getElementById('yourname');
            const emailField = document.getElementById('email');
            const messageField = document.getElementById('message');
            const baitField = document.getElementById('bait'); // Honeypot field
            
            // Basic validation
            if (!nameField.value.trim()) {
                alert('Please enter your name');
                nameField.focus();
                return false;
            }
            
            if (!emailField.value.trim()) {
                alert('Please enter your email');
                emailField.focus();
                return false;
            }
            
            // Simple email validation
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(emailField.value.trim())) {
                alert('Please enter a valid email address');
                emailField.focus();
                return false;
            }
            
            if (!messageField.value.trim()) {
                alert('Please enter your message');
                messageField.focus();
                return false;
            }
            
            // Check if honeypot field is filled (spam bot)
            if (baitField.value.trim() !== '') {
                console.log('Spam submission detected');
                return false;
            }
            
            // Prepare form data
            const formData = new FormData();
            formData.append('name', nameField.value.trim());
            formData.append('email', emailField.value.trim());
            formData.append('message', messageField.value.trim());
            
            // Add honeypot field for FormSubmit.co
            formData.append('_honey', '');
            
            // Disable captcha
            formData.append('_captcha', 'false');
            
            // Add subject
            formData.append('_subject', 'New Contact Form Submission from Obskura Website');
            
            // Show loading state
            const submitButton = contactForm.querySelector('input[type="submit"]');
            const originalButtonValue = submitButton.value;
            submitButton.value = 'Sending...';
            submitButton.disabled = true;
            
            // Show loading spinner
            const overlay = document.getElementById('overlay');
            const spinner = document.getElementById('form-spinner');
            if (overlay && spinner) {
                overlay.style.scale = '1';
                spinner.style.display = 'block';
            }
            
            // Convert FormData to JSON for the AJAX endpoint
            const formDataJson = {};
            formData.forEach((value, key) => {
                formDataJson[key] = value;
            });
            
            // Send the form data using fetch API
            // Using FormSubmit.co's AJAX endpoint for better security
            fetch('https://formsubmit.co/ajax/conall@obskurastudios.com', {
                method: 'POST',
                body: JSON.stringify(formDataJson),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Show success message using the existing dialog
                const overlay = document.getElementById('overlay');
                const dialog = document.getElementById('dialog');
                
                if (overlay && dialog) {
                    // Show the overlay and dialog
                    overlay.style.scale = '1';
                    dialog.style.scale = '1';
                    
                    // Add event listener to close button if it exists
                    const closeButton = dialog.querySelector('.close-dialog');
                    if (closeButton) {
                        closeButton.addEventListener('click', function() {
                            overlay.style.scale = '0';
                            dialog.style.scale = '0';
                        });
                    }
                    
                    // Auto-hide after 5 seconds
                    setTimeout(function() {
                        overlay.style.scale = '0';
                        dialog.style.scale = '0';
                    }, 5000);
                } else {
                    // Fallback to alert if dialog elements don't exist
                    alert('Thank you! Your message has been sent successfully.');
                }
                
                // Reset the form
                contactForm.reset();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Oops! Something went wrong. Please try again later.');
            })
            .finally(() => {
                // Reset button state
                submitButton.value = originalButtonValue;
                submitButton.disabled = false;
                
                // Hide spinner
                if (spinner) {
                    spinner.style.display = 'none';
                }
                
                // If there was an error, hide the overlay if no dialog is shown
                const dialog = document.getElementById('dialog');
                if (overlay && dialog && dialog.style.scale !== '1') {
                    overlay.style.scale = '0';
                }
            });
        });
    }
});