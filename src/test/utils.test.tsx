import React from 'react';
import { describe, it, expect } from 'vitest';
import { validateComponentProps } from './utils';

const HelloComponent = ({ message }: { message: string }) => <div>{message}</div>;

describe('validateComponentProps', () => {
  it('returns success for valid props', () => {
    const result = validateComponentProps(HelloComponent, { message: 'Hi' });
    expect(result.success).toBe(true);
    expect(result.element.props.message).toBe('Hi');
  });
});
