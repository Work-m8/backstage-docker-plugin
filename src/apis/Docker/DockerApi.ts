import { ConfigApi, DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';

import { DockerApi, TagsResponse } from './types';

export interface DockerClientOptions {
  fetchApi: FetchApi;
  discoveryApi: DiscoveryApi;
  configApi: ConfigApi;
}

export type Registry = 'Docker' | 'GitHub';

export class DockerClient implements DockerApi {
  constructor(private options: DockerClientOptions) {}


  async getRepositories(
    organization: string,
    repository: string,
    registry: Registry,
    pageNumber: number | string,
    pageSize: number,
  ): Promise<TagsResponse> {
    
    const baseUrl = await this.options.discoveryApi.getBaseUrl('');
    const url = registry === 'Docker' ? `/docker/v2/namespaces/${organization}/repositories/${repository}/tags` : `/docker/v2/${organization}/${repository}/tags/list`
    const targetUrl = `${baseUrl}proxy${url}`;

    const searchParams: URLSearchParams = new URLSearchParams();

    if (registry === 'Docker') {
      searchParams.append('page', pageNumber);
      searchParams.append('page_size', pageSize);
    } else if (registry === 'GitHub') {
      searchParams.append('n', pageSize);
      searchParams.append('last', pageNumber);
    }

    return new Promise((resolve, reject) => {
      this.options.fetchApi
        .fetch(`${targetUrl}?${searchParams.toString()}`)
        .then(res => res.json())
        .then(res => {
          if ('errinfo' in res) {
            return reject({
              name: 'Error',
              message: `Could not find namespace ${res.errinfo.namespace} or repository ${res.errinfo.repository}`,
            });
          }
          return resolve(res);
        });
    });
  }
}
