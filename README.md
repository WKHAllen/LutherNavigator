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

The `run` command will execute `run.bat`, which will build and run the project locally. Or, on a different operating system, make the run script executable: `chmod +x ./run.sh`, and use `./run.sh` to run the project locally.

## Testing the Project

We're using [jest](https://www.npmjs.com/package/jest) to test the application. To test it locally, use `script test` on Windows, or `./script.sh test` on other operating systems.

## Database

MySQL database can be interfaced with by running `./script.sh db` (`chmod +x ./script.sh` to make it executable).

## Stack

- Database: MySQL
- Backend: TypeScript (4.0.3)
- Frontend: HTML 5, CSS 3 (+ [Bootstrap](https://getbootstrap.com/)), JS (ES6)

### Frontend

We are not using any frameworks on the frontend, as we don't expect to need them. The only thing special on the frontend is our use of HTML rendering using the NPM package [express-handlebars](https://www.npmjs.com/package/express-handlebars).

### Backend

Our backend is divided into routes and services. The routes handle the routing and rendering. Routes will, if necessary, make use of the services. The services make database queries. We do this using the NPM package [mysql](https://www.npmjs.com/package/mysql).

## Deployment

The application is deployed to [Heroku](https://heroku.com/). It can be found at [luthernavigator.com](https://www.luthernavigator.com/).

## Style Guide

The codebase is developed in a style-consistent manner. Black and Prettier are used for formatting Python and CSS/HTML/TypeScript code respectively.

Commands:

- CSS/HTML/TypeScript: `prettier --write --print-width 79`
- Python: `black --line-length 79`

Variable and Function naming conventions:

- Python: `snake_case`
- TypeScript: `camelCase`

Import Statements

- Direct `import` statements first, followed by `from` imports
- Order: Standard Library, Related Third Party, Local (same order for `from` imports)
- At each level, separate imports with a newline and sort them alphabetically
