import React from 'react';
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
import { Image } from '@fluentui/react/lib/Image';
import { DefaultButton } from '@fluentui/react/lib/Button';
import './DistributionSelector.css';

export type DistributionType =
  | 'normal'
  | 'uniform'
  | 'triangular'
  | 'lognormal'
  | 'exponential'
  | 'beta'
  | 'gamma'
  | 'weibull'
  | 'pareto'
  | 'pert'
  | 'binomial'
  | 'poisson'
  | 'geometric'
  | 'hypergeometric';

interface DistributionInfo {
  id: DistributionType;
  name: string;
  icon: string;
  description: string;
  continuous: boolean;
}

const DISTRIBUTIONS: DistributionInfo[] = [
  {
    id: 'normal',
    name: 'Normal',
    icon: '/assets/distributions/dist-normal-48.png',
    description: 'Bell-shaped, symmetric distribution',
    continuous: true
  },
  {
    id: 'uniform',
    name: 'Uniform',
    icon: '/assets/distributions/dist-uniform-48.png',
    description: 'Equal probability across range',
    continuous: true
  },
  {
    id: 'triangular',
    name: 'Triangular',
    icon: '/assets/distributions/dist-triangular-48.png',
    description: 'Simple three-point estimate',
    continuous: true
  },
  {
    id: 'lognormal',
    name: 'Log-Normal',
    icon: '/assets/distributions/dist-lognormal-48.png',
    description: 'Right-skewed, multiplicative',
    continuous: true
  },
  {
    id: 'exponential',
    name: 'Exponential',
    icon: '/assets/distributions/dist-exponential-48.png',
    description: 'Time between events',
    continuous: true
  },
  {
    id: 'beta',
    name: 'Beta',
    icon: '/assets/distributions/dist-beta-48.png',
    description: 'Bounded between 0 and 1',
    continuous: true
  },
  {
    id: 'gamma',
    name: 'Gamma',
    icon: '/assets/distributions/dist-gamma-48.png',
    description: 'Flexible right-skewed',
    continuous: true
  },
  {
    id: 'weibull',
    name: 'Weibull',
    icon: '/assets/distributions/dist-weibull-48.png',
    description: 'Reliability analysis',
    continuous: true
  },
  {
    id: 'pareto',
    name: 'Pareto',
    icon: '/assets/distributions/dist-pareto-48.png',
    description: 'Power law, long tail',
    continuous: true
  },
  {
    id: 'pert',
    name: 'PERT',
    icon: '/assets/distributions/dist-pert-48.png',
    description: 'Smooth triangular',
    continuous: true
  },
  {
    id: 'binomial',
    name: 'Binomial',
    icon: '/assets/distributions/dist-binomial-48.png',
    description: 'Success/failure trials',
    continuous: false
  },
  {
    id: 'poisson',
    name: 'Poisson',
    icon: '/assets/distributions/dist-poisson-48.png',
    description: 'Count of rare events',
    continuous: false
  },
  {
    id: 'geometric',
    name: 'Geometric',
    icon: '/assets/distributions/dist-geometric-48.png',
    description: 'Trials until success',
    continuous: false
  },
  {
    id: 'hypergeometric',
    name: 'Hypergeometric',
    icon: '/assets/distributions/dist-hypergeometric-48.png',
    description: 'Sampling without replacement',
    continuous: false
  }
];

interface DistributionSelectorProps {
  selectedDistribution: DistributionType | null;
  onSelectDistribution: (distribution: DistributionType) => void;
}

export const DistributionSelector: React.FC<DistributionSelectorProps> = ({
  selectedDistribution,
  onSelectDistribution
}) => {
  const continuousDistributions = DISTRIBUTIONS.filter(d => d.continuous);
  const discreteDistributions = DISTRIBUTIONS.filter(d => !d.continuous);

  const renderDistributionCard = (dist: DistributionInfo) => {
    const isSelected = selectedDistribution === dist.id;

    return (
      <DefaultButton
        key={dist.id}
        className={`distribution-card ${isSelected ? 'selected' : ''}`}
        onClick={() => onSelectDistribution(dist.id)}
      >
        <Stack tokens={{ childrenGap: 8 }} horizontalAlign="center">
          <Image
            src={dist.icon}
            alt={dist.name}
            width={48}
            height={48}
            className="distribution-icon"
          />
          <Text variant="medium" className="distribution-name">
            {dist.name}
          </Text>
          <Text variant="small" className="distribution-description">
            {dist.description}
          </Text>
        </Stack>
      </DefaultButton>
    );
  };

  return (
    <Stack tokens={{ childrenGap: 20 }}>
      <Stack tokens={{ childrenGap: 12 }}>
        <Text variant="large" className="section-title">
          Continuous Distributions
        </Text>
        <div className="distribution-grid">
          {continuousDistributions.map(renderDistributionCard)}
        </div>
      </Stack>

      <Stack tokens={{ childrenGap: 12 }}>
        <Text variant="large" className="section-title">
          Discrete Distributions
        </Text>
        <div className="distribution-grid">
          {discreteDistributions.map(renderDistributionCard)}
        </div>
      </Stack>
    </Stack>
  );
};
