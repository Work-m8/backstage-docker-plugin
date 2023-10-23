import { createApiRef } from '@backstage/core-plugin-api';

type Status = 'active' | 'inactive';

export type Image = {
  architecture: string;
  features: string;
  variant?: string;
  digest: string;
  os: string;
  os_features: string;
  os_version?: string;
  size: number;
  status: Status;
  last_pulled: string;
  last_pushed: string;
};

export type Repository = {
  creator: number;
  id: number;
  images: Image[];
  last_updated: string;
  last_updater: number;
  last_updated_username: string;
  name: string;
  repository: number;
  full_size: number;
  v2: boolean;
  tag_status: string;
  tag_last_pulled: string;
  tag_last_pushed: string;
  media_type: string;
  content_type: string;
  digest: string;
};

export type TagsResponse = {
  count: number;
  next?: string;
  previous?: string;
  results: Repository[];
};

export interface DockerApi {
  getRepositories(
    url: string,
    pageNumber: number,
    pageSize: number,
  ): Promise<TagsResponse>;
}

/**
 * ApiRef for the DockerApi.
 *
 * @public
 */
export const dockerApiRef = createApiRef<DockerApi>({
  id: 'plugin.docker.api',
});
