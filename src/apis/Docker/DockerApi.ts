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
    console.log(this.options.configApi);
    const baseUrl = await this.options.discoveryApi.getBaseUrl('');

    const targetUrl = `${baseUrl}proxy${url}`;

    return this.options.fetchApi
      .fetch(`${targetUrl}?page=${pageNumber}&page_size=${pageSize}`)
      .then(res => res.json());
  }
}
