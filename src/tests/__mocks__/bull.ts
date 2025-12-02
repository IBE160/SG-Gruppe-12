import { jest } from '@jest/globals';

class MockQueue {
  name: string;

  constructor(name: string, _options?: any) {
    this.name = name;
  }

  add = jest.fn<any>().mockResolvedValue({ id: 'mock-job-id' });
  process = jest.fn<any>();
  on = jest.fn<any>();
  close = jest.fn<any>().mockResolvedValue(undefined);
  getJob = jest.fn<any>();
  getJobs = jest.fn<any>().mockResolvedValue([]);
  getJobCounts = jest.fn<any>().mockResolvedValue({
    waiting: 0,
    active: 0,
    completed: 0,
    failed: 0,
    delayed: 0,
  });
}

export default MockQueue;
