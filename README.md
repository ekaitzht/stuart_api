## Architectural platform:

I have decided to use NodeJS programming language with Expressjs framework, a part that is a language that I feel comfortable, I came with this solution for performance reasons. Because We can have many clients requesting at the same time. Nodejs support many concurrent requests with the event loop system and it doesn't hijack many threads in the CPU.

In front of this NodeJS server, I have created a very simple Nginx server as a reverse proxy, where in
the future this server could act as a load balancer to the API.

The persistence of the data I have done in MongoDB in a unique document so any write or read operation in the document is atomic.
I have to mention that MongoDB, NodeJS server, and the Nginx is each one in a docker container deployable with docker-compose.
I have added a log system to track logging in the system with different debug levels (info, error, etc)

## How to run the project

Prerequisites: I assume you have install, docker, npm and git.

1. Clone project
   `git clone git@github.com:ekaitzht/stuart.git`
   `cd stuart`

1. Build the docker containers

   `docker-compose build`

1. Run docker containers

   `docker-compose up`

#3 Run tests

    1. `cd ./api`
    2. `npm install`
    3. `npm run test`

### We plan to run this service in the AWS environment. Prepare this API to be deployed.

I have decided to implement my application containerized with docker and docker-compose so we are agnostic of the platform an easier to deploy the API. You could create AWS EC2 instance and deploy there with the docker-compose.yml configuration.

Due limit time restrictions in a production environment I would implement a proper CI/CD so each merge to master will run docker builds,
run automated tests and finally deploy to different environments dev, test, qa and production.

If in the future we need to scale this platform we could scale it easily because everything is in docker container. And in the long term for more flexibility we could migrate to Kubernetes.

### Come up with a smart and scalable output schema that is future-proof. Explain why you think it is so.

I would use something like [OpenAPI swagger specification](https://swagger.io/specification/) so we document, track, versioning (track incompatible changes), test properly the API and easier to generate mock APIs.

### How about race conditions? How would you avoid race conditions if a lookup is being executed and a capacity update comes?

The main tool for concurrency control in APIs and avoid race conditions is to use [ETag Header](https://www.ibm.com/support/knowledgecenter/SSQP76_8.9.0/com.ibm.odm.itoa.admin/topics/tsk_entities_update_etag.html) we could send etags versions to the
/lookup for each courier so the clients will know when to update the resource because they will know if the resource is stale.

### If you were to have more time, what would you do? Briefly explain what could be improved.

- I would do some more tests with chai a nd I would do more integration tests mocking for example connections
  to the database.
- Create some contract testing with tools like [pactjs](https://github.com/pact-foundation/pact-js)
- The error messages are not well standardized and I will improve these messages.
- Also I didn't environmentalize the application like for example MongoDB URL in a .env variable following [12factor](https://12factor.net/).
- Also depending on the requirements of the API we could do Serverless application, saving resources and forgetting a lot about server operations.
- In a production API I will add a security system something like JWT Web Tokens.
- If many stakeholders are going to interact with API it would be useful to implement API Management tool for management access users, security, rate limiting, etc.
  -  A validator contract system [express-validator](https://express-validator.github.io/docs/) would be great to validate requests from the clients.
