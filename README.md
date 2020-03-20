## Generic serverless microservice chassis

- [Serverless AWS deployment credentials](#serverless-aws-deployment-credentials)
- [Prerequisites](#prerequisites)
- [Architecture](#architecture)
    - [Continuous integration](#continuous-integration)
    - [Configurators folder](#configurators-folder)
    - [Lib folder](#lib-folder)
    - [Test folder](#test-folder)
- [Serverless Offline Needs work](#serverless-offline-needs-work)

This is a very simple serverless microservice chassis that allows rapid deployment of new microservices to the the AWS cloud.

The stack includes most of the plumbing required to get developing within minutes of deployment, testing, docs, coverage etc. Review the `package.json` file for a list of testing and deployment scripts.

### Serverless AWS deployment credentials.

You will need to create AWS credentials and install them into a profile locally. this will allow serverless to deploy to your account in an automatic fashion.

You can keep multiple profiles and deploy to them using command line options.

Refer to the following guide on configuring credentials.
[Serverless credential config](https://serverless.com/framework/docs/providers/aws/guide/credentials/)

For most new users of AWS this is the most frustrating step, don't be disheartened by it!

### Prerequisites

The following are all one off configurations, ie: once this has been performed for a single microservice on a shared domain it is not required for subsequent microservices

1) the chassis assumes the use of a custom domain, the name must be set in the `environmentSpecific.yaml` file, either as a reference to SSM or locally in that file, examples of each are present.

2) domain is configured in route 53

3) SSL certificate configured for domain in [Certificate Manager](https://aws.amazon.com/certificate-manager/)

4) custom domain configured in API Gateway including an alias pointing to the cloudfront URI generated in this step.

5) [add user for cloudwatch and apig](https://aws.amazon.com/premiumsupport/knowledge-center/api-gateway-cloudwatch-logs/)

Once these have been done search for YYYYY and PROJECTNAME within `package.json`, `serveress.yml`, configurators and `environmentSpecific.yml` and replace with appropriate values.

This chassis has served me well but is customised slightly for production projects. Please feel free to ask questions or propose improvements via a pull request or email.

### Architecture

It is recommended you follow the laid out structure:

#### Continuous integration

This chassis includes a CircleCi configuration, I have left my personal dev account config in here as an example. We add a workflow per developer/stage, if you choose to do the same you will need to [configure your context in circleCi](https://circleci.com/docs/2.0/contexts/) either with the credentials created above or a specific set (the latter is strongly recommended).

#### Configurators folder

This is where serverless components like tables, streams and bindings should be created. these are then referenced in the resources section of `serverless.yml`

#### Lib folder

This is where I structure the actual code for the service, this code is usually referenced from the `handler.js` file though some uses may be referred to directly by the `serverless.yml` config.

I prefer to create subfolders here for complex domain specific functionality such as factory modules and keep general server interfaces etc in the root.

#### Test folder

`serverless.yml` is configured to use mocha testing out of the box, it will look for tests within the provided test structure.

### Serverless Offline Needs work

I have not been working in an offline mode, instead using the included CircleCI script to test in a dev environment, do with the repo what you please but i welcome and encourage assistance in configuring and documenting serverless, dynamo and kinesis offline support.

Author: bruno@hypermedia.tech

![alt text](https://hyper-mega-public.s3.amazonaws.com/hypermediatech-01-high-resolution-dark_500.png "hypermedia.tech" )
