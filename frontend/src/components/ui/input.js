import React from 'react';

const Input = ({ 
  type = 'text',
  value,
  onChange,
  placeholder,
  className = '',
  disabled = false,
  ...props
}) => {
  const classes = [
    'input',
    disabled ? 'input--disabled' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <input
      type={type}
      className={classes}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      {...props}
    />
  );
};

export default Input;
export { Input };
