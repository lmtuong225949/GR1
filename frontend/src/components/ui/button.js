import React from "react";
import "./styles/Button.css";

const Button = ({ className = "", children, ...props }) => (
  <button
    className={`button ${className}`}
    {...props}
  >
    {children}
  </button>
);

export { Button };
