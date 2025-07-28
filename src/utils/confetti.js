/**
 * Simple confetti effect for celebrating moments
 */
const confetti = () => {
  const colors = ['#553C9A', '#805AD5', '#B794F4', '#9F7AEA', '#D6BCFA'];
  const confettiCount = 100;
  
  const createConfettiElement = () => {
    const confetti = document.createElement('div');
    const size = Math.floor(Math.random() * 10) + 5; // 5-15px
    
    confetti.style.position = 'fixed';
    confetti.style.zIndex = '9999';
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    confetti.style.opacity = Math.random();
    confetti.style.pointerEvents = 'none';
    
    // Set initial position (centered horizontally, at the top)
    const startPositionX = window.innerWidth / 2;
    confetti.style.left = `${startPositionX}px`;
    confetti.style.top = '0';
    
    document.body.appendChild(confetti);
    
    return confetti;
  };
  
  const animateConfetti = (confetti) => {
    // Random horizontal spread
    const spreadX = (Math.random() - 0.5) * window.innerWidth * 0.8;
    // Random final position
    const endX = window.innerWidth / 2 + spreadX;
    const endY = window.innerHeight * (0.7 + Math.random() * 0.3); // Bottom 30-100% of screen
    
    // Random duration
    const duration = 1000 + Math.random() * 2000; // 1-3 seconds
    
    const animation = confetti.animate(
      [
        { transform: 'translate(0, 0) rotate(0)', opacity: 1 },
        { transform: `translate(${spreadX}px, ${endY}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
      ],
      {
        duration: duration,
        easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)',
        fill: 'forwards'
      }
    );
    
    animation.onfinish = () => {
      confetti.remove();
    };
  };
  
  // Create and animate the confetti
  for (let i = 0; i < confettiCount; i++) {
    setTimeout(() => {
      const confettiElement = createConfettiElement();
      animateConfetti(confettiElement);
    }, Math.random() * 500); // Stagger the confetti creation
  }
};

export default confetti;