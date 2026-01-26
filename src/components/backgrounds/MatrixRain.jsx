import React, { useEffect, useRef } from 'react';

export default function MatrixRain() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Matrix rain characters (mix of numbers and katakana-like glyphs)
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    const charArray = chars.split('');

    // Number of columns
    const fontSize = 15;
    const columns = Math.floor(canvas.width / fontSize);
    
    // Array to track the y position of each drop
    const drops = Array(columns).fill(0);
    let frameCount = 0;
    const animationSpeed = 2; // Update every 2 frames (slower effect)

    const draw = () => {
      // Semi-transparent background for trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set font and color
      ctx.fillStyle = '#00ff00';
      ctx.font = `${fontSize}px monospace`;
      ctx.fontWeight = 'bold';

      // Draw characters
      for (let i = 0; i < drops.length; i++) {
        // Random character
        const char = charArray[Math.floor(Math.random() * charArray.length)];
        
        // X and Y coordinates
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Add glow effect
        ctx.shadowColor = 'rgba(0, 255, 0, 0.8)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Draw the character
        ctx.fillText(char, x, y);

        // Reset shadow
        ctx.shadowColor = 'transparent';

        // Move to next position (slower animation)
        if (frameCount % animationSpeed === 0) {
          drops[i]++;
        }

        // Reset to top if it goes off screen
        if (y > canvas.height && Math.random() > 0.95) {
          drops[i] = 0;
        }
      }

      frameCount++;
      requestAnimationFrame(draw);
    };

    draw();

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0, opacity: 0.8 }}
    />
  );
}