import React, { useState } from 'react';
import './ImageMagnifier.css';

export default function ImageMagnifier({ src, zoomLevel = 2.5 }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const el = e.currentTarget;
    const { top, left, width, height } = el.getBoundingClientRect();
    
    // calculate cursor position on the image
    const x = e.pageX - left - window.pageXOffset;
    const y = e.pageY - top - window.pageYOffset;

    // prevent magnifier from going outside bounds
    if (x < 0 || y < 0 || x > width || y > height) {
      setShowMagnifier(false);
      return;
    }

    setCursorPosition({ x, y });
    
    // background position for magnifier
    setPosition({
      x: (x / width) * 100,
      y: (y / height) * 100
    });
    setShowMagnifier(true);
  };

  return (
    <div 
      className="img-magnifier-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowMagnifier(false)}
    >
      <img src={src} className="img-magnifier-img" alt="Product" />
      <div 
        className="img-magnifier-glass"
        style={{
          display: showMagnifier ? 'block' : 'none',
          left: `${cursorPosition.x - 75}px`, // 75 is half of width (150)
          top: `${cursorPosition.y - 75}px`,
          backgroundImage: `url(${src})`,
          backgroundSize: `${100 * zoomLevel}%`,
          backgroundPosition: `${position.x}% ${position.y}%`
        }}
      />
    </div>
  );
}
