/**
 * Jest setup file for argo-excel tests
 */

// Mock Office.js
global.Office = {
  context: {
    document: {},
    workbook: {}
  },
  onReady: jest.fn((callback) => {
    if (callback) callback({ host: 'Excel' });
    return Promise.resolve({ host: 'Excel' });
  })
} as any;

global.Excel = {
  run: jest.fn()
} as any;

// Mock ResizeObserver for Recharts
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));
