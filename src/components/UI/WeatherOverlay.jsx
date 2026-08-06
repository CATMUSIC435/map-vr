import React, { useEffect, useRef } from 'react';
import useMapStore from '../../store/useMapStore';

export default function WeatherOverlay() {
  const canvasRef = useRef(null);
  const { weatherMode } = useMapStore(); // 'none', 'rain', 'snow'

  useEffect(() => {
    if (weatherMode === 'none' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Initialize particles
    const particleCount = weatherMode === 'snow' ? 200 : 500;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        opacity: Math.random(),
        speedX: weatherMode === 'snow' ? (Math.random() - 0.5) * 1 : (Math.random() - 0.5) * 0.5 - 1,
        speedY: weatherMode === 'snow' ? Math.random() * 2 + 1 : Math.random() * 10 + 15,
        radius: weatherMode === 'snow' ? Math.random() * 2 + 1 : Math.random() * 1 + 0.5,
        length: weatherMode === 'rain' ? Math.random() * 15 + 10 : 0
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        ctx.beginPath();
        if (weatherMode === 'snow') {
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        } else if (weatherMode === 'rain') {
          ctx.strokeStyle = `rgba(200, 220, 255, ${p.opacity})`;
          ctx.lineWidth = p.radius;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.speedX, p.y + p.length);
          ctx.stroke();
        }
        
        // Move particles
        p.x += p.speedX;
        p.y += p.speedY;

        // Reset if off screen
        if (p.y > canvas.height) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
        if (p.x > canvas.width) p.x = 0;
        if (p.x < 0) p.x = canvas.width;
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [weatherMode]);

  if (weatherMode === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 45 // Below UI elements which are 50+
      }}
    />
  );
}
