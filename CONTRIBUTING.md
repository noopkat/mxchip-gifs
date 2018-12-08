# Contributing Guide

Hey - thanks for your interest in contributing to this repo! 

The following below details how to run the developing environment locally in order to make changes. There are two processes you'll need to run - the server for backend changes and a webpack watch process for frontend changes.

## How to build/run the server (native)

In your terminal, run:

```bash
npm install
npm run start
```

## Alternatively, how to build/run the server (Docker)

In your terminal, run:

```bash
docker-compose up
```

## How to build the frontend

In a separate terminal session, run:

```bash
webpack --watch
```

Whenever you save changes to any frontend JavaScript files (edit those in the `src` directory), webpack will rebundle the assets into the `dist` directory.

## Git / Github flow

Please follow the following process to contribute to this repository:

1. Fork and clone this repository to your hard drive
2. Run the development environment if making non documentation changes (see above sections)
3. Check out a new branch to work on your changes in
4. Commit your changes, push to your fork
5. Open a pull request outlining your proposed changes

