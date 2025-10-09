import React, { useState, useEffect } from 'react';
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import { Icon } from '@fluentui/react/lib/Icon';
import { NormalDistribution, SimpleRNG } from '@argo/core';
import './App.css';

interface AppState {
  isOfficeInitialized: boolean;
  message: string;
  messageType: MessageBarType;
  isLoading: boolean;
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    isOfficeInitialized: false,
    message: '',
    messageType: MessageBarType.info,
    isLoading: false
  });

  useEffect(() => {
    // Check if Office.js is initialized
    if (Office.context) {
      setState(prev => ({
        ...prev,
        isOfficeInitialized: true,
        message: 'Argo add-in loaded successfully!',
        messageType: MessageBarType.success
      }));
    }
  }, []);

  const handleRunSimulation = async () => {
    setState(prev => ({ ...prev, isLoading: true, message: '' }));

    try {
      await Excel.run(async (context) => {
        // Get active range or A1
        const range = context.workbook.getSelectedRange();
        range.load('address');
        await context.sync();

        // Run a simple Monte Carlo simulation using argo-core
        const rng = new SimpleRNG(42);
        const distribution = new NormalDistribution(100, 15);

        // Generate 1000 samples
        const samples: number[] = [];
        for (let i = 0; i < 1000; i++) {
          samples.push(distribution.sample(rng));
        }

        // Calculate statistics
        const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
        const variance = samples.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / samples.length;
        const stddev = Math.sqrt(variance);

        // Write results to Excel
        const outputRange = context.workbook.worksheets.getActiveWorksheet().getRange('A1:B4');
        outputRange.values = [
          ['Argo Simulation Results', ''],
          ['Mean:', mean.toFixed(2)],
          ['Std Dev:', stddev.toFixed(2)],
          ['Samples:', samples.length]
        ];

        // Format header
        outputRange.getRow(0).format.font.bold = true;
        outputRange.getRow(0).format.fill.color = '#01807e';  // Teal brand color
        outputRange.getRow(0).format.font.color = '#ffffff';

        await context.sync();

        setState(prev => ({
          ...prev,
          isLoading: false,
          message: `Simulation complete! Generated ${samples.length} samples. Mean: ${mean.toFixed(2)}`,
          messageType: MessageBarType.success
        }));
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        messageType: MessageBarType.error
      }));
    }
  };

  const handleClearResults = async () => {
    try {
      await Excel.run(async (context) => {
        const range = context.workbook.worksheets.getActiveWorksheet().getRange('A1:B4');
        range.clear(Excel.ClearApplyTo.all);
        await context.sync();

        setState(prev => ({
          ...prev,
          message: 'Results cleared',
          messageType: MessageBarType.info
        }));
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        messageType: MessageBarType.error
      }));
    }
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
          <Text variant="small" className="header-subtitle">Monte Carlo Simulation</Text>
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

        <Stack tokens={{ childrenGap: 12 }}>
          <Text variant="medium">
            Welcome to Argo v5.0! This add-in provides professional Monte Carlo simulation
            and risk analysis capabilities for Excel.
          </Text>

          <Text variant="small">
            <strong>Quick Demo:</strong> Click "Run Demo Simulation" to generate 1,000 samples
            from a Normal distribution and see the results in your worksheet.
          </Text>
        </Stack>

        <Stack tokens={{ childrenGap: 8 }}>
          <PrimaryButton
            text="Run Demo Simulation"
            onClick={handleRunSimulation}
            disabled={state.isLoading}
            iconProps={{ iconName: 'Play' }}
          />
          <DefaultButton
            text="Clear Results"
            onClick={handleClearResults}
            disabled={state.isLoading}
            iconProps={{ iconName: 'Clear' }}
          />
        </Stack>

        {state.isLoading && (
          <Spinner size={SpinnerSize.medium} label="Running simulation..." />
        )}
      </Stack>

      {/* Footer */}
      <Stack className="app-footer">
        <Text variant="small" className="footer-text">
          Argo v5.0 | Booz Allen Hamilton
        </Text>
      </Stack>
    </div>
  );
};

export default App;
