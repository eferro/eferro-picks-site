import React from 'react';

interface CustomColors {
  background: string;
  text: string;
  hover: string;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'toggle' | 'tag' | 'dropdown' | 'custom';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  shape?: 'rounded' | 'pill';
  active?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  customColors?: CustomColors;
  className?: string;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  shape = 'rounded',
  active = false,
  icon,
  iconPosition = 'left',
  customColors,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  // Base classes that are always applied
  const baseClasses = 'inline-flex items-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';
  
  // Size variants
  const sizeClasses = {
    xs: 'px-3 py-0.5 text-sm',
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-4 py-2 text-base',
  };
  
  // Shape variants
  const shapeClasses = {
    rounded: 'rounded-md',
    pill: 'rounded-full',
  };
  
  // Variant color classes
  const getVariantClasses = () => {
    if (variant === 'custom' && customColors) {
      return `${customColors.background} ${customColors.text} ${customColors.hover}`;
    }
    
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 text-white hover:bg-blue-700 border border-transparent shadow-sm';
        
      case 'toggle':
        return active 
          ? 'bg-blue-500 text-white'
          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50';
          
      case 'tag':
        return active
          ? 'bg-blue-500 text-white'
          : 'bg-blue-50 text-blue-700 hover:bg-blue-100';
          
      case 'dropdown':
        return 'bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 justify-center w-full gap-x-1.5 font-semibold';
        
      default:
        return 'bg-gray-100 text-gray-900 hover:bg-gray-200';
    }
  };
  
  // Icon sizing based on button size
  const getIconClasses = () => {
    const iconSize = size === 'xs' || size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
    const spacing = iconPosition === 'right' ? 'ml-2' : 'mr-2';
    return `${iconSize} ${spacing}`;
  };
  
  // Disabled state classes
  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed' 
    : '';
  
  // Combine all classes
  const buttonClasses = [
    baseClasses,
    sizeClasses[size],
    shapeClasses[shape],
    getVariantClasses(),
    disabledClasses,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Clone icon with proper classes if provided
  const renderIcon = () => {
    if (!icon) return null;
    
    return React.cloneElement(icon as React.ReactElement, {
      className: getIconClasses(),
      'aria-hidden': 'true',
    });
  };

  return (
    <button
      className={buttonClasses}
      disabled={disabled}
      {...props}
    >
      {iconPosition === 'left' && renderIcon()}
      {children}
      {iconPosition === 'right' && renderIcon()}
    </button>
  );
}