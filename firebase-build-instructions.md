
# Prompts to Build "RAJ CARGO" with Firebase

Here is a script of prompts you can use with an AI assistant to build this courier management application using Next.js and Firebase.

### 1. Initial Project Setup

"Hello! Let's start building a courier management app called 'RAJ CARGO'. Please set up a Next.js project using TypeScript and Tailwind CSS. Also, add the Firebase SDK to the project. Create a Firebase configuration file (`src/lib/firebase.ts`) to initialize the Firebase app, but leave the config values as placeholders for now. Finally, create a basic home page that says 'Welcome to RAJ CARGO'."

### 2. Firebase Authentication

"Now, let's set up Firebase Authentication. Create a login page where a user can sign in with an email and password. Also, create a `useAuth` hook that manages the user's authentication state using `onAuthStateChanged`. Protect all routes except the login page, so that unauthenticated users are redirected to `/login`."

### 3. Firestore and Data Structure

"Let's define our database structure. We will use Firestore. Create a `waybills` collection and a `manifests` collection. A waybill should contain fields like `waybillNumber`, `senderInfo`, `receiverInfo`, `status`, `shippingDate`, etc. A manifest should contain a `date`, `vehicleNo`, `status`, and an array of waybill IDs (`waybillIds`)."

### 4. Booking System - Waybills

"Let's build the waybill booking system. Create a new page at `/booking/waybills/create` with a form to add a new document to the `waybills` collection in Firestore. Create another page at `/booking/waybills` that lists all waybills from the collection in a table. This table should have options to edit or delete a waybill. When editing, it should re-populate the form with the existing data."

### 5. Manifest System - Dispatching

"Now, build the manifest system. Create a page at `/booking/manifests` to list all manifests. Add a 'Create Manifest' button that takes the user to a page where they can create a new manifest document in Firestore. On this page, the user should be able to search for 'Pending' waybills from Firestore and add their document IDs to the manifest's `waybillIds` array. Finally, add a 'Dispatch' button that updates the manifest's status to 'Dispatched' and, using a batched write, updates the status of all associated waybills to 'In Transit'."

### 6. Hub Operations - Receiving

"Let's create the Hub Operations module at `/hub`. This page should list all manifests with the status 'Dispatched'. Add a 'Verify Shipment' button next to each one. This button should lead to a scanning page (`/hub/scan/[id]`) where staff can enter waybill numbers. The app should check if the entered number exists in the manifest's `waybillIds`. Once all waybills are verified, there should be a 'Confirm Arrival' button that changes the manifest's status in Firestore to 'Received'."

### 7. Delivery Operations

"Next, create the Delivery module at `/delivery`. This page should display all waybills from manifests that have been marked as 'Received' at the hub. It should function as a 'Delivery Sheet', allowing staff to update the status of each waybill to 'Out for Delivery' or 'Delivered'. These status changes should update the individual waybill documents in Firestore."

### 8. Admin & Role-Based Access

"Finally, let's add admin functionality. Use Firebase custom claims to create an 'admin' role. Modify the `useAuth` hook to check for this custom claim. Create an admin dashboard at `/admin` that is only accessible to users with the 'admin' role. On this dashboard, add a user management page that lists all Firebase Auth users and allows an admin to set or remove the 'admin' custom claim for any user."

### 9. Final Touches

"Please add a global search bar to the waybill list page that filters the Firestore query in real-time. Also, implement toast notifications for actions like creating, updating, or deleting data."
