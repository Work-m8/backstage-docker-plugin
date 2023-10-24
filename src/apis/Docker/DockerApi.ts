import { ConfigApi, DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';

import { DockerApi, TagsResponse } from './types';

export interface DockerClientOptions {
  fetchApi: FetchApi;
  discoveryApi: DiscoveryApi;
  configApi: ConfigApi;
}

export class DockerClient implements DockerApi {
  constructor(private options: DockerClientOptions) {}

  async getRepositories(
    url: string,
    pageNumber: number,
    pageSize: number,
  ): Promise<TagsResponse> {
    const baseUrl = await this.options.discoveryApi.getBaseUrl('');

    const targetUrl = `${baseUrl}proxy${url}`;

    return new Promise((resolve, reject) => {
      this.options.fetchApi
        .fetch(`${targetUrl}?page=${pageNumber}&page_size=${pageSize}`)
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
