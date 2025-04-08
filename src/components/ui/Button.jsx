
import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  ...props 
}) => {
  const baseStyle = "rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50";
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 focus:ring-gray-400 text-gray-800",
    danger: "bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white",
    success: "bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white",
  };
  
  const sizes = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };
  
  const disabledStyle = disabled ? "opacity-50 cursor-not-allowed" : "";
  
  const classes = `${baseStyle} ${variants[variant]} ${sizes[size]} ${disabledStyle} ${className}`;
  
  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
