import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ResultsDashboard, SimulationResults } from '../../src/taskpane/components/ResultsDashboard';

describe('ResultsDashboard', () => {
  const mockResults: SimulationResults = {
    samples: Array.from({ length: 1000 }, (_, i) => 100 + (i - 500) / 10), // Normal-ish distribution around 100
    mean: 100.25,
    median: 99.87,
    stddev: 15.03,
    min: 45.23,
    max: 155.67,
    p5: 75.12,
    p25: 89.45,
    p50: 99.87,
    p75: 110.23,
    p95: 125.89
  };

  describe('No Results State', () => {
    it('should show placeholder message when results is null', () => {
      render(<ResultsDashboard results={null} />);

      expect(screen.getByText(/No results yet/i)).toBeInTheDocument();
      expect(screen.getByText(/Run a simulation to see results here/i)).toBeInTheDocument();
    });

    it('should not show statistics when results is null', () => {
      render(<ResultsDashboard results={null} />);

      expect(screen.queryByText('Simulation Results')).not.toBeInTheDocument();
      expect(screen.queryByText('Mean')).not.toBeInTheDocument();
    });

    it('should apply no-results CSS class', () => {
      const { container } = render(<ResultsDashboard results={null} />);

      expect(container.querySelector('.no-results')).toBeInTheDocument();
    });
  });

  describe('Summary Statistics', () => {
    it('should render the dashboard title', () => {
      render(<ResultsDashboard results={mockResults} />);

      expect(screen.getByText('Simulation Results')).toBeInTheDocument();
    });

    it('should display mean statistic', () => {
      render(<ResultsDashboard results={mockResults} />);

      expect(screen.getByText('Mean')).toBeInTheDocument();
      expect(screen.getByText('100.25')).toBeInTheDocument();
    });

    it('should display median statistic', () => {
      render(<ResultsDashboard results={mockResults} />);

      expect(screen.getByText('Median')).toBeInTheDocument();
      expect(screen.getAllByText('99.87')).toHaveLength(2); // Appears in Median and P50
    });

    it('should display standard deviation statistic', () => {
      render(<ResultsDashboard results={mockResults} />);

      expect(screen.getByText('Std Dev')).toBeInTheDocument();
      expect(screen.getByText('15.03')).toBeInTheDocument();
    });

    it('should display min statistic', () => {
      render(<ResultsDashboard results={mockResults} />);

      expect(screen.getByText('Min')).toBeInTheDocument();
      expect(screen.getByText('45.23')).toBeInTheDocument();
    });

    it('should display max statistic', () => {
      render(<ResultsDashboard results={mockResults} />);

      expect(screen.getByText('Max')).toBeInTheDocument();
      expect(screen.getByText('155.67')).toBeInTheDocument();
    });

    it('should display sample count', () => {
      render(<ResultsDashboard results={mockResults} />);

      expect(screen.getByText('Samples')).toBeInTheDocument();
      expect(screen.getByText('1,000')).toBeInTheDocument();
    });

    it('should format large sample counts with commas', () => {
      const largeResults = {
        ...mockResults,
        samples: new Array(10000).fill(100)
      };

      render(<ResultsDashboard results={largeResults} />);

      expect(screen.getByText('10,000')).toBeInTheDocument();
    });
  });

  describe('Percentiles', () => {
    it('should display P5 percentile', () => {
      render(<ResultsDashboard results={mockResults} />);

      expect(screen.getByText('P5')).toBeInTheDocument();
      expect(screen.getByText('75.12')).toBeInTheDocument();
    });

    it('should display P25 percentile', () => {
      render(<ResultsDashboard results={mockResults} />);

      expect(screen.getByText('P25')).toBeInTheDocument();
      expect(screen.getByText('89.45')).toBeInTheDocument();
    });

    it('should display P50 percentile (median)', () => {
      render(<ResultsDashboard results={mockResults} />);

      expect(screen.getByText('P50')).toBeInTheDocument();
      expect(screen.getAllByText('99.87')).toHaveLength(2); // Appears in Median and P50
    });

    it('should display P75 percentile', () => {
      render(<ResultsDashboard results={mockResults} />);

      expect(screen.getByText('P75')).toBeInTheDocument();
      expect(screen.getByText('110.23')).toBeInTheDocument();
    });

    it('should display P95 percentile', () => {
      render(<ResultsDashboard results={mockResults} />);

      expect(screen.getByText('P95')).toBeInTheDocument();
      expect(screen.getByText('125.89')).toBeInTheDocument();
    });

    it('should render percentile dividers', () => {
      const { container } = render(<ResultsDashboard results={mockResults} />);

      const dividers = container.querySelectorAll('.percentile-divider');
      expect(dividers).toHaveLength(4); // 4 dividers between 5 percentiles
    });
  });

  describe('Charts', () => {
    it('should render histogram title', () => {
      render(<ResultsDashboard results={mockResults} />);

      expect(screen.getByText('Distribution Histogram')).toBeInTheDocument();
    });

    it('should render CDF title', () => {
      render(<ResultsDashboard results={mockResults} />);

      expect(screen.getByText('Cumulative Distribution Function')).toBeInTheDocument();
    });

    it('should render Recharts components', () => {
      const { container } = render(<ResultsDashboard results={mockResults} />);

      // Recharts renders ResponsiveContainer divs
      const containers = container.querySelectorAll('.recharts-responsive-container');
      expect(containers).toHaveLength(2); // Histogram and CDF
    });
  });

  describe('Data Processing', () => {
    it('should handle empty samples array', () => {
      const emptyResults: SimulationResults = {
        samples: [],
        mean: 0,
        median: 0,
        stddev: 0,
        min: 0,
        max: 0,
        p5: 0,
        p25: 0,
        p50: 0,
        p75: 0,
        p95: 0
      };

      render(<ResultsDashboard results={emptyResults} />);

      expect(screen.getByText('Simulation Results')).toBeInTheDocument();
      expect(screen.getAllByText('0.00').length).toBeGreaterThanOrEqual(1); // Multiple 0.00 values
    });

    it('should handle single sample', () => {
      const singleSampleResults: SimulationResults = {
        samples: [100],
        mean: 100,
        median: 100,
        stddev: 0,
        min: 100,
        max: 100,
        p5: 100,
        p25: 100,
        p50: 100,
        p75: 100,
        p95: 100
      };

      render(<ResultsDashboard results={singleSampleResults} />);

      expect(screen.getAllByText('100.00').length).toBeGreaterThanOrEqual(1); // Multiple stats show 100.00
    });

    it('should handle very large values', () => {
      const largeValueResults: SimulationResults = {
        samples: [1000000, 2000000],
        mean: 1500000,
        median: 1500000,
        stddev: 500000,
        min: 1000000,
        max: 2000000,
        p5: 1000000,
        p25: 1250000,
        p50: 1500000,
        p75: 1750000,
        p95: 2000000
      };

      render(<ResultsDashboard results={largeValueResults} />);

      expect(screen.getAllByText('1500000.00')).toHaveLength(3); // Mean, Median, and P50
    });

    it('should handle negative values', () => {
      const negativeResults: SimulationResults = {
        samples: [-50, -25, 0, 25, 50],
        mean: 0,
        median: 0,
        stddev: 35.36,
        min: -50,
        max: 50,
        p5: -45,
        p25: -25,
        p50: 0,
        p75: 25,
        p95: 45
      };

      render(<ResultsDashboard results={negativeResults} />);

      expect(screen.getByText('-50.00')).toBeInTheDocument(); // Min
      expect(screen.getByText('50.00')).toBeInTheDocument(); // Max
    });

    it('should handle decimal values correctly', () => {
      const decimalResults: SimulationResults = {
        samples: [0.1, 0.2, 0.3],
        mean: 0.2,
        median: 0.2,
        stddev: 0.1,
        min: 0.1,
        max: 0.3,
        p5: 0.1,
        p25: 0.15,
        p50: 0.2,
        p75: 0.25,
        p95: 0.3
      };

      render(<ResultsDashboard results={decimalResults} />);

      expect(screen.getAllByText('0.20')).toHaveLength(3); // Mean, Median, and P50
      expect(screen.getAllByText('0.10')).toHaveLength(3); // Min, Stddev, and P5
    });
  });

  describe('Formatting', () => {
    it('should format statistics to 2 decimal places', () => {
      const preciseResults: SimulationResults = {
        ...mockResults,
        mean: 100.12345,
        median: 99.87654
      };

      render(<ResultsDashboard results={preciseResults} />);

      expect(screen.getByText('100.12')).toBeInTheDocument();
      expect(screen.getByText('99.88')).toBeInTheDocument();
    });

    it('should format percentiles to 2 decimal places', () => {
      const preciseResults: SimulationResults = {
        ...mockResults,
        p5: 75.123456,
        p95: 125.987654
      };

      render(<ResultsDashboard results={preciseResults} />);

      expect(screen.getByText('75.12')).toBeInTheDocument();
      expect(screen.getByText('125.99')).toBeInTheDocument();
    });
  });

  describe('CSS Classes', () => {
    it('should apply results-dashboard class', () => {
      const { container } = render(<ResultsDashboard results={mockResults} />);

      expect(container.querySelector('.results-dashboard')).toBeInTheDocument();
    });

    it('should apply stats-grid class', () => {
      const { container } = render(<ResultsDashboard results={mockResults} />);

      expect(container.querySelector('.stats-grid')).toBeInTheDocument();
    });

    it('should apply stat-card class to statistic cards', () => {
      const { container } = render(<ResultsDashboard results={mockResults} />);

      const cards = container.querySelectorAll('.stat-card');
      expect(cards).toHaveLength(6); // Mean, Median, StdDev, Min, Max, Samples
    });

    it('should apply percentiles-bar class', () => {
      const { container } = render(<ResultsDashboard results={mockResults} />);

      expect(container.querySelector('.percentiles-bar')).toBeInTheDocument();
    });

    it('should apply chart-title class to chart titles', () => {
      const { container } = render(<ResultsDashboard results={mockResults} />);

      const chartTitles = container.querySelectorAll('.chart-title');
      expect(chartTitles).toHaveLength(2); // Histogram and CDF
    });
  });

  describe('Edge Cases', () => {
    it('should handle NaN values gracefully', () => {
      const nanResults: SimulationResults = {
        samples: [100, 200],
        mean: NaN,
        median: 150,
        stddev: NaN,
        min: 100,
        max: 200,
        p5: 100,
        p25: 125,
        p50: 150,
        p75: 175,
        p95: 200
      };

      render(<ResultsDashboard results={nanResults} />);

      // Component should render without crashing
      expect(screen.getByText('Simulation Results')).toBeInTheDocument();
    });

    it('should handle Infinity values gracefully', () => {
      const infinityResults: SimulationResults = {
        samples: [100, 200],
        mean: Infinity,
        median: 150,
        stddev: 50,
        min: 100,
        max: Infinity,
        p5: 100,
        p25: 125,
        p50: 150,
        p75: 175,
        p95: 200
      };

      render(<ResultsDashboard results={infinityResults} />);

      // Component should render without crashing
      expect(screen.getByText('Simulation Results')).toBeInTheDocument();
    });

    it('should handle zero range (min === max)', () => {
      const zeroRangeResults: SimulationResults = {
        samples: [100, 100, 100],
        mean: 100,
        median: 100,
        stddev: 0,
        min: 100,
        max: 100,
        p5: 100,
        p25: 100,
        p50: 100,
        p75: 100,
        p95: 100
      };

      render(<ResultsDashboard results={zeroRangeResults} />);

      expect(screen.getAllByText('100.00').length).toBeGreaterThanOrEqual(1); // All stats show 100.00
    });
  });

  describe('Accessibility', () => {
    it('should have semantic text elements', () => {
      render(<ResultsDashboard results={mockResults} />);

      // Fluent UI Text components render as spans
      expect(screen.getByText('Mean')).toBeInTheDocument();
      expect(screen.getByText('Median')).toBeInTheDocument();
    });

    it('should provide clear labels for statistics', () => {
      render(<ResultsDashboard results={mockResults} />);

      // Each stat card has a label
      expect(screen.getByText('Mean')).toBeInTheDocument();
      expect(screen.getByText('Median')).toBeInTheDocument();
      expect(screen.getByText('Std Dev')).toBeInTheDocument();
      expect(screen.getByText('Min')).toBeInTheDocument();
      expect(screen.getByText('Max')).toBeInTheDocument();
      expect(screen.getByText('Samples')).toBeInTheDocument();
    });

    it('should provide clear labels for percentiles', () => {
      render(<ResultsDashboard results={mockResults} />);

      expect(screen.getByText('P5')).toBeInTheDocument();
      expect(screen.getByText('P25')).toBeInTheDocument();
      expect(screen.getByText('P50')).toBeInTheDocument();
      expect(screen.getByText('P75')).toBeInTheDocument();
      expect(screen.getByText('P95')).toBeInTheDocument();
    });
  });

  describe('Re-rendering', () => {
    it('should update when results change', () => {
      const { rerender } = render(<ResultsDashboard results={mockResults} />);

      expect(screen.getByText('100.25')).toBeInTheDocument();

      const newResults: SimulationResults = {
        ...mockResults,
        mean: 200.50
      };

      rerender(<ResultsDashboard results={newResults} />);

      expect(screen.queryByText('100.25')).not.toBeInTheDocument();
      expect(screen.getByText('200.50')).toBeInTheDocument();
    });

    it('should transition from no results to results', () => {
      const { rerender } = render(<ResultsDashboard results={null} />);

      expect(screen.getByText(/No results yet/i)).toBeInTheDocument();

      rerender(<ResultsDashboard results={mockResults} />);

      expect(screen.queryByText(/No results yet/i)).not.toBeInTheDocument();
      expect(screen.getByText('Simulation Results')).toBeInTheDocument();
    });

    it('should transition from results to no results', () => {
      const { rerender } = render(<ResultsDashboard results={mockResults} />);

      expect(screen.getByText('Simulation Results')).toBeInTheDocument();

      rerender(<ResultsDashboard results={null} />);

      expect(screen.queryByText('Simulation Results')).not.toBeInTheDocument();
      expect(screen.getByText(/No results yet/i)).toBeInTheDocument();
    });
  });
});
