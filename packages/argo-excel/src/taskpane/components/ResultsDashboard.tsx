import React from 'react';
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import './ResultsDashboard.css';

export interface SimulationResults {
  samples: number[];
  mean: number;
  median: number;
  stddev: number;
  min: number;
  max: number;
  p5: number;
  p25: number;
  p50: number;
  p75: number;
  p95: number;
}

interface ResultsDashboardProps {
  results: SimulationResults | null;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ results }) => {
  if (!results) {
    return (
      <Stack horizontalAlign="center" verticalAlign="center" className="no-results">
        <Text variant="large" className="no-results-text">
          No results yet. Run a simulation to see results here.
        </Text>
      </Stack>
    );
  }

  // Create histogram data
  const bins = 30;
  const binWidth = (results.max - results.min) / bins;
  const histogram: Array<{ bin: string; count: number; binStart: number }> = [];

  for (let i = 0; i < bins; i++) {
    const binStart = results.min + i * binWidth;
    const binEnd = binStart + binWidth;
    const count = results.samples.filter(s => s >= binStart && s < binEnd).length;

    histogram.push({
      bin: `${binStart.toFixed(1)}`,
      binStart,
      count
    });
  }

  // Create CDF data
  const sortedSamples = [...results.samples].sort((a, b) => a - b);
  const cdfData = sortedSamples
    .filter((_, i) => i % Math.ceil(sortedSamples.length / 100) === 0) // Sample 100 points
    .map((value, index, arr) => ({
      value: value.toFixed(2),
      probability: ((index + 1) / arr.length) * 100
    }));

  return (
    <Stack tokens={{ childrenGap: 20 }} className="results-dashboard">
      {/* Summary Statistics */}
      <Stack tokens={{ childrenGap: 12 }}>
        <Text variant="xLarge" className="dashboard-title">
          Simulation Results
        </Text>

        <div className="stats-grid">
          <div className="stat-card">
            <Text variant="small" className="stat-label">Mean</Text>
            <Text variant="large" className="stat-value">{results.mean.toFixed(2)}</Text>
          </div>
          <div className="stat-card">
            <Text variant="small" className="stat-label">Median</Text>
            <Text variant="large" className="stat-value">{results.median.toFixed(2)}</Text>
          </div>
          <div className="stat-card">
            <Text variant="small" className="stat-label">Std Dev</Text>
            <Text variant="large" className="stat-value">{results.stddev.toFixed(2)}</Text>
          </div>
          <div className="stat-card">
            <Text variant="small" className="stat-label">Min</Text>
            <Text variant="large" className="stat-value">{results.min.toFixed(2)}</Text>
          </div>
          <div className="stat-card">
            <Text variant="small" className="stat-label">Max</Text>
            <Text variant="large" className="stat-value">{results.max.toFixed(2)}</Text>
          </div>
          <div className="stat-card">
            <Text variant="small" className="stat-label">Samples</Text>
            <Text variant="large" className="stat-value">{results.samples.length.toLocaleString()}</Text>
          </div>
        </div>

        {/* Percentiles */}
        <div className="percentiles-bar">
          <div className="percentile">
            <Text variant="small">P5</Text>
            <Text variant="medium" className="percentile-value">{results.p5.toFixed(2)}</Text>
          </div>
          <div className="percentile-divider"/>
          <div className="percentile">
            <Text variant="small">P25</Text>
            <Text variant="medium" className="percentile-value">{results.p25.toFixed(2)}</Text>
          </div>
          <div className="percentile-divider"/>
          <div className="percentile">
            <Text variant="small">P50</Text>
            <Text variant="medium" className="percentile-value">{results.p50.toFixed(2)}</Text>
          </div>
          <div className="percentile-divider"/>
          <div className="percentile">
            <Text variant="small">P75</Text>
            <Text variant="medium" className="percentile-value">{results.p75.toFixed(2)}</Text>
          </div>
          <div className="percentile-divider"/>
          <div className="percentile">
            <Text variant="small">P95</Text>
            <Text variant="medium" className="percentile-value">{results.p95.toFixed(2)}</Text>
          </div>
        </div>
      </Stack>

      {/* Histogram */}
      <Stack tokens={{ childrenGap: 8 }}>
        <Text variant="large" className="chart-title">Distribution Histogram</Text>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={histogram}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="bin"
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#01807e" />
            <ReferenceLine x={results.mean.toFixed(1)} stroke="#263846" strokeWidth={2} label="Mean" />
          </BarChart>
        </ResponsiveContainer>
      </Stack>

      {/* CDF Chart */}
      <Stack tokens={{ childrenGap: 8 }}>
        <Text variant="large" className="chart-title">Cumulative Distribution Function</Text>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={cdfData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="value"
              tick={{ fontSize: 10 }}
              label={{ value: 'Value', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              label={{ value: 'Cumulative %', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            <Line type="monotone" dataKey="probability" stroke="#01807e" strokeWidth={2} dot={false} />
            <ReferenceLine y={50} stroke="#d13438" strokeDasharray="3 3" label="50%" />
            <ReferenceLine y={95} stroke="#ff8c00" strokeDasharray="3 3" label="95%" />
          </LineChart>
        </ResponsiveContainer>
      </Stack>
    </Stack>
  );
};
