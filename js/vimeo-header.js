/**
 * Vimeo Header Video Integration
 * This script handles the Vimeo video integration for the index page header
 */

document.addEventListener('DOMContentLoaded', function() {
    // Vimeo video ID
    const vimeoId = '1100065426';
    
    // Get the video background container
    const videoBackground = document.querySelector('.video-background');
    
    // Check if it's a mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
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
        
        // Add additional parameters for mobile to ensure autoplay works
        const vimeoParams = isMobile 
            ? `background=1&autoplay=1&loop=1&byline=0&title=0&muted=1&transparent=0&dnt=1&quality=720p&playsinline=1&autopause=0&controls=0` 
            : `background=1&autoplay=1&loop=1&byline=0&title=0&muted=1&transparent=0&dnt=1&quality=1080p`;
            
        iframe.src = `https://player.vimeo.com/video/${vimeoId}?${vimeoParams}`;
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
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
            
            // Listen for the 'loaded' event
            player.on('loaded', function() {
                console.log('Vimeo video loaded');
                
                // For mobile devices, explicitly play the video and check if it's actually playing
                if (isMobile) {
                    player.play().catch(function(error) {
                        console.warn('Mobile autoplay failed:', error);
                        createFallbackVideo(vimeoId);
                    });
                    
                    // Check if video is actually playing after a short delay
                    setTimeout(() => {
                        player.getPaused().then(function(paused) {
                            if (paused) {
                                console.warn('Video is paused on mobile, creating fallback');
                                createFallbackVideo(vimeoId);
                            }
                        }).catch(function(error) {
                            console.error('Error checking if video is playing:', error);
                        });
                    }, 1000);
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
                
                // If there's an error, create a fallback video element
                if (isMobile) {
                    createFallbackVideo(vimeoId);
                }
                
                // If there's an error, still allow the page to load
                if (window.preloaderVue) {
                    window.preloaderVue.vimeoLoaded = true;
                    if (window.preloaderVue.pageLoaded && !window.preloaderVue.preloaderRemoved) {
                        window.preloaderVue.doneLoading();
                    }
                }
            });
            
            // Function to create a fallback video element for mobile
            function createFallbackVideo(vimeoId) {
                // Only create fallback if it doesn't already exist
                if (document.querySelector('#fallback-video')) return;
                
                console.log('Creating fallback video for mobile');
                
                // Remove the Vimeo container
                vimeoContainer.remove();
                
                // Create a new video element
                const video = document.createElement('video');
                video.id = 'fallback-video';
                video.autoplay = true;
                video.muted = true;
                video.loop = true;
                video.playsInline = true;
                video.setAttribute('playsinline', '');
                video.setAttribute('webkit-playsinline', '');
                video.style.width = '100%';
                video.style.height = '100%';
                video.style.objectFit = 'cover';
                
                // Add a poster image (optional - you can add a poster image URL here)
                // video.poster = 'path/to/poster-image.jpg';
                
                // Add source for the video - using an existing video file as fallback
                const source = document.createElement('source');
                source.src = 'assets/videos/Pigeons_Clip.webm'; // Using an existing video file
                source.type = 'video/webm';
                video.appendChild(source);
                
                // Add the video to the video background
                videoBackground.appendChild(video);
                
                // Force play the video
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.error('Fallback video play error:', error);
                    });
                }
            }
        }
    }
});