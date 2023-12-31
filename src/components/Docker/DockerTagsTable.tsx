import React, { useMemo, useState } from 'react';

import { MissingAnnotationEmptyState, ErrorPanel } from '@backstage/core-components';
import { Entity } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import { Table, TableColumn } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';

import { Box, Chip } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

import { dockerApiRef, Repository } from '../../apis';

export const ANNOTATION_DOCKER_REPOSITORY = 'docker.com/repository';

const getDockerRepository = (entity: Entity) => 
    entity.metadata.annotations?.[ANNOTATION_DOCKER_REPOSITORY]?.trim();


const isDockerRepositoryAvailable = (entity: Entity) =>
    Boolean(getDockerRepository(entity));

const getDockerRepositoryUrl = (
  entity: Entity,
): { organization: string, repository: string } => {
  if (!isDockerRepositoryAvailable(entity)) {
    throw new Error(`Missing Docker annotation: ${ANNOTATION_DOCKER_REPOSITORY}`);
  }

  const dockerRepository = getDockerRepository(entity)!;

  const organization = dockerRepository.split('/')[0];
  const repository = dockerRepository.split('/')[1];

  return {
    organization,
    repository
  }
};

const getColumns = (options: DockerTagsTableProps) => {
    const columns: TableColumn[] = [];

    if ((options.columns || []).includes('name')) {
        columns.push({
            title: 'Name',
            field: 'name',
            width: 'auto',
            id: 'name'
        })
    }
    if ((options.columns || []).includes('username')) {
        columns.push({
            title: 'Username',
            field: 'last_updater_username',
            width: 'auto',
            id: 'username'
        })
    }
    if ((options.columns || []).includes('status')) {
        columns.push({
            title: 'Status',
            field: 'tag_status',
            width: 'auto',
            id: 'status',
            render: (row: Partial<Repository>) => (
                <Chip
                    label={row.tag_status}
                    color={row.tag_status === 'active' ? 'primary' : 'secondary'}
                    size="medium"
                    variant="default"
                    key={row.digest}
                    />
            )
        })
    }

    if ((options.columns || []).includes('architecture')) {
        columns.push({
            title: 'Architecture',
            field: 'architecture',
            width: 'auto',
            render: (row: Partial<Repository>) => (
                (row.images || []).map((image => (
                    <Chip
                        label={image.architecture}
                        variant="outlined"
                        color="primary"
                        size="medium"
                        key={image.digest}
                        />
                    ))
                )
            )
        })
    }

    return columns;  
}

export interface DockerTagsTableProps {
    heading: string;
    columns: string[];
    initialPage: number;
    pageSize: number;
    pageSizeOptions: number[];
    showCountInHeading: boolean;
}
      
const DEFAULT_DOCKER_IMAGES_TABLE_PROPS: DockerTagsTableProps = {
    heading: 'Docker Tags',
    columns: ['name', 'username', 'status', 'architecture'],
    initialPage: 0,
    pageSize: 5,
    pageSizeOptions: [5, 10, 25],
    showCountInHeading: true
}

export const DockerTagsTable = (props: Partial<DockerTagsTableProps>) => {
    const { entity } = useEntity();

    const options: DockerTagsTableProps = {
        ...DEFAULT_DOCKER_IMAGES_TABLE_PROPS,
        ...props,
    }

    if (!isDockerRepositoryAvailable(entity)) {
        return (<MissingAnnotationEmptyState
            annotation={ANNOTATION_DOCKER_REPOSITORY}
        />);
    }
    
    

    const dockerApi = useApi(dockerApiRef);
    const [containersCount, setContainersCount] = useState(0);
    const columns = useMemo(() => getColumns(options), []);
    const [error, setError] = useState< { message: string, name: string } | null>(null);

    if (error) {
        return <ErrorPanel error={error} />;
    }

    return (
        <Table
            columns={columns}
            options={{
                search: false,
                paging: true,
                initialPage: options.initialPage,
                pageSize: options.pageSize,
                pageSizeOptions: options.pageSizeOptions
            }}
            emptyContent={
                <Typography color="textSecondary">
                    No Git Tags found
                </Typography>
            }
            title={
                (
                    <Box display="flex" alignItems="center">
                        {options.showCountInHeading ? `${options.heading} (${containersCount})`: options.heading}
                    </Box>
                )
            }
            data={query => {
                if (query) {
                    const url = getDockerRepositoryUrl(entity)

                    return dockerApi.getRepositories(`/docker/v2/namespaces/${url.organization}/repositories/${url.repository}/tags`, (query.page + 1), query.pageSize)
                        .then((res) => {
                            console.log('RES', res);
                            setContainersCount(res.count);
                            return {
                                data: res.results,
                                totalCount: res.count,
                                page: query.page
                            }
                        }).catch((err: any) => {
                            setError({
                                message: err.message,
                                name: err.status
                            });
                            return Promise.resolve({
                                data: [],
                                page: 0,
                                totalCount: 0
                            })
                        });
                }
                return Promise.resolve({
                    data: [],
                    page: 0,
                    totalCount: 0
                })
            }}
        />
  );
}