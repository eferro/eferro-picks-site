interface FilterChipProps {
  /** The content of the chip */
  children: React.ReactNode;
  /** Function called when the chip is clicked */
  onRemove: () => void;
  /** Visual variant of the chip */
  variant?: 'blue' | 'gray';
  /** Accessibility label for the chip */
  ariaLabel?: string;
}

export function FilterChip({ 
  children, 
  onRemove, 
  variant = 'blue',
  ariaLabel 
}: FilterChipProps) {
  const variantClasses = {
    blue: 'bg-blue-100 text-blue-800',
    gray: 'bg-gray-100 text-gray-800'
  };

  const closeButtonClasses = {
    blue: 'text-blue-600',
    gray: 'text-gray-600'
  };

  return (
    <button
      className={`break-words inline-flex items-center px-3 py-1 rounded-full text-sm ${variantClasses[variant]}`}
      onClick={onRemove}
      aria-label={ariaLabel}
    >
      {children}
      <span 
        className={`ml-2 ${closeButtonClasses[variant]}`}
        aria-hidden={ariaLabel ? 'true' : undefined}
      >
        ×
      </span>
    </button>
  );
}