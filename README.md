# OLAC Web Site

## Build Process

### 0. Build and Deploy the Sanity.IO Content Studio

Technically, this is optional since it only is for deploying the content editors to Sanity.IO. To do this, from the
```sanity``` directory, run the following:

* ```yarn``` to download all dependencies.
* ```yarm build``` to build the studio files.
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

