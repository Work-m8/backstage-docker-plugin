import {
  configApiRef,
  createApiFactory,
  createComponentExtension,
  createPlugin,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';

import { dockerApiRef, DockerClient } from './apis';

export const dockerTagsPlugin = createPlugin({
  id: 'docker.tags',
  apis: [
    createApiFactory({
      api: dockerApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
        configApi: configApiRef,
      },
      factory({ discoveryApi, fetchApi, configApi }) {
        return new DockerClient({ discoveryApi, fetchApi, configApi });
      },
    }),
  ],
});

export const DockerTagsTableWidget = dockerTagsPlugin.provide(
  createComponentExtension({
    name: 'DockerTagsTable',
    component: {
      lazy: () =>
        import('./components/Docker/DockerTagsTable').then(
          d => d.DockerTagsTable,
        ),
    },
  }),
);
