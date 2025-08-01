interface ErrorMessageProps {
  /** The error message to display */
  message: string;
  /** Disable container wrapper */
  noContainer?: boolean;
  /** Additional CSS classes for the message */
  className?: string;
  /** Additional CSS classes for the container */
  containerClassName?: string;
}

export function ErrorMessage({ 
  message, 
  noContainer = false, 
  className = '',
  containerClassName = ''
}: ErrorMessageProps) {
  const messageElement = (
    <p className={`text-red-600 ${className}`}>
      {message}
    </p>
  );

  if (noContainer) {
    return messageElement;
  }

  return (
    <div 
      data-testid="error-container"
      className={`text-center py-12 ${containerClassName}`}
    >
      {messageElement}
    </div>
  );
}