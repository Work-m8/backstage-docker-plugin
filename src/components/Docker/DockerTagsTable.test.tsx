import React from 'react';
import { DockerTagsTable } from './DockerTagsTable';
import {
  renderInTestApp,
  setupRequestMockHandlers,
  TestApiProvider
} from '@backstage/test-utils';

import { Entity } from '@backstage/catalog-model';
import { EntityProvider } from '@backstage/plugin-catalog-react';

import { setupServer } from 'msw/node';

import { DockerApi, dockerApiRef } from '../../apis';

describe('DockerTagsTable', () => {
  const worker = setupServer();
  setupRequestMockHandlers(worker);

  const dockerApi: jest.Mocked<DockerApi> = {
    getRepositories: jest.fn()
  };

  let Wrapper: React.ComponentType<React.PropsWithChildren<{}>>;

  beforeEach(() => {
    Wrapper = ({ children }: { children?: React.ReactNode }) => (
      <TestApiProvider apis={[[dockerApiRef, dockerApi]]}>
        {children}
      </TestApiProvider>
    );
  });

  it('renders missing Annotation error', async () => {
    const entity: Entity = {
        apiVersion: 'v1',
        kind: 'Component',
        metadata: {
          name: 'my-name',
        },
      };
    const widget = await renderInTestApp(
        <Wrapper>
            <EntityProvider entity={entity}>
                <DockerTagsTable />
            </EntityProvider>
        </Wrapper>
    )
    expect(widget.getByText(/Missing Annotation/i)).toBeInTheDocument();
    expect(widget.getByText('docker.com/repository')).toBeInTheDocument();
  });

  it('renders basic table', async () => {
    const entity: Entity = {
        apiVersion: 'v1',
        kind: 'Component',
        metadata: {
          name: 'my-name',
          annotations: {
            'docker.com/repository': 'foo/bar'
          }
        },
      };
    
    dockerApi.getRepositories.mockResolvedValue({
        count: 1,
        results: [
            {
                name: 'V1.0.0',
                tag_status: 'Active',
                last_updater_username: 'TEST_USERNAME',
                images: [
                    {
                        architecture: 'AMD64'
                    }
                ]   
            }
        ]
    });

    const widget = await renderInTestApp(
        <Wrapper>
            <EntityProvider entity={entity}>
                <DockerTagsTable />
            </EntityProvider>
        </Wrapper>
    )

    expect(widget.getByText('Docker Tags (1)')).toBeInTheDocument();
    expect(widget.getByText('V1.0.0')).toBeInTheDocument();
    expect(widget.getByText('Active')).toBeInTheDocument();
    expect(widget.getByText('TEST_USERNAME')).toBeInTheDocument();
    expect(widget.getByText('AMD64')).toBeInTheDocument();
  });
  
  ['name', 'status', 'username', 'architecture'].forEach((column) => {
    it(`renders table with column ${column}`, async () => {
        const entity: Entity = {
            apiVersion: 'v1',
            kind: 'Component',
            metadata: {
              name: 'my-name',
              annotations: {
                'docker.com/repository': 'foo/bar'
              }
            },
          };
        
        dockerApi.getRepositories.mockResolvedValue({
            count: 1,
            results: [
                {
                    name: 'V1.0.0',
                    tag_status: 'Active',
                    last_updater_username: 'TEST_USERNAME',
                    images: [
                        {
                            architecture: 'AMD64'
                        }
                    ]   
                }
            ]
        });
    
        const widget = await renderInTestApp(
            <Wrapper>
                <EntityProvider entity={entity}>
                    <DockerTagsTable columns={[column]} />
                </EntityProvider>
            </Wrapper>
        )
    
        expect(widget.getByText('Docker Tags (1)')).toBeInTheDocument();

        switch (column) {
            case 'name':
                expect(widget.getByText('V1.0.0')).toBeInTheDocument();
                break;
            case 'status':
                expect(widget.getByText('Active')).toBeInTheDocument();
                break;
            case 'username':
                expect(widget.getByText('TEST_USERNAME')).toBeInTheDocument();
                break;
            case 'architecture':
                expect(widget.getByText('AMD64')).toBeInTheDocument();
                break;
        }
      });
  });

  it('renders empty table', async () => {
    const entity: Entity = {
        apiVersion: 'v1',
        kind: 'Component',
        metadata: {
          name: 'my-name',
          annotations: {
            'docker.com/repository': 'foo/bar'
          }
        },
      };
    
    dockerApi.getRepositories.mockResolvedValue({
        count: 0,
        results: []
    });

    const widget = await renderInTestApp(
        <Wrapper>
            <EntityProvider entity={entity}>
                <DockerTagsTable />
            </EntityProvider>
        </Wrapper>
    )
    expect(widget.getByText('Docker Tags (0)')).toBeInTheDocument();
    expect(widget.getByText('No records to display')).toBeInTheDocument();
  });

  it('renders a table with mock data', async () => {
    const entity: Entity = {
      apiVersion: 'v1',
      kind: 'Component',
      metadata: {
        name: 'my-name',
        annotations: {
          'docker.com/repository': 'foo/bar',
        },
      },
    };

    const columns = [
      {
        name: 'V1.0.0',
        tag_status: 'Active',
        last_updater_username: 'TEST',
      },
      {
        name: 'V0.9.0',
        tag_status: 'Inactive',
        last_updater_username: 'TEST',
      },
    ];
    dockerApi.getRepositories.mockResolvedValue({
      count: 2,
      results: columns,
    });

    const widget = await renderInTestApp(
      <Wrapper>
        <EntityProvider entity={entity}>
          <DockerTagsTable />
        </EntityProvider>
      </Wrapper>,
    );
    
    expect(widget.getByText('Docker Tags (2)')).toBeInTheDocument();
  });

  it('Renders custom header', async () => {
    const entity: Entity = {
        apiVersion: 'v1',
        kind: 'Component',
        metadata: {
          name: 'my-name',
          annotations: {
            'docker.com/repository': 'foo/bar'
          }
        },
      };
    
    dockerApi.getRepositories.mockResolvedValue({
        count: 0,
        results: []
    });

    const widget = await renderInTestApp(
        <Wrapper>
            <EntityProvider entity={entity}>
                <DockerTagsTable heading="Tags" />
            </EntityProvider>
        </Wrapper>
    )
    expect(widget.getByText('Tags (0)')).toBeInTheDocument();
  });
 
});