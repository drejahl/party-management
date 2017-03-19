## Implementation of the TM Forum Party Management API

**TM Forum [API Overview](https://projects.tmforum.org/wiki/display/API/Open+API+Table)**

This is *work in progress*. It includes draft tests with hypermedia extensions (hal+json).

### Overview
![architecture](./docs/overview.png)

### Getting started

- Clone this repository locally
- Install required modules: 'npm install'
- Start mongodb: 'npm run mongo-init' (inital start-up) or 'npm run mongo-up' (start server)
- Start REST API: 'swagger project start'

#### Client UI (locally) ####
- 'cd client'
- 'npm run dev'

### Deployment with docker

#### Run with docker-compose

- docker-compose up

(this fetches the API service and MongoDB from Docker Hub)

#### Build container locally 

- docker build -t [your-docker-hub-name]/tmfapi-party-management .
