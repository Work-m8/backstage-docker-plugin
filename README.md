# Workm8 Docker plugin


## Installation

Install the `@workm8/backstage-docker-plugin` package in your frontend app package:

```bash
# From your Backstage root directory
yarn add --cwd packages/app @workm8/backstage-docker-plugin
```

### Set the proxy
In your `app-config.yaml` located in the root directory we'll need to add a proxy to `hub.docker.com`.
Under `proxy`, add the following:

```yaml
proxy:
  endpoints:
    '/docker':
      target: 'https://hub.docker.com'
      changeOrigin: true
```

## Usage

### Update your EntityPage

In your `EntityPage.tsx` file located in `packages\app\src\components\catalog` we'll need to make a few changes to get the Docker 

First we need to add the following imports:

```ts
import { DockerTagsTableWidget } from '@workm8/backstage-docker-plugin';
```

You can display the Widget by adding the following code (for example, the `overviewContent`):

```diff
+ const dockerTagsContent = (
+    <DockerTagsTableWidget 
+       heading="Docker" 
+       columns={['name', 'username', 'status']} />
+ );

const overviewContent = (
  <Grid container spacing={3} alignItems="stretch">
    {entityWarningContent}
    <Grid item md={4}>
      <EntityAboutCard variant="gridItem" />
    </Grid>
    <Grid item md={4} xs={12}>
      <EntityCatalogGraphCard variant="gridItem" height={400} />
    </Grid>
+    <Grid item md={4} xs={12}>
+      {dockerTagsContent}
+    </Grid>
    <Grid item md={4} xs={12}>
      <EntityLinksCard />
    </Grid>
    <Grid item md={8} xs={12}>
      <EntityHasSubcomponentsCard variant="gridItem" />
    </Grid>
  </Grid>
);
```
### Annotate your components
By adding the `docker.com/repository` annotation to your component, the `DockerRepositoriesWidget` will fetch all the versions from `hub.docker.com`.

```diff
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: Grafana
  annotations:
+    docker.com/repository: 'grafana/grafana'
```

## Configuration
You can override the default header, columns and pagination. 

| Attribute | Type   | Default  | Description |
| --------- | ------ | -------- | ------- |
| heading   | String | `Docker` | The table Header |
| columns   | array  | `['name', 'username', 'status', 'architecture']` | The columns that are shown. Possible values: `name`, `username`, `status`, `architecture`|
| initialPage | number | 0 | The first page that is shown |
| pageSize    | number | 5 | The default page size |
| pageSizeOptions | array | `[5, 10, 25]` | Possible page sizes. Must include `pageSize` |
| showCountInHeading | boolean | true | If `true`, it shows the count of the total amount of Docker images in the heading. |

By default, the table looks like this.
<br />
<img src='docs/all_columns.png' width='460px' style="display:block;">

By disabling some columns, you can make it fit in smaller areas
<br />
<img src='docs/example.png' width='460px' style="display:block;">

## Private repositories
For private repositories, you need to create a [Personal Access Token](https://hub.docker.com/settings/security) on Docker Hub.
This Personal Access Token needs to be added in the proxy.

```diff
  endpoints:
    '/docker':
      target: 'https://hub.docker.com'
      changeOrigin: true
+      headers:
+        Authorization: {PERSONAL_ACCESS_TOKEN}
```

## Issues
If you come across any issues, please don't hesitate to open a [GitHub issue](https://github.com/work-m8/backstage-docker-plugin/issues).
