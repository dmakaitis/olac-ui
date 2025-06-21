# OLAC Web Site

## Required Tools

First, make sure that nvm is installed. Then enter the following to use Node version 22 (this will need to be done each
time a new shell is opened):

```nvm use 22```

Next, make sure pnpm is installed by entering ```pnpm --version```. If it is not, enter
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

## Build Process

From the root directory of the project, run the following commands:

* ```pnpm install``` - Downloads and installs all dependencies for all packages.
* ```pnpm lint``` - Runs the linter on TypeScript source files (optional, if source files have been updated)
* ```pnpm build``` - Compiles all code and builds artifacts for deployment.
* ```pnpm test``` - Runs any unit tests for all packages.

Once the above commands have been executed, the following commands will deploy the different modules:

* ```pnpm deploy-sanity``` - Deploys the Sanity Studio editor to enable editing of articles. The studio may be
  launched from https://olac.sanity.studio/structure (use Google account to authenticate).
* ```pnpm deploy-dev``` - Deploys the site to AWS in the "developer" environment. Once deployed, the site can be
  launched from https://dev.omahalithuanians.org. This environment is intended for developer testing.
* ```pnpm deploy-test``` - Deploys the site to AWS in the "test" environment. Once deployed, the site can be
  launched from https://test.omahalithuanians.org. This environment is intended for UAT testing.
* ```pnpm deploy-prod``` - Deploys the site to AWS in the "production" environment. Once deployed, the site can be
  launched from https://omahalithuanians.org

Note that deployments will require authentication. For AWS deployments, log into the AWS console and follow the
instructions there to utilize the Access Keys. For Sanity, run the ```sanity login``` command from the 
```packages/sanity``` directory.

The OLAC site also includes an admin interface. To access it, append "/#/login" to the end of the URL's above. Once
you have authenticated once, a cookie will be stored that will enable a login/logout button on the right side of the
banner at the top of the web site.

### Updating Dependencies

To update dependencies for a package, run the following command from the directory containing that package:

```pnpm update -i```

To update to a new major version, use the following command:

```pnpm update -i --latest```

Test everything before committing changes, including testing in the developer environment.
