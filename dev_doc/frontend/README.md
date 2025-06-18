# Frontend Documentation

This directory contains documentation for the frontend of the PwdM application.

## Overview

The frontend of the PwdM application is a **React** application built using **Vite** and **TypeScript**.

**Key Technologies Used:**

-   **UI Framework**: React (`react`, `react-dom`)
-   **UI Component Library**: Material-UI (MUI) (`@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`)
-   **State Management**: Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
-   **Routing**: React Router (`react-router-dom`)
-   **HTTP Client**: Axios (`axios`) for backend API communication.
-   **Authentication**: Handles JWT (`jwt-decode`) and Google OAuth (`@react-oauth/google`).
-   **Build Tool**: Vite (`vite`, `@vitejs/plugin-react`)
-   **Language**: TypeScript (`typescript`)
-   **Linting**: ESLint (`eslint`)

Key features include user authentication (standard and Google OAuth), password item management, category and tag organization, 2FA setup and verification, and user profile management, all interacting with the backend API.

## Main Project Files and Directories

-   **`/project/pwdm/frontend/`**: The root directory for the frontend project.
    -   **`src/`**: Contains all the source code for the application (components, pages, services, store, assets, etc.). This will be the primary focus of documentation.
    -   **`public/`**: Static assets that are served directly (e.g., `favicon.ico`, images).
    -   **`index.html`**: The main HTML entry point for the application, where the JavaScript bundle is loaded.
    -   **`package.json`**: Defines project metadata, dependencies (frameworks, libraries), and scripts (build, dev, lint).
    -   **`vite.config.ts`**: Configuration file for the Vite build tool.
    -   **`tsconfig.json` (and variants)**: TypeScript compiler options.
    -   **`eslint.config.js`**: ESLint configuration for code linting.
    -   **`.env` / `.env.example`**: Environment variable files.

## Expected `src` Directory Structure (Typical for React + Vite + TS projects)

Based on the identified technologies, the `src/` directory is likely organized as follows. This structure will be confirmed by inspecting the `src/` directory itself.

-   **`main.tsx`**: The application's entry point, responsible for rendering the root `App` component and setting up providers (Redux store, Router, MUI Theme).
-   **`App.tsx`**: The root component, typically defining the main layout and routing structure.
-   **`components/`**: Shared, reusable UI components built with React and MUI (e.g., `Button`, `TextField`, `Modal`, `Layout` components).
-   **`pages/`** (or `views/`): Feature-specific or page-level components that correspond to application routes (e.g., `LoginPage`, `DashboardPage`, `SettingsPage`).
-   **`services/`** (or `api/`): Modules for API communication using Axios. This might include instances of Axios with pre-configured base URLs and interceptors for handling authentication tokens and errors.
-   **`store/`** (or `app/store.ts`, `features/`): Redux Toolkit setup, including the main store configuration, slices (reducers and actions) for different parts of the application state (e.g., `authSlice`, `passwordSlice`, `uiSlice`).
-   **`hooks/`**: Custom React hooks to encapsulate reusable logic (e.g., `useAuth`, `useForm`).
-   **`utils/`**: General utility functions (e.g., date formatting, validation helpers).
-   **`assets/`**: Static assets like images, fonts, or SVGs that are imported directly into components.
-   **`styles/`**: Global styles, MUI theme customizations (`theme.ts`), and potentially CSS modules or styled-components if not solely relying on MUI's styling.
-   **`router/`** (or `routes.tsx`): Configuration for React Router, defining application paths and the components they render. May include protected routes that require authentication.
-   **`types/`** (or `interfaces/`): TypeScript type definitions and interfaces shared across the application.

## Key Areas for Documentation

Based on the identified stack, the documentation will focus on:

1.  **Overall Architecture (`src/README.md`)**: A high-level overview of the `src` directory, how different parts (components, store, services, pages) interact.
2.  **Core Setup (`main.tsx`, `App.tsx`)**: Application entry point, root component, global providers (Redux, Router, MUI Theme).
3.  **Routing (`router/` or `routes.tsx`)**: Route definitions, protected routes, lazy loading.
4.  **State Management (`store/`)**: Redux Toolkit store setup, individual slices (purpose, state structure, actions, thunks, selectors).
5.  **API Services (`services/`)**: Axios instance configuration, API request functions for each backend resource, error handling, and request/response types.
6.  **Authentication (`auth/` or relevant components/services/store slices)**: Login, registration, Google OAuth, token handling (storage, refresh, decode), and integration with routing and API calls.
7.  **Reusable Components (`components/`)**: Documentation for each significant shared UI component, detailing its props, state, event handling, and usage examples. This will be an ongoing effort.
8.  **Pages/Views (`pages/`)**: For each major page/view, document its purpose, main components used, state dependencies, and user interactions.
9.  **Custom Hooks (`hooks/`)**: Purpose and usage of custom React hooks.
10. **Styling and Theming (`styles/`, MUI theme)**: Global styles, MUI theme overrides and customisations.
11. **Utilities (`utils/`)**: Documentation for common utility functions.
12. **Environment Variables (`.env`)**: Explanation of required environment variables for the frontend.
13. **Forms and Validation**: How forms are typically built (e.g., using a library like Formik/React Hook Form, or custom logic) and validated.

## Getting Started with Documentation

To start documenting a specific part of the frontend, create a new markdown file in the appropriate subdirectory (e.g., `dev_doc/frontend/components/Button.md`).
