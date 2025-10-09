import React, { useState, useEffect } from 'react';
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
import { Pivot, PivotItem } from '@fluentui/react/lib/Pivot';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import { Icon } from '@fluentui/react/lib/Icon';
import { DistributionSelector, DistributionType } from './components/DistributionSelector';
import { SimulationControls } from './components/SimulationControls';
import { ResultsDashboard, SimulationResults } from './components/ResultsDashboard';
import {
  NormalDistribution,
  UniformDistribution,
  TriangularDistribution,
  LogNormalDistribution,
  ExponentialDistribution,
  BetaDistribution,
  GammaDistribution,
  WeibullDistribution,
  ParetoDistribution,
  PERTDistribution,
  BinomialDistribution,
  PoissonDistribution,
  GeometricDistribution,
  HypergeometricDistribution,
  SimpleRNG
} from '@argo/core';
import './App.css';

interface AppState {
  isOfficeInitialized: boolean;
  message: string;
  messageType: MessageBarType;
  selectedDistribution: DistributionType | null;
  isRunning: boolean;
  progress: number;
  results: SimulationResults | null;
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    isOfficeInitialized: false,
    message: '',
    messageType: MessageBarType.info,
    selectedDistribution: null,
    isRunning: false,
    progress: 0,
    results: null
  });

  useEffect(() => {
    // Check if Office.js is initialized
    if (Office.context) {
      setState(prev => ({
        ...prev,
        isOfficeInitialized: true,
        message: 'Argo add-in loaded successfully! Select a distribution to begin.',
        messageType: MessageBarType.success
      }));
    }
  }, []);

  const createDistribution = (type: DistributionType, params: any) => {
    switch (type) {
      case 'normal':
        return new NormalDistribution(params.mean, params.stddev);
      case 'uniform':
        return new UniformDistribution(params.min, params.max);
      case 'triangular':
        return new TriangularDistribution(params.min, params.mode, params.max);
      case 'lognormal':
        return new LogNormalDistribution(params.mu, params.sigma);
      case 'exponential':
        return new ExponentialDistribution(params.lambda);
      case 'beta':
        return new BetaDistribution(params.alpha, params.beta);
      case 'gamma':
        return new GammaDistribution(params.shape, params.scale);
      case 'weibull':
        return new WeibullDistribution(params.shape, params.scale);
      case 'pareto':
        return new ParetoDistribution(params.shape, params.scale);
      case 'pert':
        return new PERTDistribution(params.min, params.mode, params.max);
      case 'binomial':
        return new BinomialDistribution(params.n, params.p);
      case 'poisson':
        return new PoissonDistribution(params.lambda);
      case 'geometric':
        return new GeometricDistribution(params.p);
      case 'hypergeometric':
        return new HypergeometricDistribution(params.N, params.K, params.n);
      default:
        throw new Error(`Unknown distribution: ${type}`);
    }
  };

  const calculateStatistics = (samples: number[]): SimulationResults => {
    const sorted = [...samples].sort((a, b) => a - b);
    const n = sorted.length;

    const mean = samples.reduce((a, b) => a + b, 0) / n;
    const variance = samples.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
    const stddev = Math.sqrt(variance);

    return {
      samples,
      mean,
      median: sorted[Math.floor(n / 2)],
      stddev,
      min: sorted[0],
      max: sorted[n - 1],
      p5: sorted[Math.floor(n * 0.05)],
      p25: sorted[Math.floor(n * 0.25)],
      p50: sorted[Math.floor(n * 0.50)],
      p75: sorted[Math.floor(n * 0.75)],
      p95: sorted[Math.floor(n * 0.95)]
    };
  };

  const handleRunSimulation = async (parameters: any, iterations: number) => {
    if (!state.selectedDistribution) return;

    setState(prev => ({ ...prev, isRunning: true, progress: 0, message: '' }));

    try {
      const rng = new SimpleRNG(Date.now());
      const distribution = createDistribution(state.selectedDistribution, parameters);

      // Generate samples
      const samples: number[] = [];
      const batchSize = 1000;

      for (let i = 0; i < iterations; i++) {
        samples.push(distribution.sample(rng));

        // Update progress every batch
        if (i % batchSize === 0) {
          setState(prev => ({
            ...prev,
            progress: i / iterations
          }));
          // Allow UI to update
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }

      // Calculate statistics
      const results = calculateStatistics(samples);

      // Write results to Excel
      await Excel.run(async (context) => {
        const worksheet = context.workbook.worksheets.getActiveWorksheet();

        // Write summary statistics
        const statsRange = worksheet.getRange('A1:B8');
        statsRange.values = [
          ['Argo Simulation Results', ''],
          ['Distribution:', state.selectedDistribution],
          ['Samples:', iterations],
          ['Mean:', results.mean.toFixed(4)],
          ['Median:', results.median.toFixed(4)],
          ['Std Dev:', results.stddev.toFixed(4)],
          ['Min:', results.min.toFixed(4)],
          ['Max:', results.max.toFixed(4)]
        ];

        // Format header
        statsRange.getRow(0).format.font.bold = true;
        statsRange.getRow(0).format.fill.color = '#01807e';
        statsRange.getRow(0).format.font.color = '#ffffff';

        // Write percentiles
        const percentileRange = worksheet.getRange('A10:B14');
        percentileRange.values = [
          ['P5:', results.p5.toFixed(4)],
          ['P25:', results.p25.toFixed(4)],
          ['P50:', results.p50.toFixed(4)],
          ['P75:', results.p75.toFixed(4)],
          ['P95:', results.p95.toFixed(4)]
        ];

        await context.sync();
      });

      setState(prev => ({
        ...prev,
        isRunning: false,
        progress: 1,
        results,
        message: `Simulation complete! Generated ${iterations.toLocaleString()} samples.`,
        messageType: MessageBarType.success
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isRunning: false,
        progress: 0,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        messageType: MessageBarType.error
      }));
    }
  };

  const handleStopSimulation = () => {
    setState(prev => ({
      ...prev,
      isRunning: false,
      message: 'Simulation stopped',
      messageType: MessageBarType.warning
    }));
  };

  if (!state.isOfficeInitialized) {
    return (
      <Stack horizontalAlign="center" verticalAlign="center" styles={{ root: { height: '100vh' } }}>
        <Spinner size={SpinnerSize.large} label="Loading Argo..." />
      </Stack>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <Stack
        horizontal
        verticalAlign="center"
        tokens={{ childrenGap: 12 }}
        className="app-header"
      >
        <Icon iconName="BarChartVertical" className="header-icon" />
        <Stack>
          <Text variant="xLarge" className="header-title">Argo</Text>
          <Text variant="small" className="header-subtitle">Monte Carlo Simulation v5.0</Text>
        </Stack>
      </Stack>

      {/* Content */}
      <Stack tokens={{ childrenGap: 16 }} className="app-content">
        {state.message && (
          <MessageBar
            messageBarType={state.messageType}
            isMultiline={false}
            onDismiss={() => setState(prev => ({ ...prev, message: '' }))}
          >
            {state.message}
          </MessageBar>
        )}

        <Pivot>
          <PivotItem headerText="Setup" itemIcon="Settings">
            <Stack tokens={{ childrenGap: 20 }} styles={{ root: { marginTop: 16 } }}>
              <DistributionSelector
                selectedDistribution={state.selectedDistribution}
                onSelectDistribution={(dist) =>
                  setState(prev => ({ ...prev, selectedDistribution: dist }))
                }
              />

              {state.selectedDistribution && (
                <SimulationControls
                  distribution={state.selectedDistribution}
                  isRunning={state.isRunning}
                  progress={state.progress}
                  onRunSimulation={handleRunSimulation}
                  onStopSimulation={handleStopSimulation}
                />
              )}
            </Stack>
          </PivotItem>

          <PivotItem headerText="Results" itemIcon="BarChartVertical">
            <Stack styles={{ root: { marginTop: 16 } }}>
              <ResultsDashboard results={state.results} />
            </Stack>
          </PivotItem>
        </Pivot>
      </Stack>

      {/* Footer */}
      <Stack className="app-footer">
        <Text variant="small" className="footer-text">
          Argo v5.0 | Booz Allen Hamilton | {state.selectedDistribution ? `${state.selectedDistribution.toUpperCase()} Distribution` : 'No distribution selected'}
        </Text>
      </Stack>
    </div>
  );
};

export default App;
