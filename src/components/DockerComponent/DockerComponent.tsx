import React, { useMemo, useState } from 'react';
import {
  MissingAnnotationEmptyState
} from '@backstage/core-components';
import { Entity } from '@backstage/catalog-model';

import { useApi } from '@backstage/core-plugin-api';

import { dockerApiRef, Repository } from '../../apis';

import { useEntity } from '@backstage/plugin-catalog-react';

export const ANNOTATION_DOCKER_REPOSITORY = 'docker.com/repository';

import { Box, Chip } from '@material-ui/core';
import {
  Table,
  TableColumn,
} from '@backstage/core-components';

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

const getColumns = (options: DockerImagesTableProps) => {

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

export interface DockerImagesTableProps {
    heading: string;
    columns: string[];
    initialPage: number;
    pageSize: number;
    pageSizeOptions: number[];
    showCountInHeading: boolean;
}
      
const DEFAULT_DOCKER_IMAGES_TABLE_PROPS: DockerImagesTableProps = {
    heading: 'Docker Images',
    columns: ['name', 'username', 'status', 'architecture'],
    initialPage: 0,
    pageSize: 5,
    pageSizeOptions: [5, 10, 25],
    showCountInHeading: true
}

export const DockerImagesTable = (props: Partial<DockerImagesTableProps>) => {
    const { entity } = useEntity();

    const options: DockerImagesTableProps = {
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
                            setContainersCount(res.count);
                            return {
                                data: res.results,
                                totalCount: res.count,
                                page: query.page
                            }
                        });
                }
                return Promise.resolve({
                    data: [],
                    page: 1,
                    totalCount: 0
                })
            }}
        />
  );
}