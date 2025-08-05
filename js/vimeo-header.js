/**
 * Vimeo Header Video Integration
 * This script handles the Vimeo video integration for the index page header
 */

document.addEventListener('DOMContentLoaded', function() {
    // Vimeo video ID
    const vimeoId = '1100065426';
    
    // Mobile detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
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
        
        // Create the Vimeo iframe with mobile-optimized parameters
        const iframe = document.createElement('iframe');
        
        // Mobile-optimized Vimeo parameters
        const vimeoParams = [
            'background=1',
            'autoplay=1',
            'loop=1',
            'byline=0',
            'title=0',
            'muted=1',
            'transparent=0',
            'dnt=1',
            'playsinline=1',
            'autopause=0',
            'controls=0',
            isMobile ? 'quality=720p' : 'quality=1080p'
        ].join('&');
        
        iframe.src = `https://player.vimeo.com/video/${vimeoId}?${vimeoParams}`;
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
        iframe.setAttribute('allowfullscreen', '');
        iframe.setAttribute('playsinline', '');
        iframe.setAttribute('webkit-playsinline', '');
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
            
            // Listen for the 'ready' event to ensure player is fully initialized
            player.on('ready', function() {
                console.log('Vimeo player ready');
                if (isMobile) {
                    // Set volume to 0 for mobile autoplay compliance
                    player.setVolume(0);
                    // Try to play immediately when ready
                    player.play().catch(function(error) {
                        console.log('Autoplay failed on ready, waiting for user interaction:', error);
                    });
                }
            });
            
            // Listen for the 'loaded' event
            player.on('loaded', function() {
                console.log('Vimeo video loaded');
                
                // For mobile devices, ensure video plays
                if (isMobile) {
                    // Try to play the video immediately
                    player.play().then(function() {
                        console.log('Mobile video autoplay successful');
                    }).catch(function(error) {
                        console.log('Mobile autoplay blocked, will play on user interaction:', error);
                        // Add a one-time click/touch listener to start video
                        const playOnInteraction = function() {
                            player.play().then(function() {
                                console.log('Video started after user interaction');
                            }).catch(function(err) {
                                console.error('Failed to play video after interaction:', err);
                            });
                            document.removeEventListener('click', playOnInteraction);
                            document.removeEventListener('touchstart', playOnInteraction);
                        };
                        document.addEventListener('click', playOnInteraction, { once: true });
                        document.addEventListener('touchstart', playOnInteraction, { once: true });
                    });
                }
                
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