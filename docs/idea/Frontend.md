# Frontend Setup & Architecture

## Overview

The frontend is built with **Angular** and uses **AG Grid** for rendering and managing the clinic charges dataset. It implements server-side pagination, filtering, and inline editing capabilities.

---

## Technology Stack

- **Framework:** Angular 20 (Latest stable as of May 2026)
- **Grid Library:** AG Grid v35 (Community Edition) - Latest version
- **HTTP Client:** Angular HttpClient
- **Styling:** Tailwind CSS (see [[Frontend CSS.md]])
- **Build Tool:** Angular CLI
- **Package Manager:** npm
- **Node.js:** 24.x (Latest LTS, recommended for May 2026)

### Compatibility Notes
- Angular 20 supports Node.js ^20.19.0 || ^22.12.0 || ^24.0.0
- Node.js 24 is the latest recommended version with full Angular 20 support
- AG Grid v35 is fully compatible with Angular 20
- AG Grid v35 provides enhanced performance, accessibility features, and modern JavaScript support

---

## Project Structure

The project follows a modular architecture with clear separation of concerns:

- **Core Layer**: Services for API communication, business logic, and HTTP interceptors
- **Shared Layer**: Data models, interfaces, and shared UI components
- **Features Layer**: Feature-specific components organized by domain (clinic-charges)
  - Pages: Dashboard/main container components
  - Components: Reusable UI components (Grid, Filter)
- **Assets & Environment**: Configuration for different deployment environments (dev/prod)

---

## Installation & Setup

### Prerequisites
- Node.js 24.x (Latest LTS, compatible with Angular 20)
- npm 10.x+ (comes with Node.js)

### Steps
1. Create Angular project with routing support
2. Install Tailwind CSS and configure it for Angular (see [[Frontend CSS.md]] for details)
3. Install AG Grid community edition along with Angular adapter
4. Set up AG Grid theming (see [[Frontend CSS.md]] for configuration)

---

## Core Architecture

### Services Layer

**API Service**: Handles all HTTP communication with the backend
- Manages pagination parameters (startRow, endRow)
- Passes filter parameters (chargeType, medicalCentre)
- Implements CRUD operations for charges
- Returns paginated responses with row count

**Clinic Charge Service**: Business logic and state management
- Delegates API calls to ApiService
- Manages filter state
- Handles grid refresh logic

### Data Models

Define TypeScript interfaces for type safety:
- **ClinicCharge**: Represents a single charge record
- **GridRequest**: Encapsulates pagination and filter parameters
- **GridResponse**: Response structure from backend (data array + total row count)

---

## Component Architecture

### Grid Component
- Displays clinic charges in AG Grid with server-side pagination
- Configured with `serverSide` row model for backend-driven pagination
- Implements column definitions (id, medical_centre_name, patient_visit_type, charge_type, amount)
- Supports inline cell editing with real-time PATCH requests to backend
- Implements error handling with rollback on failed updates
- Handles grid refresh after data modifications

### Filter Component
- Provides UI for filtering by charge_type (dropdown) and medical_centre_name (text search)
- Emits filter events to parent dashboard
- Supports clearing filters to reset grid state

### Dashboard Page
- Container component that orchestrates grid and filter components
- Manages communication between filter and grid
- Implements "Add New Charge" button functionality
- Triggers grid refresh after successful data creation

---

## Key Concepts

### Server-Side Pagination
- AG Grid requests data chunks with `startRow` and `endRow` parameters
- Backend processes these parameters with SQL LIMIT/OFFSET
- Grid caches blocks of data to optimize performance (configurable cache block size)
- Debouncing prevents excessive requests during user interactions

### Inline Editing
- Grid cells are configured as editable for applicable columns (ID remains read-only)
- `cellValueChanged` event is triggered when user modifies a cell
- Frontend immediately sends PATCH request to update the specific field in backend
- On error, the cell value is reverted to previous state

### Filtering
- Filters are applied at the service level before grid request
- Backend receives filter parameters and applies WHERE clauses
- Filters reduce data transfer by filtering at the server
- Users can apply and clear filters dynamically

### Data Refresh
- After creating a new charge, grid cache is purged
- Grid reloads data from the first row, showing the new entry
- No complex WebSocket synchronization required

---

## Environment Configuration

Different environment files manage API endpoints:
- **Development**: Points to local backend (http://localhost:8000/api)
- **Production**: Uses relative API paths for Docker/deployment

---

## Docker Integration

- Multi-stage Dockerfile using Node.js 24.x as base image
- Build stage: Install dependencies and build production bundle
- Serve stage: Lightweight Node container serving static files
- Exposes port 3000 for the frontend service
- Integrates with docker-compose for full-stack deployment

---

## Running the Application

- **Development**: `ng serve` runs on localhost:4200 with hot reload
- **Production Build**: `ng build --configuration production` creates optimized bundle
- **Docker**: Docker image runs on port 3000, serves compiled Angular app

---

## Key Design Principles

1. **Server-Side Processing**: Pagination, filtering, and sorting handled by backend to optimize performance
2. **Type Safety**: TypeScript interfaces ensure consistency between frontend and API
3. **Modular Components**: Reusable, testable components with clear responsibilities
4. **Error Handling**: HTTP interceptors and error callbacks provide feedback on failed operations
5. **Performance**: AG Grid caching and debouncing minimize unnecessary requests
6. **Separation of Concerns**: Services handle data, components handle presentation
7. **MVC**: Component templates live in `.html` files
8. **DRY**: shared models, constants, and helpers avoid duplicating logic across features
