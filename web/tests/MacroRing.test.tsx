/**
 * Tests for the MacroRing component — progress calculation, rendering, and accessibility.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MacroRing } from '../components/MacroRing';

describe('MacroRing', () => {
  it('renders with correct aria-label', () => {
    render(<MacroRing label="Calories" value={500} goal={2000} color="#FF6B6B" unit="kcal" />);
    expect(screen.getByRole('meter', { name: /Calories: 500 of 2000 kcal/i })).toBeInTheDocument();
  });

  it('displays the value in the center', () => {
    render(<MacroRing label="Protein" value={30} goal={50} color="#74B9FF" unit="g" />);
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('displays the label below the ring', () => {
    render(<MacroRing label="Fiber" value={10} goal={25} color="#A8E6CF" unit="g" />);
    expect(screen.getByText('Fiber')).toBeInTheDocument();
  });

  it('shows correct percentage', () => {
    render(<MacroRing label="Carbs" value={125} goal={250} color="#FDCB6E" unit="g" />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('caps percentage display at 100%', () => {
    render(<MacroRing label="Calories" value={2500} goal={2000} color="#FF6B6B" unit="kcal" />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('shows 0% when value is 0', () => {
    render(<MacroRing label="Fat" value={0} goal={65} color="#A29BFE" unit="g" />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('has correct aria-valuenow attribute', () => {
    render(<MacroRing label="Calories" value={800} goal={2000} color="#FF6B6B" unit="kcal" />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '800');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '2000');
  });

  it('renders SVG element', () => {
    const { container } = render(
      <MacroRing label="Protein" value={40} goal={50} color="#74B9FF" unit="g" />
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders with custom size', () => {
    const { container } = render(
      <MacroRing label="Calories" value={500} goal={2000} color="#FF6B6B" unit="kcal" size={120} />
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '120');
    expect(svg).toHaveAttribute('height', '120');
  });

  it('handles goal of 0 gracefully', () => {
    render(<MacroRing label="Custom" value={50} goal={0} color="#A8E6CF" unit="g" />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
});
