interface LoadingSpinnerProps {
  /** Add accessibility role (e.g., 'status') */
  role?: string;
  /** Disable container wrapper */
  noContainer?: boolean;
  /** Additional CSS classes for the spinner */
  className?: string;
}

export function LoadingSpinner({ 
  role, 
  noContainer = false, 
  className = '' 
}: LoadingSpinnerProps) {
  const spinnerElement = (
    <div 
      data-testid="loading-spinner"
      role={role}
      className={`animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 ${className}`}
    />
  );

  if (noContainer) {
    return spinnerElement;
  }

  return (
    <div 
      data-testid="loading-container"
      className="flex justify-center items-center py-12"
    >
      {spinnerElement}
    </div>
  );
}