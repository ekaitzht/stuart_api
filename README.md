## Introduction

I have chosen NodeJS programming language with Expressjs framework. This decision was mainly made for two reasons. The main reason was performance. With NodeJS and Expressjs, we can receive many requests to the server concurrently. This is because Nodejs supports many concurrent requests with the event loop system and it doesn't hijack many threads in the CPU. Secondly, I have chosen these languages because I have worked with them in the past so I am able to effectively implement this solution.

In front of this NodeJS server, I have built a Nginx server as a reverse proxy. In the future, this server can act as a load balancer to the API so we can scale in accordance with the load of the system.

I have used MongoDB for the persistence of the data in a unique document so any write or read operation is atomic. I have also added a log system to track information with different debug levels (info, error, etc) so it is easier to debug the environment in production.

## How to run the project

Prerequisites: to run this project, you will need docker, npm and git installed in your computer.

1. Clone project

`git clone git@github.com:ekaitzht/stuart.git`

`cd stuart`

2. Build the docker containers

   `docker-compose build`

3. Run docker containers

   `docker-compose up`

4. Run tests

   1. `cd ./api`
   2. `npm install`
   3. `npm run test`

## Project questions

### We plan to run this service in the AWS environment. Prepare this API to be deployed.

I have implemented the application containerized with docker and docker-compose so we can be agnostic of the platform and it is easier to deploy the API. With this containerized application, you can deploy efficiently to an AWS EC2 instance.

In a production implementation, I would implement a CI/CD process. With this process, each merge to master will run docker builds, run automated tests and deploy to different environments (dev, test, qa and production).

In the future, if we need to scale this platform, we could do it faster because each service is in a docker container. Long term, if more flexibility becomes necessary, we could migrate the application to Kubernetes or implement a serverless approach.

### Come up with a smart and scalable output schema that is future-proof. Explain why you think it is so.

I would use a specification like [OpenAPI swagger](https://swagger.io/specification/) so we can document, track, versioning (track incompatible changes), test better the API and generate mock data.

### How about race conditions? How would you avoid race conditions if a lookup is being executed and a capacity update comes?

The main tool to control concurrency in APIs and avoid race conditions is to use [ETag Headers](https://www.ibm.com/support/knowledgecenter/SSQP76_8.9.0/com.ibm.odm.itoa.admin/topics/tsk_entities_update_etag.html). We could send Etags versions to the
/lookup for each courier so the clients will know when the data is stale.

### If you were to have more time, what would you do? Briefly explain what could be improved.

- I would build more tests with [Chai.js](https://www.chaijs.com/) and mock the database connections in order to have better testing and increase the reliability of the application.
- Create contract testing with tools like [pactjs](https://github.com/pact-foundation/pact-js) so we can prevent API breaking changes when multiple developers are working at the same time in a microservice environment. This should reduce the number of bugs that are shipped to production.
- The error messages are not standardized and I would standardize them to prevent confusion.
- I didn't environmentalize the application. For example, the URL connection to the database is not in a .env file following [12factor](https://12factor.net/).
- Also based on the requirements of the API we could build a Serverless application. This would reduce costs because we would not need to maintain servers manually and we would only pay for the time the API is actually being used.
- I would also add a security solution with a standard like JWT Web Tokens. This would prevent unauthorized access to the API.
- In a scenario where many stakeholders need to interact with the API, it would be useful to implement an API Management tool for management access users, security, rate limiting, etc.
- I would also implement a validator contract system like [express-validator](https://express-validator.github.io/docs/) in conjunction with OpenAPI Swagger to validate requests from the clients, making the API more user friendly and robust.
