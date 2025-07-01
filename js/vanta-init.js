document.addEventListener('DOMContentLoaded', function() {
  const worldwideSection = document.querySelector('.global-video-section');
  
  if (worldwideSection) {
    // Make sure VANTA is available
    if (typeof VANTA !== 'undefined' && VANTA.CLOUDS) {
      // Initialize Vanta clouds effect
      VANTA.CLOUDS({
        el: worldwideSection,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        skyColor: 0x2b82a1,
        cloudColor: 0xedb9ae,
        cloudShadowColor: 0x113456,
        sunColor: 0xffb43f
      });
      
      // Add a class to the section for additional styling if needed
      worldwideSection.classList.add('vanta-clouds-bg');
      console.log('Vanta clouds initialized successfully');
    } else {
      console.error('VANTA.CLOUDS not available. Check if Three.js and Vanta.js are loaded correctly.');
    }
  } else {
    console.error('Could not find .global-video-section element');
  }
});