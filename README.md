# LutherNavigator

The Luther Navigator project seeks to provide students a way to share their experiences abroad.

## Setup

Below are listed the prerequisites for running the app locally.

### Node and NPM

Node.js and NPM can be installed [here](https://nodejs.org/en/).

Node version (`node -v`): 12.19.0
NPM version (`npm -v`): 6.13.4

### Heroku CLI

The Heroku Command Line Interface can be installed [here](https://devcenter.heroku.com/articles/heroku-cli).

## Cloning the Project

```console
$ git clone https://github.com/WKHAllen/LutherNavigator.git
```

## Running the Project

We have provided scripts to build and run the application. The built application can be accessed at [localhost:3000](http://localhost:3000/).

### Windows

The `run` command will execute `run.bat`, which will build and run the project locally.

### Other

Make the run script executable: `chmod +x ./run.sh`. Use `./run.sh` to build and run the project locally.

## Stack

* Database: PostgreSQL
* Backend: TypeScript (4.0.3)
* Frontend: HTML/CSS/JS

### Frontend

We are not using any frameworks on the frontend, as we don't expect to need them. The only thing special on the frontend is our use of HTML rendering using the NPM package [express-handlebars](https://www.npmjs.com/package/express-handlebars).

### Backend

Our backend is divided into routes and services. The routes handle the routing and rendering. Routes will, if necessary, make use of the services. The services make database queries. We do this using the NPM package [pg](https://www.npmjs.com/package/pg).

## Deployment

The application is deployed to [Heroku](https://heroku.com/). It can be found at [luthernavigator.com](https://www.luthernavigator.com/).
