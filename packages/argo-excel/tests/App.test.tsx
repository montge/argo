import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../src/taskpane/App';

describe('App Integration Tests', () => {
  beforeEach(() => {
    // Reset Office mock before each test
    (global.Office as any).context = { document: {}, workbook: {} };
    (global.Excel.run as jest.Mock).mockClear();
  });

  describe('Initialization', () => {
    it('should show loading spinner when Office is not initialized', () => {
      (global.Office as any).context = undefined;

      render(<App />);

      expect(screen.getByText('Loading Argo...')).toBeInTheDocument();
    });

    it('should show main app when Office is initialized', () => {
      render(<App />);

      expect(screen.getByText('Argo')).toBeInTheDocument();
      expect(screen.getByText('Monte Carlo Simulation v5.0')).toBeInTheDocument();
    });

    it('should show success message after initialization', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/Argo add-in loaded successfully/i)).toBeInTheDocument();
      });
    });

    it('should display header with icon', () => {
      render(<App />);

      expect(screen.getByText('Argo')).toBeInTheDocument();
      expect(screen.getByText('Monte Carlo Simulation v5.0')).toBeInTheDocument();
    });

    it('should display footer with version info', () => {
      render(<App />);

      expect(screen.getByText(/Argo v5.0 \| Booz Allen Hamilton/i)).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('should render Setup and Results tabs', () => {
      render(<App />);

      expect(screen.getByText('Setup')).toBeInTheDocument();
      expect(screen.getByText('Results')).toBeInTheDocument();
    });

    it('should show distribution selector in Setup tab by default', () => {
      render(<App />);

      expect(screen.getByText('Continuous Distributions')).toBeInTheDocument();
      expect(screen.getByText('Discrete Distributions')).toBeInTheDocument();
    });

    it('should show results dashboard in Results tab', async () => {
      render(<App />);

      const resultsTab = screen.getByText('Results');
      fireEvent.click(resultsTab);

      await waitFor(() => {
        expect(screen.getByText(/No results yet/i)).toBeInTheDocument();
      });
    });
  });

  describe('Distribution Selection', () => {
    it('should not show simulation controls initially', () => {
      render(<App />);

      expect(screen.queryByText('Simulation Parameters')).not.toBeInTheDocument();
    });

    it('should show simulation controls after selecting a distribution', async () => {
      render(<App />);

      const normalButton = screen.getByRole('button', { name: /^Normal NormalBell-shaped/i });
      fireEvent.click(normalButton);

      await waitFor(() => {
        expect(screen.getByText('Simulation Parameters')).toBeInTheDocument();
      });
    });

    it('should show correct parameters for Normal distribution', async () => {
      render(<App />);

      const normalButton = screen.getByRole('button', { name: /^Normal NormalBell-shaped/i });
      fireEvent.click(normalButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Mean (μ)')).toBeInTheDocument();
        expect(screen.getByLabelText('Std Dev (σ)')).toBeInTheDocument();
      });
    });

    it('should update footer with selected distribution', async () => {
      render(<App />);

      const normalButton = screen.getByRole('button', { name: /^Normal NormalBell-shaped/i });
      fireEvent.click(normalButton);

      await waitFor(() => {
        expect(screen.getByText(/NORMAL Distribution/i)).toBeInTheDocument();
      });
    });

    it('should allow changing distribution', async () => {
      render(<App />);

      // Select Normal
      const normalButton = screen.getByRole('button', { name: /^Normal NormalBell-shaped/i });
      fireEvent.click(normalButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Mean (μ)')).toBeInTheDocument();
      });

      // Change to Uniform
      const uniformButton = screen.getByRole('button', { name: /UniformEqual probability/i });
      fireEvent.click(uniformButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Minimum')).toBeInTheDocument();
        expect(screen.getByLabelText('Maximum')).toBeInTheDocument();
        expect(screen.queryByLabelText('Mean (μ)')).not.toBeInTheDocument();
      });
    });
  });

  describe('Simulation Workflow', () => {
    beforeEach(() => {
      // Mock Excel.run to simulate successful Excel operation
      (global.Excel.run as jest.Mock).mockImplementation(async (callback) => {
        const mockContext = {
          workbook: {
            worksheets: {
              getActiveWorksheet: () => ({
                getRange: (range: string) => ({
                  values: [],
                  getRow: (index: number) => ({
                    format: {
                      font: { bold: false, color: '' },
                      fill: { color: '' }
                    }
                  }),
                  format: {
                    font: { bold: false, color: '' },
                    fill: { color: '' }
                  }
                })
              })
            }
          },
          sync: jest.fn().mockResolvedValue(undefined)
        };
        return callback(mockContext);
      });
    });

    it('should run simulation when Run button is clicked', async () => {
      render(<App />);

      // Select distribution
      const normalButton = screen.getByRole('button', { name: /^Normal NormalBell-shaped/i });
      fireEvent.click(normalButton);

      await waitFor(() => {
        expect(screen.getByText('Simulation Parameters')).toBeInTheDocument();
      });

      // Click Run Simulation
      const runButton = screen.getByRole('button', { name: /Run Simulation/i });
      fireEvent.click(runButton);

      // Should show running state
      await waitFor(() => {
        expect(screen.getByText(/Running simulation/i)).toBeInTheDocument();
      });
    });

    it('should write results to Excel after simulation', async () => {
      render(<App />);

      // Select distribution
      const normalButton = screen.getByRole('button', { name: /^Normal NormalBell-shaped/i });
      fireEvent.click(normalButton);

      await waitFor(() => {
        expect(screen.getByText('Simulation Parameters')).toBeInTheDocument();
      });

      // Run simulation
      const runButton = screen.getByRole('button', { name: /Run Simulation/i });
      fireEvent.click(runButton);

      // Wait for simulation to complete
      await waitFor(() => {
        expect(screen.getByText(/Simulation complete/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      // Verify Excel.run was called
      expect(global.Excel.run).toHaveBeenCalled();
    });

    it('should show results in Results tab after simulation', async () => {
      render(<App />);

      // Select distribution
      const normalButton = screen.getByRole('button', { name: /^Normal NormalBell-shaped/i });
      fireEvent.click(normalButton);

      await waitFor(() => {
        expect(screen.getByText('Simulation Parameters')).toBeInTheDocument();
      });

      // Run simulation
      const runButton = screen.getByRole('button', { name: /Run Simulation/i });
      fireEvent.click(runButton);

      // Wait for completion
      await waitFor(() => {
        expect(screen.getByText(/Simulation complete/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      // Switch to Results tab
      const resultsTab = screen.getByText('Results');
      fireEvent.click(resultsTab);

      // Should show results dashboard with data
      await waitFor(() => {
        expect(screen.getByText('Simulation Results')).toBeInTheDocument();
        expect(screen.queryByText(/No results yet/i)).not.toBeInTheDocument();
      });
    });

    it('should allow stopping simulation', async () => {
      render(<App />);

      // Select distribution
      const normalButton = screen.getByRole('button', { name: /^Normal NormalBell-shaped/i });
      fireEvent.click(normalButton);

      await waitFor(() => {
        expect(screen.getByText('Simulation Parameters')).toBeInTheDocument();
      });

      // Run simulation
      const runButton = screen.getByRole('button', { name: /Run Simulation/i });
      fireEvent.click(runButton);

      // Should show Stop button
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Stop/i })).toBeInTheDocument();
      });

      // Click Stop
      const stopButton = screen.getByRole('button', { name: /Stop/i });
      fireEvent.click(stopButton);

      // Should show stopped message
      await waitFor(() => {
        expect(screen.getByText(/Simulation stopped/i)).toBeInTheDocument();
      });
    });
  });

  describe('Message Handling', () => {
    it('should show message bar with success message on load', async () => {
      render(<App />);

      // Wait for initialization message to appear
      await waitFor(() => {
        expect(screen.getByText(/Argo add-in loaded successfully/i)).toBeInTheDocument();
      });
    });

    it('should show completion message after simulation', async () => {
      render(<App />);

      // Select and run simulation
      const normalButton = screen.getByRole('button', { name: /^Normal NormalBell-shaped/i });
      fireEvent.click(normalButton);

      await waitFor(() => {
        expect(screen.getByText('Simulation Parameters')).toBeInTheDocument();
      });

      const runButton = screen.getByRole('button', { name: /Run Simulation/i });
      fireEvent.click(runButton);

      // Should show completion message
      await waitFor(() => {
        expect(screen.getByText(/Simulation complete/i)).toBeInTheDocument();
      }, { timeout: 10000 });
    });
  });

  describe('Error Handling', () => {
    it('should show error message if simulation fails', async () => {
      // Mock Excel.run to throw error
      (global.Excel.run as jest.Mock).mockRejectedValue(new Error('Excel error'));

      render(<App />);

      // Select distribution
      const normalButton = screen.getByRole('button', { name: /^Normal NormalBell-shaped/i });
      fireEvent.click(normalButton);

      await waitFor(() => {
        expect(screen.getByText('Simulation Parameters')).toBeInTheDocument();
      });

      // Run simulation
      const runButton = screen.getByRole('button', { name: /Run Simulation/i });
      fireEvent.click(runButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/Error: Excel error/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should handle invalid distribution parameters gracefully', async () => {
      render(<App />);

      // Select distribution
      const normalButton = screen.getByRole('button', { name: /^Normal NormalBell-shaped/i });
      fireEvent.click(normalButton);

      await waitFor(() => {
        expect(screen.getByText('Simulation Parameters')).toBeInTheDocument();
      });

      // Set invalid stddev (negative)
      const stddevInput = screen.getByLabelText('Std Dev (σ)') as HTMLInputElement;
      fireEvent.change(stddevInput, { target: { value: '-1' } });

      // Run simulation
      const runButton = screen.getByRole('button', { name: /Run Simulation/i });
      fireEvent.click(runButton);

      // Should show error about invalid parameters
      await waitFor(() => {
        expect(screen.getByText(/Error/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('State Management', () => {
    it('should maintain selected distribution when switching tabs', async () => {
      render(<App />);

      // Select Normal distribution
      const normalButton = screen.getByRole('button', { name: /^Normal NormalBell-shaped/i });
      fireEvent.click(normalButton);

      await waitFor(() => {
        expect(screen.getByText('Simulation Parameters')).toBeInTheDocument();
      });

      // Switch to Results tab
      const resultsTab = screen.getByText('Results');
      fireEvent.click(resultsTab);

      // Switch back to Setup tab
      const setupTab = screen.getByText('Setup');
      fireEvent.click(setupTab);

      // Distribution should still be selected
      await waitFor(() => {
        expect(screen.getByText('Simulation Parameters')).toBeInTheDocument();
        expect(normalButton).toHaveClass('selected');
      });
    });

    it('should preserve results when switching tabs', async () => {
      render(<App />);

      // Select distribution
      const normalButton = screen.getByRole('button', { name: /^Normal NormalBell-shaped/i });
      fireEvent.click(normalButton);

      await waitFor(() => {
        expect(screen.getByText('Simulation Parameters')).toBeInTheDocument();
      });

      // Switch to Results tab (no results yet)
      const resultsTab = screen.getByText('Results');
      fireEvent.click(resultsTab);

      await waitFor(() => {
        expect(screen.getByText(/No results yet/i)).toBeInTheDocument();
      });

      // Switch back to Setup
      const setupTab = screen.getByText('Setup');
      fireEvent.click(setupTab);

      // Distribution should still be selected
      await waitFor(() => {
        expect(screen.getByText('Simulation Parameters')).toBeInTheDocument();
        expect(normalButton).toHaveClass('selected');
      });
    });
  });

  describe('All Distribution Types', () => {
    const distributions = [
      { type: 'normal', buttonName: /^Normal NormalBell-shaped/i, param: 'Mean (μ)' },
      { type: 'uniform', buttonName: /UniformEqual probability/i, param: 'Minimum' },
      { type: 'triangular', buttonName: /TriangularSimple three-point/i, param: 'Minimum' },
      { type: 'binomial', buttonName: /BinomialSuccess\/failure trials/i, param: 'Trials (n)' }
    ];

    it.each(distributions)('should handle $type distribution workflow', async ({ buttonName, param }) => {
      render(<App />);

      // Select distribution
      const distButton = screen.getByRole('button', { name: buttonName });
      fireEvent.click(distButton);

      // Should show parameter form
      await waitFor(() => {
        expect(screen.getByLabelText(param)).toBeInTheDocument();
      });

      // Should be able to run simulation
      const runButton = screen.getByRole('button', { name: /Run Simulation/i });
      expect(runButton).toBeInTheDocument();
      expect(runButton).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<App />);

      expect(screen.getByText('Argo')).toBeInTheDocument();
      expect(screen.getByText('Monte Carlo Simulation v5.0')).toBeInTheDocument();
    });

    it('should have accessible tabs', () => {
      render(<App />);

      const setupTab = screen.getByText('Setup');
      const resultsTab = screen.getByText('Results');

      expect(setupTab).toBeInTheDocument();
      expect(resultsTab).toBeInTheDocument();
    });

    it('should maintain focus management during tab switches', () => {
      render(<App />);

      const resultsTab = screen.getByText('Results');
      fireEvent.click(resultsTab);

      // Tab switch should work
      expect(screen.getByText(/No results yet/i)).toBeInTheDocument();
    });
  });
});
