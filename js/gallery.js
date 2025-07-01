// Initialize smooth scrolling with Lenis
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  gestureOrientation: 'vertical',
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize GSAP and ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);
  
  // Elements
  const galleryItems = document.querySelectorAll('.gallery-item');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const lightboxModal = document.querySelector('.lightbox-modal');
  const lightboxImg = document.querySelector('.lightbox-img');
  const lightboxCaption = document.querySelector('.lightbox-caption');
  const lightboxCaptionTitle = document.querySelector('.lightbox-caption h3');
  const lightboxCaptionDesc = document.querySelector('.lightbox-caption span');
  const lightboxClose = document.querySelector('.lightbox-close');
  const lightboxPrev = document.querySelector('.lightbox-prev');
  const lightboxNext = document.querySelector('.lightbox-next');
  
  let currentIndex = 0;
  let filteredItems = [];
  
  // Initialize animations
  function initAnimations() {
    // Animate gallery items on scroll
    galleryItems.forEach((item, index) => {
      gsap.to(item, {
        scrollTrigger: {
          trigger: item,
          start: 'top bottom-=100',
          toggleClass: 'show',
          once: true
        },
        duration: 0.8,
        delay: index * 0.1,
        ease: 'power3.out'
      });
    });
  }
  
  // Filter gallery items
  function filterGallery(category) {
    filteredItems = [];
    
    galleryItems.forEach(item => {
      const itemCategory = item.dataset.category;
      
      if (category === 'all' || itemCategory === category) {
        item.style.display = 'block';
        filteredItems.push(item);
      } else {
        item.style.display = 'none';
      }
    });
    
    // Refresh ScrollTrigger
    ScrollTrigger.refresh();
  }
  
  // Open lightbox
  function openLightbox(index) {
    if (filteredItems.length === 0) return;
    
    currentIndex = index;
    const item = filteredItems[currentIndex];
    
    // Extract the background image URL properly
    const bgImage = item.querySelector('.gallery-item-img-inner').style.backgroundImage;
    
    // Handle multiple background images (comma-separated)
    let imgSrc;
    if (bgImage.includes(',')) {
      // Get the first image URL from the comma-separated list
      imgSrc = bgImage.split(',')[0].replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
    } else {
      imgSrc = bgImage.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
    }
    
    // Fallback to a placeholder if the image URL is empty or invalid
    if (!imgSrc || imgSrc === 'none') {
      imgSrc = 'assets/images/BOBM.jpg'; // Default fallback image
    }
    
    const title = item.querySelector('.gallery-item-caption h3').textContent;
    const desc = item.querySelector('.gallery-item-caption span').textContent;
    
    // First display the modal
    lightboxModal.style.display = 'block';
    
    // Set the image source and caption
    lightboxImg.src = imgSrc;
    lightboxImg.style.opacity = '0';
    
    lightboxImg.onload = function() {
      // Image loaded successfully
      console.log('Image loaded successfully:', imgSrc);
      lightboxImg.style.opacity = '1';
      
      // Add active class for animations after a small delay
      setTimeout(() => {
        lightboxModal.classList.add('active');
      }, 10);
    };
    
    lightboxImg.onerror = function() {
      // Image failed to load, use fallback
      console.log('Image failed to load, using fallback');
      lightboxImg.src = 'assets/images/BOBM.jpg';
    };
    
    lightboxCaptionTitle.textContent = title;
    lightboxCaptionDesc.textContent = desc;
    
    // Disable scrolling when lightbox is open
    lenis.stop();
    
    console.log('Lightbox opened with image:', imgSrc);
  }
  
  // Close lightbox
  function closeLightbox() {
    // Remove active class first for smooth transition out
    lightboxModal.classList.remove('active');
    
    // Wait for transition to complete before hiding
    setTimeout(() => {
      lightboxModal.style.display = 'none';
      // Re-enable scrolling
      lenis.start();
    }, 300); // Match the transition duration in CSS
  }
  
  // Navigate to previous image
  function prevImage() {
    if (filteredItems.length === 0) return;
    
    currentIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
    openLightbox(currentIndex);
  }
  
  // Navigate to next image
  function nextImage() {
    if (filteredItems.length === 0) return;
    
    currentIndex = (currentIndex + 1) % filteredItems.length;
    openLightbox(currentIndex);
  }
  
  // Event listeners
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      const category = this.dataset.filter;
      filterGallery(category);
    });
  });
  
  // Add click event listeners to gallery items
  function addGalleryItemListeners() {
    galleryItems.forEach((item) => {
      item.addEventListener('click', function() {
        const index = filteredItems.indexOf(this);
        console.log('Gallery item clicked, index:', index);
        if (index !== -1) {
          openLightbox(index);
        }
      });
    });
  }
  
  // Call the function to add listeners
  addGalleryItemListeners();
  
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', prevImage);
  lightboxNext.addEventListener('click', nextImage);
  
  // Close lightbox with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      prevImage();
    } else if (e.key === 'ArrowRight') {
      nextImage();
    }
  });
  
  // Close lightbox when clicking outside the image
  lightboxModal.addEventListener('click', function(e) {
    if (e.target === lightboxModal) {
      closeLightbox();
    }
  });
  
  // Initialize
  function init() {
    console.log('Initializing gallery...');
    
    // Force show all photos on load and hide filter buttons
    document.querySelectorAll('.gallery-item').forEach(item => item.classList.add('active'));
    filterGallery('all');
    
    // Verify all gallery items have proper background images
    galleryItems.forEach(item => {
      const imgInner = item.querySelector('.gallery-item-img-inner');
      if (imgInner) {
        const bgImage = imgInner.style.backgroundImage;
        if (!bgImage || bgImage === 'none') {
          // Set a fallback background image if none exists
          imgInner.style.backgroundImage = 'url("assets/images/BOBM.jpg")';
          console.warn('Added fallback image to gallery item');
        }
      }
    });
    
    // Then initialize animations
    initAnimations();
    
    // Make sure all items are visible initially with a staggered animation
    galleryItems.forEach((item, index) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(50px)';
      setTimeout(() => {
        item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
        item.classList.add('show');
      }, 100 + (index * 50)); // Staggered delay based on index
    });
    
    console.log('Gallery initialized with', filteredItems.length, 'items');
  }
  
  // Run initialization
  setTimeout(() => {
    init();
  }, 500); // Small delay to ensure DOM is fully ready
  
  // Menu functionality (from existing site)
  const menuUzi = document.querySelector('.menuUzi');
  const actionMenuUzi = document.querySelector('.action--menuUzi');
  const actionClose = document.querySelector('.action--close');
  
  if (actionMenuUzi && actionClose && menuUzi) {
    actionMenuUzi.addEventListener('click', () => {
      menuUzi.classList.add('menuUzi--open');
    });
    
    actionClose.addEventListener('click', () => {
      menuUzi.classList.remove('menuUzi--open');
    });
  }
  
  // Scroll to top functionality
  const toTopButton = document.getElementById('toTop');
  
  if (toTopButton) {
    toTopButton.addEventListener('click', function(e) {
      e.preventDefault();
      lenis.scrollTo(0, { duration: 1.5 });
    });
  }
});