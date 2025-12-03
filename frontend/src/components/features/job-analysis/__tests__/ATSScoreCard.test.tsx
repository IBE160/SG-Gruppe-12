// frontend/src/components/features/job-analysis/__tests__/ATSScoreCard.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ATSScoreCard from '../ATSScoreCard'; // Adjust import path if necessary

describe('ATSScoreCard', () => {
  const defaultProps = {
    score: 85,
    suggestions: ['Improve formatting', 'Add quantifiable achievements'],
    qualitativeRating: 'Good' as const,
    showDetails: false,
  };

  it('renders correctly with essential props', () => {
    render(<ATSScoreCard {...defaultProps} />);
    expect(screen.getByText('ATS Compatibility Score')).toBeInTheDocument();
    expect(screen.getByText('Good')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('Improvement Suggestions:')).toBeInTheDocument();
    expect(screen.getByText('Improve formatting')).toBeInTheDocument();
  });

  it('does not show suggestions if none are provided', () => {
    render(<ATSScoreCard {...defaultProps} suggestions={[]} />);
    expect(screen.queryByText('Improvement Suggestions:')).not.toBeInTheDocument();
  });

  it('displays detailed breakdown when showDetails is true and atsBreakdown is provided', () => {
    const detailedProps = {
      ...defaultProps,
      showDetails: true,
      atsBreakdown: {
        keywordDensityScore: 70,
        formattingScore: 90,
        sectionCompletenessScore: 80,
        quantifiableAchievementsScore: 75,
      },
    };
    render(<ATSScoreCard {...detailedProps} />);
    expect(screen.getByText('Detailed Breakdown:')).toBeInTheDocument();
    expect(screen.getByText('Keyword Density:')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  it('does not display detailed breakdown when showDetails is false', () => {
    const detailedProps = {
      ...defaultProps,
      showDetails: false,
      atsBreakdown: {
        keywordDensityScore: 70,
        formattingScore: 90,
        sectionCompletenessScore: 80,
        quantifiableAchievementsScore: 75,
      },
    };
    render(<ATSScoreCard {...detailedProps} />);
    expect(screen.queryByText('Detailed Breakdown:')).not.toBeInTheDocument();
  });

  it('applies correct styling for different score ranges', () => {
    const { rerender } = render(<ATSScoreCard {...defaultProps} score={95} qualitativeRating="Excellent" />);
    expect(screen.getByText('Excellent')).toHaveClass('bg-green-500');
    expect(screen.getByText('95%')).toHaveClass('text-green-500');

    rerender(<ATSScoreCard {...defaultProps} score={70} qualitativeRating="Fair" />);
    expect(screen.getByText('Fair')).toHaveClass('bg-orange-500');
    expect(screen.getByText('70%')).toHaveClass('text-orange-500');

    rerender(<ATSScoreCard {...defaultProps} score={50} qualitativeRating="Poor" />);
    expect(screen.getByText('Poor')).toHaveClass('bg-red-500');
    expect(screen.getByText('50%')).toHaveClass('text-red-500');
  });
});
