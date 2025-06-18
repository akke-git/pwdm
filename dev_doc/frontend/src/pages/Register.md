# `Register.tsx` Documentation

**File Path**: `/project/pwdm/frontend/src/pages/Register.tsx`

## Overview

`Register.tsx` is a React functional component that provides the user interface and logic for new user registration. Users are required to provide an email, username, password (with confirmation), and a master password to create an account.

## Key Features and Components

### 1. UI and Styling

-   **Layout**: Utilizes MUI components such as `Container`, `Box`, and `Paper` to structure the registration form, which is centered on the page.
-   **Appearance**: The `Paper` component hosting the form has a `linear-gradient` background and a `backdropFilter: 'blur(10px)'` for a slightly translucent effect, contrasting with the `Login.tsx` page's solid dark theme.
-   **Form Elements**:
    -   `Avatar` with `LockOutlinedIcon`.
    -   `Typography` for the "회원가입" (Register) title and descriptive text.
    -   `TextField` components for Email, Username, Password, Confirm Password, and Master Password.
        -   Each `TextField` is adorned with relevant start icons (e.g., `EmailIcon`, `PersonIcon`, `VpnKeyIcon`).
        -   Password, Confirm Password, and Master Password fields feature `IconButton` toggles (`VisibilityIcon`/`VisibilityOffIcon`) for input visibility.
    -   `Button` for form submission, displaying `CircularProgress` and "가입 중..." (Registering...) text when `loading` is true.
-   **Navigation Link**: A `Link` component (MUI) allows users who already have an account to navigate to the Login page (`/login`).
-   **Error Display**: Validation errors and API response errors are shown directly below the form or via Snackbar notifications.
-   **Helper Text**: The Master Password field includes a `helperText` prop to emphasize its importance.

### 2. State Management (`useState`)

-   `email`, `username`, `password`, `confirmPassword`, `masterPassword`: Store values from the respective input fields.
-   `error`: String to hold and display error messages.
-   `loading`: Boolean to indicate if an API request is in progress, disabling inputs and showing a loader on the button.
-   `showPassword`, `showConfirmPassword`, `showMasterPassword`: Boolean states to toggle the visibility of sensitive password fields.

### 3. Input Validation (`validate` function)

-   Ensures all fields (email, username, password, confirm password, master password) are filled.
-   Validates the email format using a regular expression (`/^\S+@\S+\.\S+$/`).
-   Checks that password and master password meet a minimum length requirement (at least 4 characters).
-   Verifies that the `password` and `confirmPassword` fields match.
-   If any validation fails, the `error` state is updated, and `false` is returned.

### 4. Registration Logic (`handleSubmit` function)

-   Prevents default form submission and proceeds only if `validate()` returns `true`.
-   Sets `loading` to `true` and clears any previous `error` messages.
-   Makes an asynchronous POST request to the `/auth/register` API endpoint using the `api` (Axios instance) with `email`, `username`, `password`, `confirmPassword`, and `masterPassword`.
-   **On successful API response (`res.data.success === true`)**:
    -   Displays a success message (e.g., "회원가입 성공! 로그인 해주세요.") using `showMessage` from `SnackbarContext`.
    -   Navigates the user to the `/login` page using `useNavigate()`.
-   **On API error or `res.data.success === false`**:
    -   Sets the `error` state with the message from the API response or a generic server error message.
    -   Displays an error message using `showMessage`.
-   Finally, sets `loading` to `false`.

### 5. Navigation

-   `useNavigate` hook from `react-router-dom` is used for programmatic navigation.
    -   To `/login` on successful registration.
-   A `Link` component provides a manual navigation option to `/login` for users who might already have an account.

### 6. User Feedback

-   `useSnackbar` (custom context `../components/SnackbarContext`) provides `showMessage(message, severity)` for displaying transient notifications about registration status.
-   Direct error messages related to validation or API responses are displayed within the form using the `error` state and `Typography`.

## Dependencies

-   `react` (useState, React.FC)
-   `@mui/material` (various UI components)
-   `@mui/icons-material` (various icons)
-   `react-router-dom` (useNavigate, Link-like behavior via MUI Link's onClick)
-   `../api/axios` (Axios instance for API calls)
-   `../components/SnackbarContext` (useSnackbar for notifications)

This component is crucial for onboarding new users to the password management application, ensuring they provide all necessary credentials securely.
