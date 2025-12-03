import React from 'react';
import { render, screen } from '@testing-library/react';
import { MatchScoreGauge } from '../MatchScoreGauge'; // Adjust path as needed
import '@testing-library/jest-dom';

describe('MatchScoreGauge', () => {
  it('renders circular variant correctly with score and message', () => {
    render(<MatchScoreGauge score={85} showLabel showMessage variant="circular" size="md" />);

    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText(/Good match!/i)).toBeInTheDocument();
    const circularGauge = screen.getByTestId('circular-gauge-svg');
    expect(circularGauge).toBeInTheDocument();
  });

  it('renders horizontal variant correctly with score and message', () => {
    render(<MatchScoreGauge score={45} showLabel showMessage variant="horizontal" size="sm" />);

    expect(screen.getByText('45% Match')).toBeInTheDocument();
    expect(screen.getByText(/Low match./i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('applies correct color-coding for high score (green)', () => {
    render(<MatchScoreGauge score={95} variant="circular" />);
    const scoreElement = screen.getByText('95%');
    expect(scoreElement).toHaveClass('text-green-600');
  });

  it('applies correct color-coding for good score (blue)', () => {
    render(<MatchScoreGauge score={75} variant="circular" />);
    const scoreElement = screen.getByText('75%');
    expect(scoreElement).toHaveClass('text-blue-600');
  });

  it('applies correct color-coding for fair score (amber)', () => {
    render(<MatchScoreGauge score={55} variant="circular" />);
    const scoreElement = screen.getByText('55%');
    expect(scoreElement).toHaveClass('text-amber-600');
  });

  it('applies correct color-coding for low score (red)', () => {
    render(<MatchScoreGauge score={35} variant="circular" />);
    const scoreElement = screen.getByText('35%');
    expect(scoreElement).toHaveClass('text-red-600');
  });

  it('does not show label when showLabel is false', () => {
    render(<MatchScoreGauge score={70} showLabel={false} />);
    expect(screen.queryByText('70%')).not.toBeInTheDocument();
  });

  it('does not show message when showMessage is false', () => {
    render(<MatchScoreGauge score={70} showMessage={false} />);
    expect(screen.queryByText(/Good match!/i)).not.toBeInTheDocument();
  });

  it('handles score 0 correctly', () => {
    render(<MatchScoreGauge score={0} showLabel showMessage variant="circular" />);
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText(/Low match./i)).toBeInTheDocument();
    expect(screen.getByText('0%')).toHaveClass('text-red-600');
  });

  it('handles score 100 correctly', () => {
    render(<MatchScoreGauge score={100} showLabel showMessage variant="circular" />);
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText(/Excellent match!/i)).toBeInTheDocument();
    expect(screen.getByText('100%')).toHaveClass('text-green-600');
  });
});
