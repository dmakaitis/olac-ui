# OLAC Web Site

## Required Tools

First, make sure that nvm is installed. Then enter the following to use Node version 22 (this will need to be done each
time a new shell is opened):

```nvm use 22```

Next, ake sure pnpm is installed by entering ```pnpm --version```. If it is not, enter
```npm install --global pnpm```.

Once pnpm has been installed, make sure the following tools are installed by entering the listed command, and
if it isn't, use Yarn to install it globally:

| Tool       | Command to Check | Command to Install             |
|------------|------------------|--------------------------------|
| TypeScript | tsc --version    | pnpm -g add typescript@latest  |
| Sanity CLI | sanity --version | pnpm -g add sanity@latest      |
| Quasar CLI | quasar --version | pnpm -g add @quasar/cli@latest |
| AWS CDK    | cdk --version    | pnpm -g add aws-cdk@latest     |

Note that the terminal may need to be restarted after installing a tool before it will appear on the PATH. Don't
forget to use ```nvm``` to select the correct Node.js version every time the terminal is restarted.

## Build Process - Automatic

From the root directory of the project, run the ```pnpm -r build``` command. This will build all projects to prepare
them for deployment.

Once built, the code will still need to be manually deployed by running one or more of the following commands from the
```aws``` directory:

* ```pnpm deploy-dev```
* ```pnpm deploy-test```
* ```pnpm deploy-prod```

Optionally, if any changes have been made to the Sanity schemas, run the following command from the ```sanity```
directory:

* ```sanity login``` (if needed - use the Google account)
* ```pnpm deploy```

See below for additional details on what is actually being done.

## Build Process - Manual

### 0. Build and Deploy the Sanity.IO Content Studio

Technically, this is optional since it only is for deploying the content editors to Sanity.IO. To do this, from the
```sanity``` directory, run the following:

* ```pnpm install``` to download all dependencies.
* ```sanity login``` to log into Sanity IO (use Google account to authenticate).
* ```pnpm deploy``` to deploy the studio files to Sanity.IO.

Once deployed, the editor can be accessed at [https://olac.sanity.studio](https://olac.sanity.studio).

### 1. Build the Quasar UI

The UI for the website is located in the ```quasar``` directory and must be built before it can be deployed to AWS.
To build the UI, run the following from the ```quasar``` directory:

* ```pnpm install``` to download all dependencies.
* ```pnpm build``` to build the UI. The static files that need to be deployed to AWS will be placed into the
  ```quasar/dist/spa``` directory.

### 2. Build and Deploy the AWS CDK Stack

In the ```aws``` directory, run the following:

* ```pnpm install``` to download all dependencies.
* ```pnpm build``` to compile all CDK scripts and lambdas.
* ```pnpm test``` to validate everything. If snapshot validations fail, first verify there really isn't a problem,
  then update the snapshots with ```pnpm test -u```.
* ```pnpm deploy-env``` to deploy to one of the following environments: ```dev```, ```test```, or ```prod```.
