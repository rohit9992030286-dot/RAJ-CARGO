# Prompts to Build "YU-WON LOGISTICS"

Here is a script of prompts you can use with an AI assistant to build this courier management application using Next.js. This guide focuses on a local-first approach using local storage for data management.

### 1. Initial Project Setup & Core UI

"Hello! Let's start building a courier management app called 'YU-WON LOGISTICS'.

1.  **Tech Stack**: Set up a Next.js project using TypeScript and Tailwind CSS.
2.  **UI Components**: Integrate ShadCN UI by creating `components.json` and adding the default `globals.css` theme. Install all necessary radix-ui dependencies, `lucide-react`, `class-variance-authority`, `clsx`, and `tailwind-merge`.
3.  **Basic Layout**: Create a root `layout.tsx` that includes a `Toaster` component for notifications. Create a simple loading component (`loading.tsx`).
4.  **Theme Toggle**: Add a settings page at `/booking/settings` that allows users to switch between light, dark, and system themes. This setting should be saved to local storage."

### 2. Core Data Structure & Hooks

"Now, let's set up the data foundation using local storage.

1.  **Define Types**: Create TypeScript files under a `src/types` directory for `waybill.ts`, `manifest.ts`, `inventory.ts`, `company.ts`, and `vehicle.ts`. Use Zod to define the schemas for each of these data structures.
2.  **Create DataContext**: Build a `DataContext.tsx` component. This provider will be responsible for loading all data from local storage into state on startup and saving it back whenever it changes. It should expose functions to add, update, and delete all data types (waybills, manifests, etc.).
3.  **Create Data Hooks**: Create custom hooks for each data type (e.g., `useWaybills`, `useManifests`, `useCompanies`, `useVehicles`, `useWaybillInventory`). These hooks should consume the `DataContext` to provide filtered data and action functions to the rest of the app."

### 3. Authentication & User Management

"Set up a complete authentication system.

1.  **`useAuth` Hook**: Create an `AuthContext` and a `useAuth` hook. This hook will manage a list of users and the current authenticated user, storing both in local storage. It should handle login, logout, and role-based access checks.
2.  **Default Admin**: The `useAuth` hook should create a default 'admin' user with a password if no users exist in local storage.
3.  **Login Page**: Design a professional login page at `/login`. Unauthenticated users should be redirected here.
4.  **Admin PIN Verification**: Create a page at `/admin/verify` that requires the admin to enter a secret PIN after logging in to access the admin panel. This verification status should be stored in session storage.
5.  **User Management UI**: On an admin-only page at `/admin/users`, build a UI to create new users, assign them roles (booking, hub, delivery, account), a partner code, and associate them with a company if they have the 'booking' role."

### 4. Admin Panel - Foundational Modules

"Build the core configuration modules that the rest of the application will depend on.

1.  **Company Management**: Create a page at `/admin/companies` to add, edit, and delete company profiles. Each company should have a unique code and default sender information.
2.  **Waybill Inventory**: Build a page at `/admin/inventory` to assign waybill number ranges to specific booking partners and/or companies.
3.  **Partner Associations (Routing)**: At `/admin/partner-associations`, create a UI to define the logistics network. Allow the admin to map booking partners to hubs, hubs to other hubs, and hubs to final delivery partners.
4.  **Rate Management**: At `/admin/rates`, create a system to manage state-to-state shipping rates, including docket charges, fuel surcharges, and expected delivery days. Include Excel import/export functionality."

### 5. Booking Module

"Create the interface for booking partners.

1.  **Waybill Creation**: Build a form at `/booking/waybills/create` for creating a new waybill. The 'Waybill Number' field must be a dropdown populated from the user's assigned, unused inventory. Sender details should auto-fill if a company is selected.
2.  **Waybill Book**: At `/booking/waybills`, display a paginated list of all waybills created by the logged-in partner. Include search, filtering by date, and options to edit/delete/print waybills and stickers.
3.  **Bulk Operations**: Add an accordion to the Waybill Book page for 'Bulk Operations', including Excel uploads for both waybill data and package dimensions, with strict validation.
4.  **Manifests**: On the `/booking/manifest` page, allow users to create a manifest, add pending waybills to it, and dispatch it. Dispatching should update all included waybills' statuses to 'In Transit'."

### 6. Hub Module

"Develop the tools for hub staff.

1.  **Incoming Manifests**: On the main `/hub` page, show a list of all manifests dispatched to the current user's hub.
2.  **Verification & Scanning**: Create a page at `/hub/scan/[id]` for verifying incoming manifests. Staff should be able to scan box barcodes using their device camera or enter them manually. The system should assign pallet numbers for each destination city and highlight any shortages.
3.  **Shortage Report**: At `/hub/shortages`, display a list of all manifests that were received with missing items.
4.  **Outbound Dispatch**: Create a page at `/hub/dispatch` where staff can scan verified boxes to create new outbound manifests, either for another hub or for a final delivery partner."

### 7. Delivery & Accounts Modules

"Build the final operational modules.

1.  **Delivery Sheet**: At `/delivery`, display a list of all waybills 'Out for Delivery' assigned to the current user. Allow them to update the status to 'Delivered' or 'Returned' and upload a Proof of Delivery (POD) image for delivered items.
2.  **Accounts Dashboard**: Create an `/account` module with pages for employee salary management (`/account/employees`), calculating partner commission payments (`/account/partners`), and viewing detailed sales reports for corporate clients (`/account/company-sales`)."

### 8. Public Pages & Printing

"Finalize the application with public-facing features and printing capabilities.

1.  **Public Homepage**: Create a homepage (`/`) with a prominent tracking feature that allows customers to search for a waybill by number and see its current status.
2.  **Printing**: Implement robust printing functionality for:
    *   **Waybills**: A4 format with Receiver and POD copies.
    *   **Stickers**: 75mm x 75mm format for individual boxes.
    *   **Manifests & Trip Sheets**: Paginated to fit many waybills per page.
    *   **Employee ID Cards**.
3.  **Static Pages**: Add 'About Us', 'Features', and 'Terms & Conditions' pages."
