import React, { useState, useEffect } from 'react';
import { MdOutlineEco } from 'react-icons/md';
import './FloatingButton.css';

const FloatingButton = ({ onClick, isOpen }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasClicked, setHasClicked] = useState(false);
  
  // Show tooltip if user hasn't clicked yet
  useEffect(() => {
    if (!hasClicked && !isOpen) {
      const tooltipTimer = setTimeout(() => {
        setShowTooltip(true);
        
        // Hide tooltip after 5 seconds
        const hideTimer = setTimeout(() => {
          setShowTooltip(false);
        }, 5000);
        
        return () => clearTimeout(hideTimer);
      }, 3000);
      
      return () => clearTimeout(tooltipTimer);
    }
  }, [hasClicked, isOpen]);
  
  const handleClick = () => {
    setHasClicked(true);
    setShowTooltip(false);
    onClick();
  };
  
  return (
    <button 
      className={`floating-button ${isOpen ? 'active' : ''} ${showTooltip ? 'show-tooltip' : ''}`} 
      onClick={handleClick}
      aria-label="Open Eco Inspector"
    >
      <MdOutlineEco size={24} />
      <span className="button-tooltip">Eco Inspector</span>
    </button>
  );
};

export default FloatingButton;