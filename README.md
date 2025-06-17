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

In each of the ```lambda``` subdirectories under ```aws```, run ```npm install```, then ```npm run build```. Then, in the ```aws``` directory,
run the following:

* ```npm install``` to download all dependencies.
* ```npm run clean``` to delete any old files.
* ```npm run compile``` to build the CDK scripts.
* ```npm run bundle``` to bundle lambda functions.
* ```yarn test``` to validate everything.
* ```cdk deploy Env/*``` to deploy to one of the following environments: Dev, Test, or Prod.

