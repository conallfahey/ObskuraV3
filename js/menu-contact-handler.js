/**
 * Menu Contact Handler
 * This script handles closing the multi-menu when the contact link is clicked
 */

document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for the multi-menu to be initialized
    setTimeout(function() {
        // Find all contact links in the multi-menu
        const contactLinks = document.querySelectorAll('.mainmenuUzi__item[href*="#getintouch"], .mainmenuUzi__item[href*="getintouch"]');
        
        // Get menu elements
        const menuUzi = document.querySelector('.menuUzi');
        const actionClose = document.querySelector('.action--close');
        
        if (contactLinks.length > 0 && menuUzi && actionClose) {
            contactLinks.forEach(function(contactLink) {
                contactLink.addEventListener('click', function(e) {
                    // Small delay to ensure the link navigation starts
                    setTimeout(function() {
                        // Close the menu by removing the open class
                        menuUzi.classList.remove('menuUzi--open');
                        
                        // Trigger the close button click to ensure proper cleanup
                        if (actionClose.click) {
                            actionClose.click();
                        }
                    }, 100);
                });
            });
            
            console.log('Menu contact handler initialized - found', contactLinks.length, 'contact links');
        } else {
            console.log('Menu contact handler: Could not find required elements');
        }
    }, 500); // Wait 500ms for menu initialization
});