// Import the necessary function for preloading images
import { preloadImages } from './utils.js';

// Define a variable that will store the Lenis smooth scrolling object
let lenis;

// Get the grid element
const grid = document.querySelector('.grid');

// Get all grid items within the grid
const gridItems = document.querySelectorAll('.grid__item');

// Function to initialize Lenis for smooth scrolling
const initSmoothScrolling = () => {
	// Instantiate the Lenis object with specified properties
	lenis = new Lenis({
		lerp: 0.15, // Lower values create a smoother scroll effect
		smoothWheel: true // Enables smooth scrolling for mouse wheel events
	});

	// Update ScrollTrigger each time the user scrolls
	lenis.on('scroll', () => ScrollTrigger.update());

	// Define a function to run at each animation frame
	const scrollFn = (time) => {
		lenis.raf(time); // Run Lenis' requestAnimationFrame method
		requestAnimationFrame(scrollFn); // Recursively call scrollFn on each frame
	};
	// Start the animation frame loop
	requestAnimationFrame(scrollFn);
};

const scroll = () => {
	const viewportHeight = window.innerHeight;
	const endValue = viewportHeight / 2;

	// Loop through each grid item to add animations
	gridItems.forEach((item, index) => {
		// Get the previous element sibling for the current item
		const previousElementSibling = item.previousElementSibling;
		// Determine if the current item is on the left side based on its position relative to the previous item
		const isLeftSide = previousElementSibling && (item.offsetLeft + item.offsetWidth <= previousElementSibling.offsetLeft + 1);
		// Determine the origin for transformations (either 100 or 0 depending on position)
		const originX = isLeftSide ? 100 : 0;

		gsap
		.timeline({
			defaults: {
				duration: 1,
				ease: 'power3'
			},
			scrollTrigger: {
				trigger: item,
				start: 'top bottom',
				end: '+=100%',
				scrub: true
			}
		})
		.set(item, {perspective: 500}, 0)
		.fromTo(item.querySelector('.grid__item-img'), {
			rotationY: isLeftSide ? -90 : 90,
			transformOrigin: `${originX}% 0%`
		}, {
			rotationY: 0
		}, 0)
		.fromTo(item.querySelector('.grid__item-img-inner'), {
			scale: 2,
			transformOrigin: `${originX}% 0%`
		}, {
			scale: 1
		}, 0)
		.fromTo(item.querySelector('.grid__item-caption'), {
			rotationY: isLeftSide ? 120 : -120,
			transformOrigin: `${originX}% 0%`
		}, {
			ease: 'power1',
			rotationY: 0
		}, 0);
	});
}

// Preload images, initialize smooth scrolling, apply scroll-triggered animations, and remove loading class from body
preloadImages('.grid__item-img-inner').then(() => {
	initSmoothScrolling();
	scroll();
	document.body.classList.remove('loading');
	
	// Add event listener for "Get In Touch" button after DOM is ready
	const getInTouchButton = document.getElementById('get-in-touch-button');
	if (getInTouchButton) {
		getInTouchButton.addEventListener('click', (e) => {
			e.preventDefault();
			const contactSection = document.getElementById('contact-section');
			if (contactSection) {
				const offsetTop = contactSection.offsetTop - 80; // 80px offset to prevent scrolling too far
				window.scrollTo({
					top: offsetTop,
					behavior: 'smooth'
				});
			}
		});
	}
});