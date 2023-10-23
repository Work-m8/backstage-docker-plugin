import {
  configApiRef,
  createApiFactory,
  createComponentExtension,
  createPlugin,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { dockerApiRef, DockerClient } from './apis';

export const dockerPlugin = createPlugin({
  id: 'docker',
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

export const DockerRepositoriesWidget = dockerPlugin.provide(
  createComponentExtension({
    name: 'DockerRepositoriesWidget',
    component: {
      lazy: () =>
        import('./components/DockerComponent/DockerComponent').then(
          d => d.DockerImagesTable,
        ),
    },
  }),
);
