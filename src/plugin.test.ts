import { dockerPlugin } from './plugin';

describe('docker', () => {
  it('should export plugin', () => {
    expect(dockerPlugin).toBeDefined();
  });
});
