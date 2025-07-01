document.addEventListener('DOMContentLoaded', function() {
  // Register ScrollTrigger plugin if not already registered globally
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Get the hero title elements
  const hyperElement = document.querySelector('.hyper');
  const criticalElement = document.querySelector('.critical');
  
  if (!hyperElement || !criticalElement) return;
  
  // Store the original text
  const hyperText = "Obskura";
  const criticalText = " "; // Adding the word "Studios" after Obskura
  
  // Clear the text initially
  hyperElement.textContent = '';
  criticalElement.textContent = '';
  
  // Make elements visible but still empty
  setTimeout(() => {
    hyperElement.style.opacity = '1';
    hyperElement.style.visibility = 'visible';
    criticalElement.style.opacity = '1';
    criticalElement.style.visibility = 'visible';
  }, 4900); // Just before typing starts
  
  // Function to type text character by character
  function typeText(element, text, speed, callback) {
    let i = 0;
    const interval = setInterval(() => {
      element.textContent += text.charAt(i);
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        if (callback) callback();
      }
    }, speed);
  }
  
  // Start typing effect after 5 seconds
  setTimeout(() => {
    // Type the first part
    typeText(hyperElement, hyperText, 150, () => {
      // Then type the second part
      typeText(criticalElement, criticalText, 150);
    });
  }, 5000); // 5 seconds delay

  // New typing effect for "Working Worldwide"
  const workingTextElement = document.getElementById('working-text');
  const worldwideTextElement = document.getElementById('worldwide-text');

  if (workingTextElement && worldwideTextElement) {
    const originalWorkingText = workingTextElement.textContent;
    const originalWorldwideText = worldwideTextElement.textContent;

    workingTextElement.textContent = ''; // Clear text initially
    worldwideTextElement.textContent = ''; // Clear text initially

    // Use ScrollTrigger to start the typing effect when the element enters the viewport
    ScrollTrigger.create({
      trigger: worldwideTextElement.parentElement, // Trigger when the parent container enters view
      start: 'top bottom-=50px', // Start when the top of the trigger is 50px from the bottom of the viewport
      once: true, // Only play the animation once
      onEnter: () => {
        typeText(workingTextElement, originalWorkingText, 100, () => {
          typeText(worldwideTextElement, originalWorldwideText, 100);
        });
      }
    });
  }
});