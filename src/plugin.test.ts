import { DockerClient } from './apis';
import { dockerTagsPlugin } from './plugin';

describe('docker', () => {
  it('should export plugin', () => {
    expect(dockerTagsPlugin).toBeDefined();
  });
  it('Should have the docker API', () => {
    const apiFactories = Array.from(dockerTagsPlugin.getApis());
    expect(apiFactories.length).toBe(1);
    expect(apiFactories[0].factory({})).toBeInstanceOf(DockerClient);
  });
});
