# `Dashboard.tsx` Documentation

**File Path**: `/project/pwdm/frontend/src/pages/Dashboard.tsx`

## Overview

`Dashboard.tsx` is the main page displayed to users after successful login. It serves as the central hub for viewing and managing stored passwords. The page features a user information banner, a table listing passwords, and options for profile editing and logout.

## Key Features and Components

### 1. UI and Styling

-   **Overall Layout**: A full-height, dark-themed page divided into a top banner section and a main content area housing the password table.
-   **Theme**: Consistent with the application's dark theme, using black and dark gray backgrounds with white text. `fontFamily` is set to `apple gothic, sans-serif`.
-   **Banner Section**:
    -   Displays a background image (`/images/pass.png`).
    -   **Logout Button**: An `IconButton` with `LogoutIcon` (and `Tooltip`) is positioned at the top-left for user logout.
    -   **User Information**: Positioned at the bottom-right, showing the user's name/username (from `localUsername` or JWT) and email. An `Avatar` displays the first letter of the username.
    -   Styles are responsive, adjusting size and padding for different screen sizes.
-   **Main Content Section**:
    -   Features a slightly lighter dark background (`#0a0a0a`) than the banner.
    -   Contains the `PasswordTable` component, which is wrapped in a `Box` with an even darker background (`#1e1e1e`) to visually distinguish it.
    -   The layout is responsive, with `maxWidth` adjustments for the content area on larger screens.

### 2. State Management (`useState`)

-   `refreshKey`: An integer used as a key prop for `PasswordTable`. Incrementing this key forces the `PasswordTable` to re-render and potentially re-fetch data.
-   `editProfileOpen`: Boolean state to control the visibility of the `EditProfileDialog`.
-   `localUsername`: Stores the username of the logged-in user. Initialized from the JWT token and updated if the user edits their profile. This allows immediate UI reflection of username changes.

### 3. User Authentication and Information

-   **Token Parsing**: On component mount, it retrieves the JWT from `localStorage`.
-   `parseJwt` (utility from `../jwt`): This function is used to decode the JWT and extract user information (e.g., `username`, `preferred_username`, `name`, `email`).
-   The parsed `userInfo` is used to populate the banner and provide initial values.

### 4. Core Functionalities

-   **Displaying Passwords**: The `PasswordTable` component is responsible for fetching and displaying the list of stored passwords.
-   **Logout (`handleLogout`)**:
    -   Removes the `token` from `localStorage`.
    -   Redirects the user to the `/login` page using `useNavigate()`.
-   **Profile Editing**:
    -   An `EditProfileDialog` component (likely allows changing the username) is displayed when `editProfileOpen` is true.
    -   `handleProfileUpdated(newUsername)`: A callback function passed to `EditProfileDialog`. When the profile is updated, this function updates the `localUsername` state and the `userInfo.username` property.
-   **Password Table Refresh**: The `PasswordTable` component has an `onRefreshProp` callback that updates the `refreshKey` state, triggering a re-render of the table.

### 5. Child Components

-   **`PasswordTable`** (from `../components/PasswordTable`): The primary component for displaying password entries. It receives `refreshKey` and `onRefreshProp` for refresh control.
-   **`EditProfileDialog`** (from `../components/EditProfileDialog`): A dialog for users to edit their profile information (e.g., username).
-   **`parseJwt`** (from `../jwt`): A utility function to decode JWTs.

### 6. Removed Features (Noted from comments)

-   The code contains commented-out lines related to 2-Factor Authentication (2FA) state and toggle functions, suggesting that 2FA functionality was previously present but has been removed or disabled.

## Dependencies

-   `react` (useState, React.FC)
-   `@mui/material` (Box, Typography, IconButton, Avatar, Tooltip, etc.)
-   `@mui/icons-material` (LogoutIcon)
-   `react-router-dom` (useNavigate)
-   `../components/PasswordTable`
-   `../components/EditProfileDialog`
-   `../jwt` (for `parseJwt` utility)

## Design Considerations

-   The dashboard provides a clear overview of essential user information and password data.
-   The use of `refreshKey` is a common pattern in React to imperatively trigger updates in child components.
-   User-specific data is derived from a JWT stored in `localStorage`, which is a standard but requires careful security considerations (e.g., XSS).
-   The UI is designed with responsiveness in mind, adapting to various screen sizes.
