import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DistributionSelector, DistributionType } from '../../src/taskpane/components/DistributionSelector';

describe('DistributionSelector', () => {
  const mockOnSelectDistribution = jest.fn();

  beforeEach(() => {
    mockOnSelectDistribution.mockClear();
  });

  describe('Rendering', () => {
    it('should render the component', () => {
      render(
        <DistributionSelector
          selectedDistribution={null}
          onSelectDistribution={mockOnSelectDistribution}
        />
      );

      expect(screen.getByText('Continuous Distributions')).toBeInTheDocument();
      expect(screen.getByText('Discrete Distributions')).toBeInTheDocument();
    });

    it('should render all 10 continuous distributions', () => {
      render(
        <DistributionSelector
          selectedDistribution={null}
          onSelectDistribution={mockOnSelectDistribution}
        />
      );

      // Continuous distributions
      expect(screen.getByText('Normal')).toBeInTheDocument();
      expect(screen.getByText('Uniform')).toBeInTheDocument();
      expect(screen.getByText('Triangular')).toBeInTheDocument();
      expect(screen.getByText('Log-Normal')).toBeInTheDocument();
      expect(screen.getByText('Exponential')).toBeInTheDocument();
      expect(screen.getByText('Beta')).toBeInTheDocument();
      expect(screen.getByText('Gamma')).toBeInTheDocument();
      expect(screen.getByText('Weibull')).toBeInTheDocument();
      expect(screen.getByText('Pareto')).toBeInTheDocument();
      expect(screen.getByText('PERT')).toBeInTheDocument();
    });

    it('should render all 4 discrete distributions', () => {
      render(
        <DistributionSelector
          selectedDistribution={null}
          onSelectDistribution={mockOnSelectDistribution}
        />
      );

      // Discrete distributions
      expect(screen.getByText('Binomial')).toBeInTheDocument();
      expect(screen.getByText('Poisson')).toBeInTheDocument();
      expect(screen.getByText('Geometric')).toBeInTheDocument();
      expect(screen.getByText('Hypergeometric')).toBeInTheDocument();
    });

    it('should render distribution descriptions', () => {
      render(
        <DistributionSelector
          selectedDistribution={null}
          onSelectDistribution={mockOnSelectDistribution}
        />
      );

      expect(screen.getByText('Bell-shaped, symmetric distribution')).toBeInTheDocument();
      expect(screen.getByText('Equal probability across range')).toBeInTheDocument();
      expect(screen.getByText('Simple three-point estimate')).toBeInTheDocument();
      expect(screen.getByText('Success/failure trials')).toBeInTheDocument();
    });

    it('should render distribution icons with correct alt text', () => {
      render(
        <DistributionSelector
          selectedDistribution={null}
          onSelectDistribution={mockOnSelectDistribution}
        />
      );

      const normalIcon = screen.getByAltText('Normal');
      expect(normalIcon).toBeInTheDocument();
      expect(normalIcon).toHaveAttribute('src', '/assets/distributions/dist-normal-48.png');
      // Note: Fluent UI Image component sets dimensions via style, not attributes
    });
  });

  describe('Selection', () => {
    it('should call onSelectDistribution when a distribution is clicked', () => {
      render(
        <DistributionSelector
          selectedDistribution={null}
          onSelectDistribution={mockOnSelectDistribution}
        />
      );

      // Use exact match to avoid matching "Log-Normal"
      const normalButton = screen.getByRole('button', { name: /^Normal NormalBell-shaped/i });
      fireEvent.click(normalButton);

      expect(mockOnSelectDistribution).toHaveBeenCalledTimes(1);
      expect(mockOnSelectDistribution).toHaveBeenCalledWith('normal');
    });

    it('should highlight the selected distribution', () => {
      render(
        <DistributionSelector
          selectedDistribution="normal"
          onSelectDistribution={mockOnSelectDistribution}
        />
      );

      const normalButton = screen.getByRole('button', { name: /^Normal NormalBell-shaped/i });
      expect(normalButton).toHaveClass('selected');
    });

    it('should not highlight unselected distributions', () => {
      render(
        <DistributionSelector
          selectedDistribution="normal"
          onSelectDistribution={mockOnSelectDistribution}
        />
      );

      const uniformButton = screen.getByRole('button', { name: /UniformEqual probability/i });
      expect(uniformButton).not.toHaveClass('selected');
    });

    it('should allow changing the selected distribution', () => {
      const { rerender } = render(
        <DistributionSelector
          selectedDistribution="normal"
          onSelectDistribution={mockOnSelectDistribution}
        />
      );

      const uniformButton = screen.getByRole('button', { name: /UniformEqual probability/i });
      fireEvent.click(uniformButton);

      expect(mockOnSelectDistribution).toHaveBeenCalledWith('uniform');

      // Simulate parent component updating selectedDistribution prop
      rerender(
        <DistributionSelector
          selectedDistribution="uniform"
          onSelectDistribution={mockOnSelectDistribution}
        />
      );

      expect(uniformButton).toHaveClass('selected');
      const normalButton = screen.getByRole('button', { name: /^Normal NormalBell-shaped/i });
      expect(normalButton).not.toHaveClass('selected');
    });
  });

  describe('All Distribution Types', () => {
    const allDistributions: DistributionType[] = [
      'normal',
      'uniform',
      'triangular',
      'lognormal',
      'exponential',
      'beta',
      'gamma',
      'weibull',
      'pareto',
      'pert',
      'binomial',
      'poisson',
      'geometric',
      'hypergeometric'
    ];

    it.each(allDistributions)('should handle selection of %s distribution', (distribution) => {
      render(
        <DistributionSelector
          selectedDistribution={distribution}
          onSelectDistribution={mockOnSelectDistribution}
        />
      );

      // Find the button that contains the distribution name
      const buttons = screen.getAllByRole('button');
      const selectedButton = buttons.find(button =>
        button.classList.contains('selected')
      );

      expect(selectedButton).toBeDefined();
      expect(selectedButton).toHaveClass('distribution-card');
      expect(selectedButton).toHaveClass('selected');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button roles', () => {
      render(
        <DistributionSelector
          selectedDistribution={null}
          onSelectDistribution={mockOnSelectDistribution}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(14); // 10 continuous + 4 discrete
    });

    it('should have proper image alt attributes', () => {
      render(
        <DistributionSelector
          selectedDistribution={null}
          onSelectDistribution={mockOnSelectDistribution}
        />
      );

      expect(screen.getByAltText('Normal')).toBeInTheDocument();
      expect(screen.getByAltText('Uniform')).toBeInTheDocument();
      expect(screen.getByAltText('Binomial')).toBeInTheDocument();
    });

    it('should allow keyboard navigation', () => {
      render(
        <DistributionSelector
          selectedDistribution={null}
          onSelectDistribution={mockOnSelectDistribution}
        />
      );

      const normalButton = screen.getByRole('button', { name: /^Normal NormalBell-shaped/i });

      // Tab to the button
      normalButton.focus();
      expect(normalButton).toHaveFocus();

      // Fluent UI's DefaultButton handles keyboard activation automatically
    });
  });

  describe('Edge Cases', () => {
    it('should handle null selectedDistribution', () => {
      render(
        <DistributionSelector
          selectedDistribution={null}
          onSelectDistribution={mockOnSelectDistribution}
        />
      );

      const buttons = screen.getAllByRole('button');
      const selectedButtons = buttons.filter(button =>
        button.classList.contains('selected')
      );

      expect(selectedButtons).toHaveLength(0);
    });

    it('should render correctly with no selection', () => {
      const { container } = render(
        <DistributionSelector
          selectedDistribution={null}
          onSelectDistribution={mockOnSelectDistribution}
        />
      );

      const distributionCards = container.querySelectorAll('.distribution-card');
      expect(distributionCards).toHaveLength(14);
    });

    it('should not crash when clicking the same distribution twice', () => {
      render(
        <DistributionSelector
          selectedDistribution="normal"
          onSelectDistribution={mockOnSelectDistribution}
        />
      );

      const normalButton = screen.getByRole('button', { name: /^Normal NormalBell-shaped/i });

      fireEvent.click(normalButton);
      fireEvent.click(normalButton);

      expect(mockOnSelectDistribution).toHaveBeenCalledTimes(2);
      expect(mockOnSelectDistribution).toHaveBeenCalledWith('normal');
    });
  });

  describe('CSS Classes', () => {
    it('should apply correct CSS classes to cards', () => {
      const { container } = render(
        <DistributionSelector
          selectedDistribution="normal"
          onSelectDistribution={mockOnSelectDistribution}
        />
      );

      const cards = container.querySelectorAll('.distribution-card');
      expect(cards.length).toBe(14);

      const selectedCard = container.querySelector('.distribution-card.selected');
      expect(selectedCard).toBeInTheDocument();
    });

    it('should apply grid class to distribution containers', () => {
      const { container } = render(
        <DistributionSelector
          selectedDistribution={null}
          onSelectDistribution={mockOnSelectDistribution}
        />
      );

      const grids = container.querySelectorAll('.distribution-grid');
      expect(grids).toHaveLength(2); // One for continuous, one for discrete
    });
  });
});
