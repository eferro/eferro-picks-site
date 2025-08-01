import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  padding?: 'standard' | 'compact';
  width?: 'standard' | 'extended';
  className?: string;
  role?: string | undefined;
  'aria-label'?: string;
}

export function PageContainer(props: PageContainerProps) {
  const {
    children,
    padding = 'standard',
    width = 'standard',
    className = '',
    'aria-label': ariaLabel,
  } = props;
  // Base classes that are always applied
  const baseClasses = 'mx-auto px-4 sm:px-6 lg:px-8';
  
  // Padding variants
  const paddingClasses = {
    standard: 'py-12',
    compact: 'py-8',
  };
  
  // Width variants
  const widthClasses = {
    standard: 'max-w-7xl',
    extended: 'max-w-7xl 2xl:max-w-[96rem]',
  };
  
  // Combine all classes
  const containerClasses = [
    baseClasses,
    widthClasses[width],
    paddingClasses[padding],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const containerProps: React.HTMLAttributes<HTMLDivElement> = {
    className: containerClasses,
  };

  // Default to 'main' role unless explicitly overridden (including undefined)
  const shouldHaveRole = !('role' in props) || props.role !== undefined;
  const finalRole = 'role' in props ? props.role : 'main';
  
  if (shouldHaveRole && finalRole !== undefined) {
    containerProps.role = finalRole;
    if (ariaLabel) {
      containerProps['aria-label'] = ariaLabel;
    }
  }

  return <div {...containerProps}>{children}</div>;
}