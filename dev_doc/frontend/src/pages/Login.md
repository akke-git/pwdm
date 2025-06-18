# `Login.tsx` Documentation

**File Path**: `/project/pwdm/frontend/src/pages/Login.tsx`

## Overview

`Login.tsx` is a React functional component that provides the user interface and logic for user authentication. It supports two primary login methods: standard email/password login (which also requires a master password) and Google OAuth 2.0 login (followed by master password entry for account decryption key access).

## Key Features and Components

### 1. UI and Styling

-   **Layout**: Uses MUI components like `Container`, `Box`, and `Paper` to structure the login form, centered on the page.
-   **Theme**: Adheres to the dark theme defined in `App.tsx`. The page background is explicitly set to black (`#000`) with white text, and form elements are styled accordingly.
-   **Dynamic Body Style**: An `useEffect` hook manipulates `document.body.style` on component mount to enforce a full-screen black background with no margins or borders. The original body style is restored on unmount.
-   **Form Elements**:
    -   `Avatar` with `LockOutlinedIcon` for visual branding.
    -   `Typography` for titles like "Log-In" and subtitles.
    -   `TextField` components for Email, Password, and Master Password inputs.
        -   Each `TextField` includes `InputAdornment` with relevant icons (e.g., `EmailIcon`, `VpnKeyIcon`).
        -   Password and Master Password fields have `IconButton` toggles (`VisibilityIcon`/`VisibilityOffIcon`) to show/hide input.
    -   `Button` for form submission, showing `CircularProgress` when `loading` is true.
-   **Google Login Button**: Uses the `<GoogleLogin />` component from `@react-oauth/google`.
-   **Navigation Link**: A `Link` component (from MUI, likely wrapping `react-router-dom`'s Link) directs users to the registration page (`/register`).
-   **Error Display**: Validation and API errors are displayed directly below the form inputs or via Snackbar.

### 2. State Management (`useState`)

-   `email`, `password`, `masterPassword`: Store the values from respective input fields.
-   `showPassword`, `showMasterPassword`: Boolean states to toggle visibility of password fields.
-   `error`: String to hold error messages for display.
-   `loading`: Boolean to indicate if an API request is in progress.
-   `googleLoginStep`: Boolean, `true` if Google login was successful and the app is awaiting master password input.
-   `googleUserInfo`: Stores decoded user information from Google (type `GoogleUserInfo`).
-   `googleCredential`: Stores the original JWT credential string received from Google.

### 3. Input Validation (`validate` function)

-   **Standard Login**: Checks if email, password, and master password are provided. Validates email format and minimum length (4 chars) for password and master password.
-   **Google Login (Master Password Step)**: Checks if master password is provided and meets minimum length.
-   Sets the `error` state if validation fails.

### 4. Login Logic

#### a. Standard Email/Password/Master Password Login

-   Triggered by form submission when `googleLoginStep` is `false`.
-   The `handleSubmit` function calls `api.post('/auth/login', { email, password, masterPassword })`.

#### b. Google OAuth Login

-   **Initiation**: User clicks the `GoogleLogin` button.
-   **`handleGoogleLoginSuccess(credentialResponse)`**:
    -   Called on successful Google authentication.
    -   Decodes the `credentialResponse.credential` (JWT) using `jwtDecode` to get user info (email, name, etc.).
    -   Stores the original token in `googleCredential` and decoded info in `googleUserInfo`.
    -   Sets `googleLoginStep` to `true` to switch UI to master password input mode.
    -   Displays a success message via Snackbar.
-   **`handleGoogleLoginError()`**: Called on Google login failure/cancellation, shows an error Snackbar.
-   **Master Password Submission (after Google Login)**:
    -   Triggered by form submission when `googleLoginStep` is `true`.
    -   The `handleSubmit` function calls `api.post('/auth/google-login', { googleToken: googleCredential, email: googleUserInfo.email, name: googleUserInfo.name, masterPassword })`.

### 5. API Integration (`handleSubmit` & Axios)

-   Uses a pre-configured Axios instance (`api` from `../api/axios.ts`).
-   **On successful API response (`res.data.success === true`)**:
    -   Stores the received JWT in `localStorage.setItem('token', res.data.data.token)`.
    -   Shows a success Snackbar.
    -   Navigates to `/dashboard` using `useNavigate()`.
-   **On API error or `res.data.success === false`**:
    -   Sets the `error` state with the message from the API response or a generic error.
    -   Shows an error Snackbar.
-   `loading` state is managed throughout the API call lifecycle.

### 6. Navigation

-   `useNavigate` hook from `react-router-dom` is used for programmatic navigation.
    -   To `/dashboard` on successful login.
-   A `Link` component allows navigation to `/register`.

### 7. User Feedback

-   `useSnackbar` (custom context `../components/SnackbarContext`) provides `showMessage(message, severity)` for displaying transient notifications (success, error, info).
-   Direct error messages are displayed below input fields via the `error` state.

## Dependencies

-   `react` (useState, useEffect, React.FC)
-   `@mui/material` (various UI components)
-   `@mui/icons-material` (various icons)
-   `react-router-dom` (useNavigate, Link)
-   `../api/axios` (Axios instance for API calls)
-   `../components/SnackbarContext` (useSnackbar for notifications)
-   `@react-oauth/google` (GoogleLogin component)
-   `jwt-decode` (for decoding Google's JWT)

## Interfaces

-   **`GoogleUserInfo`**: Custom interface to type the decoded Google JWT payload, including fields like `email`, `name`, `sub`, `jti`, and `originalToken` (custom addition).

## Design Notes

-   The component directly manipulates `document.body.style`. While effective for a full-page component like Login, this is generally a side effect that should be used cautiously in React.
-   JWT token is stored in `localStorage`, which is a common practice but has security considerations (vulnerable to XSS). HttpOnly cookies are often preferred for storing tokens when possible.
-   The login flow clearly distinguishes between standard and Google-initiated sessions, ensuring the correct backend endpoint is called.
