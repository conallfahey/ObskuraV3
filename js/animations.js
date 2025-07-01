// Framer Motion animations for index page
window.addEventListener('load', () => {
  // Check if Framer Motion is loaded
  if (typeof motion === 'undefined') {
    console.error('Framer Motion library not found. Make sure it is included in your HTML.');
    return;
  }

  const animatedElements = document.querySelectorAll('.animated-element');

  if (animatedElements.length > 0) {
    const observer = new IntersectionObserver((entries, observerInstance) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          // Use Framer Motion's animate function
          motion.animate(
            element, 
            { 
              opacity: 1, 
              y: 0 
            }, 
            { 
              duration: 0.6, 
              ease: "easeOut" 
            }
          );
          observerInstance.unobserve(element); // Stop observing once animated
        }
      });
    }, { threshold: 0.1 }); // Trigger when 10% of the element is visible

    animatedElements.forEach(element => {
      observer.observe(element);
    });
  } else {
    console.log('No elements with class "animated-element" found.');
  }
});