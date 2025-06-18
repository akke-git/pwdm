# `PasswordExportPage.tsx` Documentation

**File Path**: `/project/pwdm/frontend/src/pages/PasswordExportPage.tsx`

## Overview

`PasswordExportPage.tsx` allows users to export their stored password data into either JSON or CSV file format. It provides options to choose the format and initiates a download of the generated file. The page emphasizes the sensitivity of the exported data as it contains decrypted passwords.

## Key Features and Components

### 1. UI and Styling (Material-UI)

-   **Layout**: A `Container` with `maxWidth="md"` structures the page, ensuring consistent padding and margins.
-   **Title**: "비밀번호 내보내기" (Export Passwords) is displayed as a `Typography` H4 heading.
-   **Information Section**:
    -   A `Paper` component contains all export-related options and information.
    -   It includes a warning that the exported file contains decrypted passwords and advises secure storage.
    -   Lists the data fields included in the export: site name, URL, ID, password, and notes.
-   **File Format Selection**:
    -   A `RadioGroup` allows users to select the export format:
        -   **JSON**: Described as including "모든 정보 포함" (all information included).
        -   **CSV**: Described as "Excel, 스프레드시트 호환" (compatible with Excel, spreadsheets).
-   **Error Display**: An `Alert` component (severity `error`) displays any errors encountered during the export process.
-   **Action Buttons**:
    -   **"Back" Button**: Navigates the user back to the main settings page (`/settings`).
    -   **"Export" Button**: Triggers the password export process. It displays a `FileDownloadIcon` or a `CircularProgress` indicator when loading.
-   **Font**: `fontFamily` is set to `'apple gothic'` for consistent typography.

### 2. State Management (`useState`)

-   `format` (string): Stores the selected export file format (either `'json'` or `'csv'`). Defaults to `'json'`.
-   `loading` (boolean): Indicates if the export process is currently in progress. Used to disable buttons and show a loading spinner.
-   `error` (string | null): Stores any error message that occurs during the export.

### 3. Core Functionality (`handleExport`)

1.  **Initiate Export**: Sets `loading` to `true` and clears any previous `error`.
2.  **API Request**:
    -   Makes a POST request to the `/passwords/export?format=<selected_format>` endpoint using the `api` (Axios instance).
    -   `responseType: 'blob'` is crucial as the server sends back file data.
3.  **File Download Handling**:
    -   If the API call is successful, a `Blob` is created from `response.data`.
    -   `window.URL.createObjectURL()` generates a temporary URL for this blob.
    -   A new `<a>` element is dynamically created.
    -   **Filename Determination**: The filename is extracted from the `Content-Disposition` header of the API response. If not available, a default filename (`password-export`) is used. The appropriate extension (`.json` or `.csv`) is appended based on the selected format.
    -   The `href` of the `<a>` element is set to the blob URL, and the `download` attribute is set to the determined filename.
    -   `link.click()` programmatically triggers the file download.
    -   Temporary resources (blob URL and `<a>` element) are cleaned up using `window.URL.revokeObjectURL()` and `document.body.removeChild()`.
4.  **User Feedback**: Uses `showMessage` (from `SnackbarContext`) to notify the user of success or failure.
5.  **Error Handling**: If any error occurs (e.g., API request fails), it's caught, logged, and an error message is set in the `error` state and shown via Snackbar.
6.  **Finalization**: `loading` is set back to `false` in a `finally` block.

### 4. Navigation and Context

-   `useNavigate` (from `react-router-dom`): Used for programmatic navigation (e.g., the "Back" button).
-   `useSnackbar` (from `../components/SnackbarContext`): Provides access to the `showMessage` function for displaying brief notifications to the user.
-   `api` (from `../api/axios`): Pre-configured Axios instance for making backend API calls.

## Dependencies

-   `react` (useState, React.FC)
-   `@mui/material` (Container, Typography, Paper, Box, Button, FormControl, FormControlLabel, RadioGroup, Radio, CircularProgress, Alert, Divider)
-   `@mui/icons-material` (FileDownloadIcon)
-   `react-router-dom` (useNavigate)
-   `../api/axios`
-   `../components/SnackbarContext`

## Security Note

The page correctly warns users about the sensitivity of the exported data. Since the file contains decrypted passwords, users must handle it with extreme care.
