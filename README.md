# OLAC Web Site

## Required Tools

First, make sure that nvm is installed. Then enter the following to use Node version 22:

```nvm use 22```

Next, ake sure Yarn is installed by entering ```yarn --version```. If it is not, enter
```npm install --global yarn```.

Once Yarn has been installed, make sure the following tools are installed by entering the listed command, and
if it isn't, use Yarn to install it globally:

| Tool       | Command to Check | Command to Install                |
|------------|------------------|-----------------------------------|
| TypeScript | tsc --version    | yarn global add typescript@latest |
| Sanity CLI | sanity --version | yarn global add sanity@latest |
| Quasar CLI | quasar --version | yarn global add @quasar/cli@latest |
| AWS CDK | cdk --version | yarn global add aws-cdk@latest |

Note that the terminal may need to be restarted after installing a tool before it will appear on the PATH. Don't
forget to use ```nvm``` to select the correct Node.js version after restarting the terminal.

## Build Process

### 0. Build and Deploy the Sanity.IO Content Studio

Technically, this is optional since it only is for deploying the content editors to Sanity.IO. To do this, from the
```sanity``` directory, run the following:

* ```yarn``` to download all dependencies.
* ```sanity login``` to log into Sanity IO (use Google account to authenticate).
* ```yarn deploy``` to deploy the studio files to Sanity.IO.

Once deployed, the editor can be accessed at [https://olac.sanity.studio](https://olac.sanity.studio).

### 1. Build the Quasar UI

The UI for the website is located in the ```quasar``` directory and must be built before it can be deployed to AWS.
To build the UI, run the following from the ```quasar``` directory:

* ```yarn``` to download all dependencies.
* ```quasar build``` to build the UI. The static files that need to be deployed to AWS will be placed into the
  ```quasar/dist/spa``` directory.

### 2. Build and Deploy the AWS CDK Stack

In the ```aws``` directory, run the following:

* ```yarn``` to download all dependencies.
* ```yarn build``` to compile all CDK scripts and lambdas.
* ```yarn test``` to validate everything.
* ```yarn deploy-env``` to deploy to one of the following environments: ```dev```, ```test```, or ```prod```.

