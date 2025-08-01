# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bdash is an Electron-based SQL client for lightweight data analysis. It's a desktop application built with TypeScript, React, and Electron that supports multiple database types including MySQL, PostgreSQL, SQLite3, BigQuery, Treasure Data, and Amazon Athena.

## Key Architecture

### Structure
- **Main process**: `src/main/` - Electron main process handling window management, menus, updates
- **Renderer process**: `src/renderer/` - React-based UI with components and pages
- **Shared libraries**: `src/lib/` - Business logic including database clients and data models
- **Database layer**: `src/lib/Database/` - Data persistence using SQLite with models for DataSource, Query, Chart, Connection

### Key Components
- **DataSource system**: `src/lib/DataSourceDefinition/` - Pluggable database adapters for different database types
- **Flux architecture**: `src/renderer/flux/` - State management with Store/Action pattern
- **Page structure**: `src/renderer/pages/` - Main app sections (App, DataSource, Query, Setting) each with their own stores and actions

## Development Commands

### Basic Development
```bash
yarn install          # Install dependencies
yarn watch            # Build and watch for changes (webpack)
yarn start            # Start Electron app
```

### Testing
```bash
yarn test             # Run all tests (unit + integration)
yarn test:unit        # Run unit tests only
yarn test:unit:remote # Run remote-dependent unit tests
yarn test:integration # Run integration tests (builds app first)
```

### Linting and Code Quality
```bash
yarn lint             # Run all linting (ESLint + TypeScript + Prettier)
yarn lint:eslint      # ESLint only
yarn lint:tsc         # TypeScript type checking only
yarn lint:prettier    # Prettier formatting check only
yarn format           # Auto-format code with Prettier
yarn ci               # Run linting + unit tests (CI pipeline)
```

### Building and Release
```bash
yarn build            # Build for development
yarn release:prepare  # Build for production and package with electron-builder
```

## Database Models and Schema

The application uses SQLite for local data storage with these main models:
- **DataSource**: Database connection configurations
- **Query**: Saved SQL queries with metadata
- **Chart**: Visualization configurations for query results
- **Connection**: Runtime database connections

## Testing Structure

- **Unit tests**: `test/unit/` - Component and library tests using Mocha + TDD interface
- **Integration tests**: `test/integration/` - End-to-end tests using Spectron
- **Test fixtures**: `test/fixtures/` - Database setup for different database types
- **Test helpers**: `test/helpers/` - Shared testing utilities

## Build Configuration

- Uses Webpack with separate configs for main and renderer processes
- TypeScript compilation with strict settings enabled
- CSS extraction and asset handling for fonts/images
- Electron Builder for packaging with notarization support