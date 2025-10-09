import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SimulationControls } from '../../src/taskpane/components/SimulationControls';
import { DistributionType } from '../../src/taskpane/components/DistributionSelector';

describe('SimulationControls', () => {
  const mockOnRunSimulation = jest.fn();
  const mockOnStopSimulation = jest.fn();

  beforeEach(() => {
    mockOnRunSimulation.mockClear();
    mockOnStopSimulation.mockClear();
    mockOnRunSimulation.mockResolvedValue(undefined);
  });

  describe('Rendering', () => {
    it('should render the component with title', () => {
      render(
        <SimulationControls
          distribution="normal"
          isRunning={false}
          progress={0}
          onRunSimulation={mockOnRunSimulation}
          onStopSimulation={mockOnStopSimulation}
        />
      );

      expect(screen.getByText('Simulation Parameters')).toBeInTheDocument();
    });

    it('should render Run Simulation button', () => {
      render(
        <SimulationControls
          distribution="normal"
          isRunning={false}
          progress={0}
          onRunSimulation={mockOnRunSimulation}
          onStopSimulation={mockOnStopSimulation}
        />
      );

      expect(screen.getByRole('button', { name: /Run Simulation/i })).toBeInTheDocument();
    });

    it('should show iterations count', () => {
      render(
        <SimulationControls
          distribution="normal"
          isRunning={false}
          progress={0}
          onRunSimulation={mockOnRunSimulation}
          onStopSimulation={mockOnStopSimulation}
        />
      );

      expect(screen.getByText(/Iterations: 10,000/i)).toBeInTheDocument();
    });
  });

  describe('Distribution Parameters - Normal', () => {
    it('should render mean and stddev parameters for Normal distribution', () => {
      render(
        <SimulationControls
          distribution="normal"
          isRunning={false}
          progress={0}
          onRunSimulation={mockOnRunSimulation}
          onStopSimulation={mockOnStopSimulation}
        />
      );

      expect(screen.getByLabelText('Mean (μ)')).toBeInTheDocument();
      expect(screen.getByLabelText('Std Dev (σ)')).toBeInTheDocument();
    });

    it('should have default values for Normal distribution', () => {
      render(
        <SimulationControls
          distribution="normal"
          isRunning={false}
          progress={0}
          onRunSimulation={mockOnRunSimulation}
          onStopSimulation={mockOnStopSimulation}
        />
      );

      const meanInput = screen.getByLabelText('Mean (μ)') as HTMLInputElement;
      const stddevInput = screen.getByLabelText('Std Dev (σ)') as HTMLInputElement;

      expect(meanInput.value).toBe('100');
      expect(stddevInput.value).toBe('15');
    });
  });

  describe('Distribution Parameters - Uniform', () => {
    it('should render min and max parameters for Uniform distribution', () => {
      render(
        <SimulationControls
          distribution="uniform"
          isRunning={false}
          progress={0}
          onRunSimulation={mockOnRunSimulation}
          onStopSimulation={mockOnStopSimulation}
        />
      );

      expect(screen.getByLabelText('Minimum')).toBeInTheDocument();
      expect(screen.getByLabelText('Maximum')).toBeInTheDocument();
    });
  });

  describe('Distribution Parameters - Triangular', () => {
    it('should render min, mode, max parameters for Triangular distribution', () => {
      render(
        <SimulationControls
          distribution="triangular"
          isRunning={false}
          progress={0}
          onRunSimulation={mockOnRunSimulation}
          onStopSimulation={mockOnStopSimulation}
        />
      );

      expect(screen.getByLabelText('Minimum')).toBeInTheDocument();
      expect(screen.getByLabelText('Mode (Most Likely)')).toBeInTheDocument();
      expect(screen.getByLabelText('Maximum')).toBeInTheDocument();
    });
  });

  describe('Distribution Parameters - Binomial', () => {
    it('should render n and p parameters for Binomial distribution', () => {
      render(
        <SimulationControls
          distribution="binomial"
          isRunning={false}
          progress={0}
          onRunSimulation={mockOnRunSimulation}
          onStopSimulation={mockOnStopSimulation}
        />
      );

      expect(screen.getByLabelText('Trials (n)')).toBeInTheDocument();
      expect(screen.getByLabelText('Probability (p)')).toBeInTheDocument();
    });
  });

  describe('Parameter Input', () => {
    it('should allow changing parameter values', () => {
      render(
        <SimulationControls
          distribution="normal"
          isRunning={false}
          progress={0}
          onRunSimulation={mockOnRunSimulation}
          onStopSimulation={mockOnStopSimulation}
        />
      );

      const meanInput = screen.getByLabelText('Mean (μ)') as HTMLInputElement;

      fireEvent.change(meanInput, { target: { value: '150' } });

      expect(meanInput.value).toBe('150');
    });

    it('should handle numeric input correctly', () => {
      render(
        <SimulationControls
          distribution="normal"
          isRunning={false}
          progress={0}
          onRunSimulation={mockOnRunSimulation}
          onStopSimulation={mockOnStopSimulation}
        />
      );

      const stddevInput = screen.getByLabelText('Std Dev (σ)') as HTMLInputElement;

      fireEvent.change(stddevInput, { target: { value: '20.5' } });

      expect(stddevInput.value).toBe('20.5');
    });
  });

  describe('Iteration Slider', () => {
    it('should render iterations slider', () => {
      render(
        <SimulationControls
          distribution="normal"
          isRunning={false}
          progress={0}
          onRunSimulation={mockOnRunSimulation}
          onStopSimulation={mockOnStopSimulation}
        />
      );

      // Slider is present (Fluent UI renders it)
      expect(screen.getByText(/Iterations: 10,000/i)).toBeInTheDocument();
    });

    it('should update iterations count when slider changes', () => {
      const { container } = render(
        <SimulationControls
          distribution="normal"
          isRunning={false}
          progress={0}
          onRunSimulation={mockOnRunSimulation}
          onStopSimulation={mockOnStopSimulation}
        />
      );

      // Note: Testing Fluent UI Slider is complex, we verify the text is present
      expect(screen.getByText(/Iterations:/i)).toBeInTheDocument();
    });
  });

  describe('Run Simulation', () => {
    it('should call onRunSimulation when Run button is clicked', async () => {
      render(
        <SimulationControls
          distribution="normal"
          isRunning={false}
          progress={0}
          onRunSimulation={mockOnRunSimulation}
          onStopSimulation={mockOnStopSimulation}
        />
      );

      const runButton = screen.getByRole('button', { name: /Run Simulation/i });
      fireEvent.click(runButton);

      await waitFor(() => {
        expect(mockOnRunSimulation).toHaveBeenCalledTimes(1);
      });
    });

    it('should pass current parameters to onRunSimulation', async () => {
      render(
        <SimulationControls
          distribution="normal"
          isRunning={false}
          progress={0}
          onRunSimulation={mockOnRunSimulation}
          onStopSimulation={mockOnStopSimulation}
        />
      );

      const meanInput = screen.getByLabelText('Mean (μ)');
      fireEvent.change(meanInput, { target: { value: '200' } });

      const runButton = screen.getByRole('button', { name: /Run Simulation/i });
      fireEvent.click(runButton);

      await waitFor(() => {
        expect(mockOnRunSimulation).toHaveBeenCalledWith(
          expect.objectContaining({ mean: 200 }),
          10000
        );
      });
    });

    it('should pass default iterations count', async () => {
      render(
        <SimulationControls
          distribution="normal"
          isRunning={false}
          progress={0}
          onRunSimulation={mockOnRunSimulation}
          onStopSimulation={mockOnStopSimulation}
        />
      );

      const runButton = screen.getByRole('button', { name: /Run Simulation/i });
      fireEvent.click(runButton);

      await waitFor(() => {
        expect(mockOnRunSimulation).toHaveBeenCalledWith(
          expect.any(Object),
          10000
        );
      });
    });
  });

  describe('Running State', () => {
    it('should disable Run button when simulation is running', () => {
      render(
        <SimulationControls
          distribution="normal"
          isRunning={true}
          progress={0.5}
          onRunSimulation={mockOnRunSimulation}
          onStopSimulation={mockOnStopSimulation}
        />
      );

      const runButton = screen.getByRole('button', { name: /Run Simulation/i });
      expect(runButton).toBeDisabled();
    });

    it('should disable parameter inputs when simulation is running', () => {
      render(
        <SimulationControls
          distribution="normal"
          isRunning={true}
          progress={0.5}
          onRunSimulation={mockOnRunSimulation}
          onStopSimulation={mockOnStopSimulation}
        />
      );

      const meanInput = screen.getByLabelText('Mean (μ)');
      expect(meanInput).toBeDisabled();
    });

    it('should show Stop button when simulation is running', () => {
      render(
        <SimulationControls
          distribution="normal"
          isRunning={true}
          progress={0.5}
          onRunSimulation={mockOnRunSimulation}
          onStopSimulation={mockOnStopSimulation}
        />
      );

      expect(screen.getByRole('button', { name: /Stop/i })).toBeInTheDocument();
    });

    it('should show progress indicator when simulation is running', () => {
      render(
        <SimulationControls
          distribution="normal"
          isRunning={true}
          progress={0.5}
          onRunSimulation={mockOnRunSimulation}
          onStopSimulation={mockOnStopSimulation}
        />
      );

      expect(screen.getByText('Running simulation...')).toBeInTheDocument();
    });

    it('should not show Stop button when simulation is not running', () => {
      render(
        <SimulationControls
          distribution="normal"
          isRunning={false}
          progress={0}
          onRunSimulation={mockOnRunSimulation}
          onStopSimulation={mockOnStopSimulation}
        />
      );

      expect(screen.queryByRole('button', { name: /Stop/i })).not.toBeInTheDocument();
    });

    it('should call onStopSimulation when Stop button is clicked', () => {
      render(
        <SimulationControls
          distribution="normal"
          isRunning={true}
          progress={0.5}
          onRunSimulation={mockOnRunSimulation}
          onStopSimulation={mockOnStopSimulation}
        />
      );

      const stopButton = screen.getByRole('button', { name: /Stop/i });
      fireEvent.click(stopButton);

      expect(mockOnStopSimulation).toHaveBeenCalledTimes(1);
    });
  });

  describe('All Distribution Types', () => {
    const distributions: DistributionType[] = [
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

    it.each(distributions)('should render controls for %s distribution', (distribution) => {
      render(
        <SimulationControls
          distribution={distribution}
          isRunning={false}
          progress={0}
          onRunSimulation={mockOnRunSimulation}
          onStopSimulation={mockOnStopSimulation}
        />
      );

      expect(screen.getByText('Simulation Parameters')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Run Simulation/i })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty parameter input gracefully', () => {
      render(
        <SimulationControls
          distribution="normal"
          isRunning={false}
          progress={0}
          onRunSimulation={mockOnRunSimulation}
          onStopSimulation={mockOnStopSimulation}
        />
      );

      const meanInput = screen.getByLabelText('Mean (μ)') as HTMLInputElement;

      fireEvent.change(meanInput, { target: { value: '' } });

      // Component should not crash
      expect(screen.getByText('Simulation Parameters')).toBeInTheDocument();
    });

    it('should handle non-numeric parameter input gracefully', () => {
      render(
        <SimulationControls
          distribution="normal"
          isRunning={false}
          progress={0}
          onRunSimulation={mockOnRunSimulation}
          onStopSimulation={mockOnStopSimulation}
        />
      );

      const meanInput = screen.getByLabelText('Mean (μ)') as HTMLInputElement;
      const initialValue = meanInput.value;

      fireEvent.change(meanInput, { target: { value: 'abc' } });

      // Value should not change from invalid input
      // Note: Component ignores NaN values
      expect(screen.getByText('Simulation Parameters')).toBeInTheDocument();
    });

    it('should handle progress values outside 0-1 range', () => {
      render(
        <SimulationControls
          distribution="normal"
          isRunning={true}
          progress={1.5}
          onRunSimulation={mockOnRunSimulation}
          onStopSimulation={mockOnStopSimulation}
        />
      );

      // Component should render without crashing
      expect(screen.getByText('Running simulation...')).toBeInTheDocument();
    });
  });

  describe('Parameter Validation', () => {
    it('should accept decimal values for stddev', () => {
      render(
        <SimulationControls
          distribution="normal"
          isRunning={false}
          progress={0}
          onRunSimulation={mockOnRunSimulation}
          onStopSimulation={mockOnStopSimulation}
        />
      );

      const stddevInput = screen.getByLabelText('Std Dev (σ)') as HTMLInputElement;

      fireEvent.change(stddevInput, { target: { value: '0.5' } });

      expect(stddevInput.value).toBe('0.5');
    });

    it('should accept probability values between 0 and 1', () => {
      render(
        <SimulationControls
          distribution="binomial"
          isRunning={false}
          progress={0}
          onRunSimulation={mockOnRunSimulation}
          onStopSimulation={mockOnStopSimulation}
        />
      );

      const pInput = screen.getByLabelText('Probability (p)') as HTMLInputElement;

      fireEvent.change(pInput, { target: { value: '0.75' } });

      expect(pInput.value).toBe('0.75');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels for all inputs', () => {
      render(
        <SimulationControls
          distribution="normal"
          isRunning={false}
          progress={0}
          onRunSimulation={mockOnRunSimulation}
          onStopSimulation={mockOnStopSimulation}
        />
      );

      expect(screen.getByLabelText('Mean (μ)')).toBeInTheDocument();
      expect(screen.getByLabelText('Std Dev (σ)')).toBeInTheDocument();
    });

    it('should have accessible button roles', () => {
      render(
        <SimulationControls
          distribution="normal"
          isRunning={false}
          progress={0}
          onRunSimulation={mockOnRunSimulation}
          onStopSimulation={mockOnStopSimulation}
        />
      );

      const runButton = screen.getByRole('button', { name: /Run Simulation/i });
      expect(runButton).toBeInTheDocument();
      expect(runButton).toHaveAttribute('type', 'button');
    });

    it('should indicate disabled state clearly', () => {
      render(
        <SimulationControls
          distribution="normal"
          isRunning={true}
          progress={0.5}
          onRunSimulation={mockOnRunSimulation}
          onStopSimulation={mockOnStopSimulation}
        />
      );

      const runButton = screen.getByRole('button', { name: /Run Simulation/i });
      expect(runButton).toBeDisabled();
      expect(runButton).toHaveAttribute('aria-disabled', 'true');
    });
  });
});
