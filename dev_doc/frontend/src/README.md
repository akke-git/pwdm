# Frontend `src` Directory Overview

This directory contains the core source code for the PwdM frontend application, built with React, Vite, TypeScript, MUI, Redux Toolkit, and React Router.

## Key Files and Directories

-   **`main.tsx`**: The main entry point of the application. It initializes the React application, sets up the Redux store, configures the Router, and applies the MUI theme provider.
-   **`App.tsx`**: The root React component. It typically defines the global layout, integrates the router for page navigation, and may include global context providers or initial data fetching logic.
-   **`App.css` & `index.css`**: Global CSS files. `index.css` might contain base styles or resets, while `App.css` could hold styles specific to the `App.tsx` component or general application-wide styles.
-   **`jwt.ts`**: Utility functions related to JWT (JSON Web Token) handling, such as decoding tokens or managing token storage (though actual storage might be in Redux or localStorage via this utility).
-   **`vite-env.d.ts`**: TypeScript declaration file for Vite-specific environment variables.

-   **`api/`**: Contains modules responsible for making HTTP requests to the backend API, likely using Axios. This directory might include:
    -   An Axios instance configuration (e.g., `axiosInstance.ts`).
    -   Service files for different backend resources (e.g., `authService.ts`, `passwordService.ts`).
-   **`assets/`**: Stores static assets like images, fonts, or SVGs that are imported and used within React components.
-   **`components/`**: Houses reusable UI components shared across different parts of the application. These are typically presentational components or more complex UI elements built from MUI components or custom HTML/CSS.
-   **`pages/`**: Contains top-level components that represent different pages or views of the application, mapped to specific routes by React Router.
-   **`store/`** (Expected, but not directly visible at `src` root - may be within `api/` or structured differently, e.g., feature folders): This is where Redux Toolkit state management logic (store configuration, slices, reducers, actions, thunks) would reside. Its exact location and structure will be determined by examining `main.tsx` or `App.tsx`.
-   **`types/`**: Holds shared TypeScript type definitions, interfaces, and enums used throughout the project to ensure type safety.
-   **`utils/`**: Contains general-purpose utility functions that don't fit into other specific categories (e.g., data formatting, validation helpers, constants).

## Documentation Approach

Each key file and subdirectory will be documented in more detail within its own `README.md` file or directly if it's a single file's documentation (e.g., `main.md` for `main.tsx`). The documentation will cover:

-   **Purpose**: What the file/directory is responsible for.
-   **Key Logic/Components**: Important functions, classes, components, or state managed.
-   **Interactions**: How it interacts with other parts of the application (e.g., other services, store, components).
-   **Configuration**: Any specific setup or configuration involved.

We will start by documenting `main.tsx` and `App.tsx` to understand the application's core setup and flow.
