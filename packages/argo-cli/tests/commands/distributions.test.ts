/**
 * Tests for 'argo distributions' command
 *
 * Following TDD - these tests are written BEFORE implementation
 */

import { listDistributions, executeDistributionsCommand } from '../../src/commands/distributions';

describe('distributions command', () => {
  describe('listDistributions', () => {
    it('should return an array of distribution names', () => {
      const distributions = listDistributions();

      expect(Array.isArray(distributions)).toBe(true);
      expect(distributions.length).toBeGreaterThan(0);
    });

    it('should include all continuous distributions', () => {
      const distributions = listDistributions();

      expect(distributions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Normal' }),
          expect.objectContaining({ name: 'Uniform' }),
          expect.objectContaining({ name: 'Triangular' }),
          expect.objectContaining({ name: 'LogNormal' }),
          expect.objectContaining({ name: 'Exponential' }),
          expect.objectContaining({ name: 'Beta' }),
          expect.objectContaining({ name: 'Gamma' }),
          expect.objectContaining({ name: 'Weibull' }),
          expect.objectContaining({ name: 'Pareto' }),
          expect.objectContaining({ name: 'PERT' }),
        ])
      );
    });

    it('should include all discrete distributions', () => {
      const distributions = listDistributions();

      expect(distributions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Binomial' }),
          expect.objectContaining({ name: 'Poisson' }),
          expect.objectContaining({ name: 'Geometric' }),
          expect.objectContaining({ name: 'Hypergeometric' }),
        ])
      );
    });

    it('should include distribution type (continuous or discrete)', () => {
      const distributions = listDistributions();

      for (const dist of distributions) {
        expect(dist).toHaveProperty('name');
        expect(dist).toHaveProperty('type');
        expect(['continuous', 'discrete']).toContain(dist.type);
      }
    });

    it('should include distribution description', () => {
      const distributions = listDistributions();

      for (const dist of distributions) {
        expect(dist).toHaveProperty('description');
        expect(typeof dist.description).toBe('string');
        expect(dist.description.length).toBeGreaterThan(0);
      }
    });

    it('should include distribution parameters', () => {
      const distributions = listDistributions();

      // Check Normal distribution parameters
      const normal = distributions.find((d) => d.name === 'Normal');
      expect(normal).toBeDefined();
      expect(normal?.parameters).toEqual(['mean', 'stddev']);

      // Check Uniform distribution parameters
      const uniform = distributions.find((d) => d.name === 'Uniform');
      expect(uniform).toBeDefined();
      expect(uniform?.parameters).toEqual(['min', 'max']);

      // Check Triangular distribution parameters
      const triangular = distributions.find((d) => d.name === 'Triangular');
      expect(triangular).toBeDefined();
      expect(triangular?.parameters).toEqual(['min', 'mode', 'max']);
    });

    it('should return distributions sorted alphabetically by name', () => {
      const distributions = listDistributions();
      const names = distributions.map((d) => d.name);
      const sortedNames = [...names].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

      expect(names).toEqual(sortedNames);
    });

    it('should have exactly 14 distributions (10 continuous + 4 discrete)', () => {
      const distributions = listDistributions();

      expect(distributions.length).toBe(14);

      const continuous = distributions.filter((d) => d.type === 'continuous');
      const discrete = distributions.filter((d) => d.type === 'discrete');

      expect(continuous.length).toBe(10);
      expect(discrete.length).toBe(4);
    });
  });

  describe('executeDistributionsCommand', () => {
    let consoleLogSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
    });

    it('should print distribution count header', () => {
      executeDistributionsCommand();

      expect(consoleLogSpy).toHaveBeenCalledWith('\n📊 Argo Probability Distributions\n');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Total: 14 distributions (10 continuous, 4 discrete)')
      );
    });

    it('should print continuous distributions header', () => {
      executeDistributionsCommand();

      expect(consoleLogSpy).toHaveBeenCalledWith('Continuous Distributions:');
    });

    it('should print discrete distributions header', () => {
      executeDistributionsCommand();

      expect(consoleLogSpy).toHaveBeenCalledWith('\nDiscrete Distributions:');
    });

    it('should print all continuous distributions with descriptions', () => {
      executeDistributionsCommand();

      const continuousDistributions = ['Normal', 'Uniform', 'Triangular', 'LogNormal', 'Exponential',
                                       'Beta', 'Gamma', 'Weibull', 'Pareto', 'PERT'];

      for (const dist of continuousDistributions) {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining(dist)
        );
      }
    });

    it('should print all discrete distributions with descriptions', () => {
      executeDistributionsCommand();

      const discreteDistributions = ['Binomial', 'Poisson', 'Geometric', 'Hypergeometric'];

      for (const dist of discreteDistributions) {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining(dist)
        );
      }
    });

    it('should print parameters for each distribution', () => {
      executeDistributionsCommand();

      // Check that Parameters: is printed for each distribution
      const parameterCalls = consoleLogSpy.mock.calls.filter(call =>
        call[0].includes('Parameters:')
      );

      // Should have 14 parameter lines (one for each distribution)
      expect(parameterCalls.length).toBe(14);
    });

    it('should print GitHub URL at the end', () => {
      executeDistributionsCommand();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('https://github.com/montge/argo')
      );
    });
  });
});
