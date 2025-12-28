import React from 'react';
import './styles/Card.css';

const Card = ({ 
  children, 
  className = '',
  onClick,
  ...props 
}) => {
  const classes = [
    'card',
    onClick ? 'card--clickable' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={classes}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div className={`card__content ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
export { Card, CardContent };
