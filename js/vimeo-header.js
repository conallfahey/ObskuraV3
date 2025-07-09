/**
 * Vimeo Header Video Integration
 * This script handles the Vimeo video integration for the index page header
 */

document.addEventListener('DOMContentLoaded', function() {
    // Vimeo video ID
    const vimeoId = '1100065426';
    
    // Get the video background container
    const videoBackground = document.querySelector('.video-background');
    
    if (videoBackground) {
        // Clear existing content (the original video element)
        videoBackground.innerHTML = '';
        
        // Create a container for the Vimeo iframe
        const vimeoContainer = document.createElement('div');
        vimeoContainer.id = 'vimeo-header-container';
        vimeoContainer.style.width = '100%';
        vimeoContainer.style.height = '100%';
        vimeoContainer.style.position = 'absolute';
        vimeoContainer.style.top = '0';
        vimeoContainer.style.left = '0';
        vimeoContainer.style.overflow = 'hidden';
       
        
        // Append the container to the video background
        videoBackground.appendChild(vimeoContainer);
        
        // Create the Vimeo iframe
        const iframe = document.createElement('iframe');
        iframe.src = `https://player.vimeo.com/video/${vimeoId}?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1&transparent=0&dnt=1&quality=1080p`;
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allow', 'autoplay; fullscreen');
        // Let CSS handle the styling
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        
        // Append the iframe to the container
        vimeoContainer.appendChild(iframe);
        
        // Initialize Vimeo player when API is ready
        if (window.Vimeo) {
            initVimeoPlayer();
        } else {
            // Load Vimeo Player API if not already loaded
            const script = document.createElement('script');
            script.src = 'https://player.vimeo.com/api/player.js';
            script.onload = initVimeoPlayer;
            document.head.appendChild(script);
        }
        
        function initVimeoPlayer() {
            // Create Vimeo player instance
            const player = new Vimeo.Player(iframe);
            
            // Listen for the 'loaded' event
            player.on('loaded', function() {
                console.log('Vimeo video loaded');
                
                // Access the preloader Vue instance
                if (window.preloaderVue) {
                    // Set vimeoLoaded to true
                    window.preloaderVue.vimeoLoaded = true;
                    
                    // If the page has already loaded but was waiting for the video
                    if (window.preloaderVue.pageLoaded && !window.preloaderVue.preloaderRemoved) {
                        // Add a small delay to ensure smooth transition
                        setTimeout(() => {
                            window.preloaderVue.doneLoading();
                        }, 500);
                    }
                }
            });
            
            // Handle any errors
            player.on('error', function(error) {
                console.error('Vimeo player error:', error);
                
                // If there's an error, still allow the page to load
                if (window.preloaderVue) {
                    window.preloaderVue.vimeoLoaded = true;
                    if (window.preloaderVue.pageLoaded && !window.preloaderVue.preloaderRemoved) {
                        window.preloaderVue.doneLoading();
                    }
                }
            });
        }
    }
});