# `PasswordImportPage.tsx` Documentation

**File Path**: `/project/pwdm/frontend/src/pages/PasswordImportPage.tsx`

## Overview

`PasswordImportPage.tsx` enables users to import password data from a CSV file. It provides a user-friendly interface for file selection (via drag-and-drop or click-to-upload), validates the file type, uploads it to the server for processing, and displays the results of the import operation (total entries, successfully imported entries, and errors).

## Key Features and Components

### 1. UI and Styling (Material-UI)

-   **Layout**: A `Container` with `maxWidth="md"` organizes the page content.
-   **Navigation**: A "뒤로" (Back) button with an `ArrowBackIcon` navigates users to the `/settings` page.
-   **Title**: "비밀번호 가져오기" (Import Passwords) is displayed as a `Typography` H4 heading.
-   **CSV Format Instructions**:
    -   A `Paper` component details the required CSV file structure. It lists the expected column headers: `name` (required), `site url`, `id`, `password`, `category`, and `memo`.
    -   It also notes that if a site name already exists, it will be automatically suffixed with a number (e.g., "사이트명 2").
-   **Feedback Alerts**:
    -   `Alert` components are used to display:
        -   Errors (e.g., non-CSV file selected, upload failure).
        -   Success messages, including a summary of the import (total, imported, errors).
-   **File Upload Area (`UploadBox`)**:
    -   A custom-styled `Paper` component (`styled(Paper)`) serves as the drag-and-drop zone.
    -   It features a dashed border that changes color on hover.
    -   Displays a `CloudUploadIcon` and instructive text ("CSV 파일을 드래그하거나 클릭하여 업로드").
    -   When a file is selected, its name is shown alongside a `CheckCircleIcon`.
    -   Clicking this area triggers a hidden file input element.
-   **Hidden File Input (`HiddenInput`)**:
    -   A `styled('input')` of `type="file"` with `display: 'none'`, accepting only `.csv` files.
-   **"Import" Button**:
    -   Initiates the file upload and import process.
    -   Disabled if no file is selected or if loading.
    -   Shows a `CircularProgress` spinner and "업로드 중..." text during processing.
-   **Font**: `fontFamily` is set to `'Apple Gothic, sans-serif'` for relevant text elements.

### 2. State Management (`useState`)

-   `file` (File | null): Stores the CSV file selected by the user for upload.
-   `loading` (boolean): Tracks the loading state during file upload and server processing.
-   `error` (string | null): Holds error messages related to file validation or the import process.
-   `success` (object | null): Stores the results of a successful import, containing `total` entries, `imported` entries, and `errors` count.

### 3. Core Functionality

-   **File Selection (`handleFileChange`)**:
    -   Triggered when a file is selected via the hidden file input.
    -   Validates if the selected file is a CSV file (by checking the `.csv` extension). Sets an error if not.
    -   Updates the `file` state and clears any previous `error`.
-   **Drag and Drop (`handleDrop`, `handleDragOver`)**:
    -   `handleDragOver`: Prevents default browser behavior to allow dropping.
    -   `handleDrop`: Handles files dropped onto the `UploadBox`.
        -   Validates if the dropped file is a CSV. Sets an error if not.
        -   Updates the `file` state and clears `error`.
-   **File Upload and Import (`handleUpload`)**:
    -   Checks if a file is selected; if not, sets an error.
    -   Sets `loading` to true, clears `error` and `success` states.
    -   Creates a `FormData` object and appends the selected `file`.
    -   Sends a POST request to `/passwords/import` with the `formData`. The `Content-Type` header is set to `multipart/form-data`.
    -   **On Success**: Parses the response (expected to contain `results: { total, imported, errors }`) and updates the `success` state. Resets the `file` state and the file input field's value.
    -   **On Failure**: Catches errors, logs them, and sets an appropriate error message in the `error` state (either from the server response or a generic message).
    -   Sets `loading` to false in a `finally` block.

### 4. Navigation and API

-   `useNavigate` (from `react-router-dom`): Used for the "Back" button functionality.
-   `api` (from `../api/axios`): The pre-configured Axios instance for backend communication.

## Dependencies

-   `react` (useState, React.FC, React.ChangeEvent, React.DragEvent)
-   `@mui/material` (Box, Typography, Button, Paper, Container, Alert, CircularProgress, List, ListItem, ListItemText, styled)
-   `@mui/icons-material` (CloudUploadIcon, CheckCircleIcon, ArrowBackIcon)
-   `react-router-dom` (useNavigate)
-   `../api/axios`

## CSV File Format Requirements

The page clearly outlines the expected CSV structure:
-   `name` (Site Name - Required)
-   `site url` (Site URL)
-   `id` (User ID)
-   `password` (Password)
-   `category` (Category)
-   `memo` (Memo)
