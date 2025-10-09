import React, { useState } from 'react';
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
import { TextField } from '@fluentui/react/lib/TextField';
import { Slider } from '@fluentui/react/lib/Slider';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { ProgressIndicator } from '@fluentui/react/lib/ProgressIndicator';
import { DistributionType } from './DistributionSelector';
import './SimulationControls.css';

interface SimulationParameters {
  [key: string]: number;
}

interface SimulationControlsProps {
  distribution: DistributionType;
  isRunning: boolean;
  progress: number;
  onRunSimulation: (parameters: SimulationParameters, iterations: number) => Promise<void>;
  onStopSimulation: () => void;
}

const DISTRIBUTION_PARAMS: Record<DistributionType, Array<{ name: string; label: string; default: number; min?: number; max?: number }>> = {
  normal: [
    { name: 'mean', label: 'Mean (μ)', default: 100 },
    { name: 'stddev', label: 'Std Dev (σ)', default: 15, min: 0.01 }
  ],
  uniform: [
    { name: 'min', label: 'Minimum', default: 0 },
    { name: 'max', label: 'Maximum', default: 100 }
  ],
  triangular: [
    { name: 'min', label: 'Minimum', default: 0 },
    { name: 'mode', label: 'Mode (Most Likely)', default: 50 },
    { name: 'max', label: 'Maximum', default: 100 }
  ],
  lognormal: [
    { name: 'mu', label: 'μ (log scale)', default: 4.6 },
    { name: 'sigma', label: 'σ (log scale)', default: 0.5, min: 0.01 }
  ],
  exponential: [
    { name: 'lambda', label: 'Rate (λ)', default: 0.5, min: 0.01 }
  ],
  beta: [
    { name: 'alpha', label: 'Alpha (α)', default: 2, min: 0.01 },
    { name: 'beta', label: 'Beta (β)', default: 5, min: 0.01 }
  ],
  gamma: [
    { name: 'shape', label: 'Shape (k)', default: 2, min: 0.01 },
    { name: 'scale', label: 'Scale (θ)', default: 2, min: 0.01 }
  ],
  weibull: [
    { name: 'shape', label: 'Shape (k)', default: 1.5, min: 0.01 },
    { name: 'scale', label: 'Scale (λ)', default: 1, min: 0.01 }
  ],
  pareto: [
    { name: 'shape', label: 'Shape (α)', default: 2, min: 0.01 },
    { name: 'scale', label: 'Scale (xₘ)', default: 1, min: 0.01 }
  ],
  pert: [
    { name: 'min', label: 'Minimum', default: 0 },
    { name: 'mode', label: 'Mode (Most Likely)', default: 50 },
    { name: 'max', label: 'Maximum', default: 100 }
  ],
  binomial: [
    { name: 'n', label: 'Trials (n)', default: 10, min: 1 },
    { name: 'p', label: 'Probability (p)', default: 0.5, min: 0, max: 1 }
  ],
  poisson: [
    { name: 'lambda', label: 'Rate (λ)', default: 5, min: 0.01 }
  ],
  geometric: [
    { name: 'p', label: 'Probability (p)', default: 0.3, min: 0, max: 1 }
  ],
  hypergeometric: [
    { name: 'N', label: 'Population (N)', default: 50, min: 1 },
    { name: 'K', label: 'Successes (K)', default: 20, min: 0 },
    { name: 'n', label: 'Draws (n)', default: 10, min: 1 }
  ]
};

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  distribution,
  isRunning,
  progress,
  onRunSimulation,
  onStopSimulation
}) => {
  const params = DISTRIBUTION_PARAMS[distribution];
  const [iterations, setIterations] = useState(10000);
  const [parameters, setParameters] = useState<SimulationParameters>(() => {
    const initial: SimulationParameters = {};
    params.forEach(p => {
      initial[p.name] = p.default;
    });
    return initial;
  });

  const handleParameterChange = (paramName: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setParameters(prev => ({ ...prev, [paramName]: numValue }));
    }
  };

  const handleRun = async () => {
    await onRunSimulation(parameters, iterations);
  };

  return (
    <Stack tokens={{ childrenGap: 16 }} className="simulation-controls">
      <Text variant="large" className="section-title">
        Simulation Parameters
      </Text>

      {/* Distribution Parameters */}
      <Stack tokens={{ childrenGap: 12 }}>
        {params.map(param => (
          <TextField
            key={param.name}
            label={param.label}
            type="number"
            value={parameters[param.name]?.toString() || ''}
            onChange={(_, value) => handleParameterChange(param.name, value || '')}
            disabled={isRunning}
            step={param.min && param.min < 1 ? 0.1 : 1}
          />
        ))}
      </Stack>

      {/* Iteration Count */}
      <Stack tokens={{ childrenGap: 8 }}>
        <Text variant="medium">Iterations: {iterations.toLocaleString()}</Text>
        <Slider
          min={100}
          max={100000}
          step={100}
          value={iterations}
          onChange={setIterations}
          disabled={isRunning}
          showValue={false}
        />
      </Stack>

      {/* Progress */}
      {isRunning && (
        <Stack tokens={{ childrenGap: 8 }}>
          <ProgressIndicator
            label="Running simulation..."
            percentComplete={progress}
          />
        </Stack>
      )}

      {/* Action Buttons */}
      <Stack horizontal tokens={{ childrenGap: 12 }}>
        <PrimaryButton
          text="Run Simulation"
          onClick={handleRun}
          disabled={isRunning}
          iconProps={{ iconName: 'Play' }}
        />
        {isRunning && (
          <DefaultButton
            text="Stop"
            onClick={onStopSimulation}
            iconProps={{ iconName: 'Stop' }}
          />
        )}
      </Stack>
    </Stack>
  );
};
