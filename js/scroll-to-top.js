// Scroll to top functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get the scroll to top button
    const toTopButton = document.getElementById('toTop');
    
    if (toTopButton) {
        // Add click event listener to the button
        toTopButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Scroll to the top of the page smoothly
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});