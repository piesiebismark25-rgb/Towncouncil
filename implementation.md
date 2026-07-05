# Implementation Plan: Town Council Portal MVP Upgrades

This implementation plan outlines the upgrades required to transform the current Town Council Portal into a production-ready Minimum Viable Product (MVP). It adds comprehensive CRUD (Create, Read, Update, Delete) and "View Details" capabilities across the Admin and Citizen dashboards.

---

## Gaps Addressed (Based on User Feedback)
* **Admin Full CRUD Access**: The Administrator will have complete CRUD permissions (Create, Read, Update, Delete) and detailed item inspectors across all features (Users, Service Requests, Permits, Announcements, and Bookings).
* **Citizen Visibility**: Citizens will be able to click on any submitted request, permit application, or event booking to view the complete history of admin reviews, comments, and status update timelines in real-time.

---

## Proposed Phase-by-Phase Upgrades

We will build these upgrades in 5 distinct phases.

### Phase 1: Admin User Management Overhaul
Upgrade the admin panel to allow full administration of citizen and staff accounts.
* **Backend Changes**:
  * Create `POST /api/admin/users` to create a new user (with password hashing).
  * Create `PUT /api/admin/users/:id` to update user fields (username, email, role, password).
  * Create `DELETE /api/admin/users/:id` to delete a user.
  * Create `GET /api/admin/users/:id/details` to fetch a user's full activity history (total taxes paid, list of submitted requests, list of permit applications).
* **Frontend Changes**:
  * **Add User Modal**: Forms to register citizens or admins directly.
  * **Edit User Modal**: Form to modify name, email, role, and reset password.
  * **Delete User Action**: Button to remove accounts.
  * **View User Details Modal**: Displays a detailed profile summary including list of submitted permits, service requests, and tax payments.

### Phase 2: Municipal Service Requests Upgrades
Add timeline history, edit/delete capabilities, and manual logging for service requests.
* **Backend Changes**:
  * Create `POST /api/admin/requests` to create a request on behalf of a citizen.
  * Create `PUT /api/admin/requests/:id` to edit service request details (title, description, category, priority).
  * Create `DELETE /api/admin/requests/:id` to delete a service request.
* **Frontend Changes**:
  * **Log Request Modal**: Allows admins to select a citizen and create a utility report for them.
  * **Edit Request Modal**: Allows admins to modify request fields.
  * **Delete Request Action**: Allows admins to delete any request.
  * **View Details Modal (Admin & Citizen)**: Shows a timeline track (e.g. "Submitted" -> "In-progress" -> "Resolved") complete with comments, status badges, and timestamps.

### Phase 3: Permit Application Board Upgrades
Add detailed architectural review panels, editing, and deletion capabilities.
* **Backend Changes**:
  * Create `POST /api/admin/permits` to submit a permit application on behalf of a citizen.
  * Create `PUT /api/admin/permits/:id` to edit permit details.
  * Create `DELETE /api/admin/permits/:id` to delete a permit.
* **Frontend Changes**:
  * **Submit Permit Modal**: Admins can register a permit for a citizen.
  * **Edit Permit Modal**: Edit permit details.
  * **Delete Permit Action**: Delete permit applications.
  * **View Details Modal (Admin & Citizen)**: Shows full application details, comments, type of permit, status logs, and updates.

### Phase 4: Announcement Management Upgrades
Allow admins to manage posted alerts and notices.
* **Backend Changes**:
  * Create `PUT /api/admin/announcements/:id` to edit an announcement.
  * Create `DELETE /api/admin/announcements/:id` to delete an announcement.
* **Frontend Changes**:
  * Display a list of all current announcements with **Edit** and **Delete** actions.
  * **Edit Announcement Modal**: Modify titles, categories, and target audiences of notices.

### Phase 5: Admin Event Bookings Management
Introduce booking administration to approve, cancel, or log community events.
* **Backend Changes**:
  * Create `GET /api/admin/bookings` to fetch all bookings.
  * Create `POST /api/admin/bookings` to book an event/facility on behalf of a citizen.
  * Create `PUT /api/admin/bookings/:id` to update booking details or status (Approved, Cancelled, Pending).
  * Create `DELETE /api/admin/bookings/:id` to delete a booking.
* **Frontend Changes**:
  * Add **Event Bookings** tab to the Admin Sidebar.
  * Render a table of bookings with details (Citizen, Event, Venue, Date, Slot, Status).
  * Add actions to **Approve**, **Cancel**, **Edit**, **Delete**, or **Log Booking** manually.

---

## Proposed File Changes

### Backend

#### [NEW] [userRoutes.js](file:///c:/Users/Piesie/OneDrive/Desktop/project%20Work/backend/routes/userRoutes.js)
* Create endpoints for user profile edits.

#### [MODIFY] [adminRoutes.js](file:///c:/Users/Piesie/OneDrive/Desktop/project%20Work/backend/routes/adminRoutes.js)
* Register routes:
  * `POST /users` (Add user)
  * `PUT /users/:id` (Edit user)
  * `DELETE /users/:id` (Delete user)
  * `GET /users/:id/details` (Get user history details)
  * `POST /requests` (Create request)
  * `PUT /requests/:id` (Edit request)
  * `DELETE /requests/:id` (Delete request)
  * `POST /permits` (Create permit)
  * `PUT /permits/:id` (Edit permit)
  * `DELETE /permits/:id` (Delete permit)
  * `PUT /announcements/:id` (Edit announcement)
  * `DELETE /announcements/:id` (Delete announcement)
  * `GET /bookings` (Get all bookings)
  * `POST /bookings` (Create booking)
  * `PUT /bookings/:id` (Update booking)
  * `DELETE /bookings/:id` (Delete booking)

#### [MODIFY] [adminController.js](file:///c:/Users/Piesie/OneDrive/Desktop/project%20Work/backend/controllers/adminController.js)
* Implement controllers: `createUser`, `editUser`, `deleteUser`, `getUserDetails`, `createRequestOnBehalf`, `editRequest`, `deleteRequest`, `createPermitOnBehalf`, `editPermit`, `deletePermit`, `updateAnnouncement`, `deleteAnnouncement`, `getAllBookings`, `createBookingOnBehalf`, `updateBooking`, `deleteBooking`.

### Frontend

#### [MODIFY] [AdminDashboard.jsx](file:///c:/Users/Piesie/OneDrive/Desktop/project%20Work/frontend/src/pages/AdminDashboard.jsx)
* Add modals for User Add/Edit/View details.
* Add modals for Request Add/Edit/View details.
* Add modals for Permit Add/Edit/View details.
* Add Announcements edit/delete actions and forms.
* Add new `Event Bookings` tab view.

#### [MODIFY] [CitizenDashboard.jsx](file:///c:/Users/Piesie/OneDrive/Desktop/project%20Work/frontend/src/pages/CitizenDashboard.jsx)
* Integrate detail drawers/modals for taxes, permits, requests, and bookings.

---

## Verification Plan

### Automated Verification
* Verify the backend compiles and routes resolve correctly.
* Run Vitest or linting tools to assert frontend integrity.

### Manual Verification
1. Log in as Admin. Navigate to **User Management** -> Add a user -> Edit the user -> View details to verify all links, counts, and history match.
2. Log in as Citizen. Check if the newly added user can submit service requests.
3. Verify that details modals show clean timelines, and edit forms display current state correctly.
