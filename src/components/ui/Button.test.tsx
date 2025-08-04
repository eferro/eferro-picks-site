import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DocumentTextIcon, PlayIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';

describe('Button', () => {
  describe('Basic Rendering', () => {
    it('renders children with default styling', () => {
      render(<Button>Test Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Test Button');
      expect(button).toHaveClass('inline-flex', 'items-center', 'px-4', 'py-2', 'rounded-md', 'text-sm');
    });

    it('applies custom className', () => {
      render(<Button className="custom-class">Test</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('handles click events', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('supports disabled state', () => {
      const handleClick = vi.fn();
      render(<Button disabled onClick={handleClick}>Disabled</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Variants', () => {
    it('applies primary variant styling', () => {
      render(<Button variant="primary">Primary</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-600', 'text-white', 'hover:bg-blue-700');
    });

    it('applies toggle variant styling when active', () => {
      render(<Button variant="toggle" active>Active Toggle</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-500', 'text-white');
    });

    it('applies toggle variant styling when inactive', () => {
      render(<Button variant="toggle">Inactive Toggle</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-white', 'text-gray-700', 'border', 'border-gray-300', 'hover:bg-gray-50');
    });

    it('applies tag variant styling when active', () => {
      render(<Button variant="tag" active>Active Tag</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-500', 'text-white');
    });

    it('applies tag variant styling when inactive', () => {
      render(<Button variant="tag">Inactive Tag</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-50', 'text-blue-700', 'hover:bg-blue-100');
    });

    it('applies dropdown variant styling', () => {
      render(<Button variant="dropdown">Dropdown</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-white', 'text-gray-900', 'shadow-sm', 'ring-1', 'ring-inset', 'ring-gray-300');
    });
  });

  describe('Sizes', () => {
    it('applies small size styling', () => {
      render(<Button size="sm">Small</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-3', 'py-1', 'text-sm');
    });

    it('applies medium size styling (default)', () => {
      render(<Button size="md">Medium</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2', 'text-sm');
    });

    it('applies large size styling', () => {
      render(<Button size="lg">Large</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2', 'text-base');
    });

    it('applies extra small size styling', () => {
      render(<Button size="xs">Extra Small</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-3', 'py-0.5', 'text-sm');
    });
  });

  describe('Shape', () => {
    it('applies rounded shape by default', () => {
      render(<Button>Rounded</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('rounded-md');
    });

    it('applies pill shape', () => {
      render(<Button shape="pill">Pill</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('rounded-full');
    });
  });

  describe('Icons', () => {
    it('renders left icon with proper spacing', () => {
      render(
        <Button icon={<DocumentTextIcon data-testid="icon" />}>
          With Icon
        </Button>
      );
      
      const icon = screen.getByTestId('icon');

      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('h-5', 'w-5', 'mr-2');
    });

    it('renders right icon with proper spacing', () => {
      render(
        <Button icon={<PlayIcon data-testid="icon" />} iconPosition="right">
          With Right Icon
        </Button>
      );
      
      const icon = screen.getByTestId('icon');
      expect(icon).toHaveClass('h-5', 'w-5', 'ml-2');
    });

    it('adjusts icon size for small buttons', () => {
      render(
        <Button size="sm" icon={<DocumentTextIcon data-testid="icon" />}>
          Small With Icon  
        </Button>
      );
      
      const icon = screen.getByTestId('icon');
      expect(icon).toHaveClass('h-4', 'w-4', 'mr-2');
    });
  });

  describe('Custom Colors', () => {
    it('applies custom color scheme', () => {
      render(
        <Button 
          variant="custom" 
          customColors={{
            background: 'bg-green-600',
            text: 'text-white',
            hover: 'hover:bg-green-700'
          }}
        >
          Custom Color
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-green-600', 'text-white', 'hover:bg-green-700');
    });
  });

  describe('Accessibility', () => {
    it('supports aria-label', () => {
      render(<Button aria-label="Custom label">Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Custom label');
    });

    it('supports aria-pressed for toggle buttons', () => {
      render(<Button variant="toggle" active aria-pressed>Toggle</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed');
    });
  });
});