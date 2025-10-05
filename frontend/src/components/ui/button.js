import React from "react";

const Button = ({ className = "", children, ...props }) => (
  <button
    className={`button ${className}`}
    {...props}
  >
    {children}
  </button>
);

export { Button };
