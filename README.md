![alt text](https://hyper-mega-public.s3.amazonaws.com/hypermediatech-01-high-resolution-dark_500.png "hypermedia.tech" )

author: bruno@hypermedia.tech

## generic serverless microservice chassis V2.0

_NOTE: DOCUMENTATION OF V2 IS A WORK IN PROGRESS HOWEVER THE CHASSIS IS COMPLETE AND CAN BE USED WITH SOME FINESSE
      V1.0 IS TAGGED AND CAN ALSO BE USED STILL FOR MORE BASIC CONFIGURATIONS_

this is a very simple serverless microservice chassis that allows rapid deployment of new microservices to the the AWS cloud.

the stack includes most of the plumbing required to get developing within minutes of deployment, testing, docs, coverage etc. review the package.json file for a list of testing and deployment scripts.

### serverless AWS deployment credentials.

you will need to create AWS credentials and install them into a profile locally. this will allow serverless to deploy to your account in an automatic fashion.

you can keep multiple profiles and deploy to them using command line options.

refer to the following guide on configuring credentials.
[serverless credential config](https://serverless.com/framework/docs/providers/aws/guide/credentials/)

for most new users of AWS this is the most frustrating step, dont be disheartened by it!

### Prerequisites

the following are all one off configurations, ie: once this has been performed for a single microservice on a shared domain it is not required for subsequent microservices

1) the chassis assumes the use of a custom domain, the name must be set in the environmentSpecific.yaml file, either as a reference to SSM or locally in that file, examples of each are present.

2) domain is configured in route 53

3) SSL certificate configured for domain in [Certificate Manager](https://aws.amazon.com/certificate-manager/)

4) custom domain configured in API Gateway including an alias pointing to the cloudfront URI generated in this step.

5) [add user for cloudwatch and apig](https://aws.amazon.com/premiumsupport/knowledge-center/api-gateway-cloudwatch-logs/)

once these have been done search for YYYYY and PROJECTNAME within package.json, serveress.yml, configurators and environmentSpecific.yml and replace with appropriate values.

this chassis has served me well but is customised slightly for production projects. please feel free to ask questions or propose improvements via pull or email.

### architecture

it is recommended you follow the laid out structure:

#### continuous integration

this chassis includes a circleCi configuration, i have left my personal dev account config in here as an example. we add a workflow per developer/stage, if you choose to do the same you will need to [configure your context in circleCi](https://circleci.com/docs/2.0/contexts/) either with the credentials created above or a specific set (the latter is strongly recommended).

#### configurators folder

the majority of AWS resurces have been configured in this folder already, a shared table and queue etc.

custom resources will be required for some projects, the cloudformation configuration files should be placed here and referenced in the Resources section of serverless.yml

#### src folder

The src folder contains boiler plate, helpers and domain business logic.

***TODO: DESCRIBE IN DETAIL***

#### test folder

serverless.yml is configured to use mocha testing out of the box, it will look for tests within the provided test structure.