/**
 * Jest setup file for argo-excel tests
 *
 * Tests will be added in Sprint 11
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
