# `SettingsPage.tsx` Documentation

**File Path**: `/project/pwdm/frontend/src/pages/SettingsPage.tsx`

## Overview

`SettingsPage.tsx` serves as a central navigation hub for various application settings. It presents a list of setting categories, each linking to a dedicated page or section for managing that specific aspect of the application.

## Key Features and Components

### 1. UI and Styling

-   **Layout**: Uses an MUI `Container` with `maxWidth="md"` to structure the content. It includes responsive vertical padding (`py`) and a bottom margin (`mb: 8`) to prevent overlap with the bottom navigation bar.
-   **Title**: A `Typography` component with `variant="h4"` displays "Settings" as the main page title, centered on the page.
-   **Settings List**: An MUI `Paper` component (with `elevation={0}` and a thin border) encloses an MUI `List`.
    -   Each setting item is a `ListItem` containing a `ListItemButton`.
    -   `ListItemButton`s are configured to act as `RouterLink`s from `react-router-dom`, navigating to specific sub-routes.
    -   Each item includes a `ListItemIcon` (e.g., `FileDownloadIcon`, `FileUploadIcon`, `CategoryIcon`, `AccountCircleIcon`) and `ListItemText` for the setting's description.
    -   `Divider` components visually separate the list items.
-   **Font**: The `fontFamily` for the container and text elements is set to `'apple gothic'`.

### 2. Navigation Links

The page provides navigation to the following settings sections:

-   **"비밀번호 내보내기 (CSV/JSON)" (Export Passwords)**:
    -   Links to: `/settings/export`
    -   Icon: `FileDownloadIcon`
-   **"비밀번호 가져오기 (CSV)" (Import Passwords)**:
    -   Links to: `/settings/import`
    -   Icon: `FileUploadIcon`
-   **"카테고리 관리" (Category Management)**:
    -   Links to: `/settings/categories`
    -   Icon: `CategoryIcon`
    -   *Note: This route is not explicitly defined in the main `App.tsx` routing configuration as of the last review. It might be a planned feature or handled by nested routing not visible at the `App.tsx` level.*
-   **"프로필 설정" (Profile Settings)**:
    -   Links to: `/settings/profile`
    -   Icon: `AccountCircleIcon`
    -   *Note: Similar to Category Management, this route is not in `App.tsx`. Profile editing functionality is partially available via `EditProfileDialog` in `Dashboard.tsx`. This link might point to a more comprehensive profile management page or is a planned feature.*

### 3. Placeholder Comments

-   The code includes comments indicating that "Category Management Page" and "User Profile Management Page" are intended to be implemented, possibly as sub-routes or separate components.

## Dependencies

-   `react` (React.FC)
-   `@mui/material` (Container, Typography, Paper, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider)
-   `@mui/icons-material` (CategoryIcon, AccountCircleIcon, FileDownloadIcon, FileUploadIcon)
-   `react-router-dom` (Link as RouterLink)

## Future Development and Considerations

-   The settings items for "카테고리 관리" and "프로필 설정" link to routes (`/settings/categories`, `/settings/profile`) that need to be implemented and defined in the application's main router (`App.tsx`) or through a nested routing mechanism.
-   Additional setting items can be added to the list as new features are developed.
-   The page currently acts as a simple navigation menu. Individual settings pages will contain the actual logic and UI for managing each setting.
