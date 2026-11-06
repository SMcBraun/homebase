# Feature Specification: HomeBase Property Maintenance Tracker

**Feature Branch**: `001-property-maintenance-tracker`  
**Created**: 2026-11-05  
**Status**: Draft  
**Input**: User description: "Create a project specification for HomeBase, a property maintenance tracker web app that helps homeowners record maintenance and see what is due or upcoming. Include account sign up/login/manage account; CRUD properties; CRUD maintenance tasks, recurring schedules, and history of completed tasks; a dashboard with upcoming maintenance, overdue tasks, and possible expenses; API endpoints; and P0/P1/P2 implementation priorities."

## Product Overview

**Project title**: HomeBase  

**Description**: HomeBase is a property maintenance tracker that lets homeowners organize their properties, record maintenance work, and see what needs attention next, including overdue work and possible expenses.

**Purpose**: Help homeowners avoid missed maintenance by keeping property details, planned work, recurring schedules, and completed-work history in one place.

**Target audience**: Homeowners who struggle to track maintenance across one or more homes or other properties.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and manage an account (Priority: P0)

As a homeowner, I want to create an account, sign in, and manage my account so my property and maintenance records are available to me and protected from other users.

**Why this priority**: An account is required to keep personal property records private and available across visits.

**Independent Test**: A new user can sign up, sign in, update account details, sign out, and sign in again without creating a property.

**Acceptance Scenarios**:

1. **Given** an email address not already registered, **When** the user submits valid sign-up details, **Then** an account is created and the user is signed in.
2. **Given** an existing account, **When** the user submits the correct sign-in details, **Then** the user sees their own HomeBase account.
3. **Given** an incorrect or incomplete sign-in attempt, **When** the user submits it, **Then** access is denied and a clear, non-sensitive message explains that sign-in failed.
4. **Given** a signed-in user, **When** they edit account details or change their password, **Then** the updated details are used on their next visit.
5. **Given** a signed-in user, **When** they sign out, **Then** private account and property information is no longer available until they sign in again.
6. **Given** a user who cannot sign in, **When** they complete the account recovery process, **Then** they can regain access without revealing whether another person's account exists.
7. **Given** a signed-in user who requests account deletion, **When** they confirm the request, **Then** their account and associated property and maintenance data are removed and cannot be accessed afterward.

### User Story 2 - Organize properties (Priority: P0)

As a homeowner, I want to add, view, update, and remove properties so maintenance is associated with the right home or property.

**Why this priority**: Property records organize every maintenance task and dashboard item.

**Independent Test**: A signed-in user can create a property, view it in their property list, edit its details, and remove it.

**Acceptance Scenarios**:

1. **Given** a signed-in user, **When** they add a property with a name and location, **Then** it appears in their property list.
2. **Given** a property owned by the user, **When** they update its name, location, or notes, **Then** the property view shows the updated details.
3. **Given** a property owned by the user, **When** they request its removal and confirm, **Then** it and its associated tasks, schedules, and history are removed from the user's account and dashboard.
4. **Given** a user attempts to view or change a property belonging to another account, **When** the request is made, **Then** no other user's property information is disclosed or changed.

### User Story 3 - Track maintenance and completed work (Priority: P0)

As a homeowner, I want to create, view, update, and remove maintenance tasks and record completed work so I know what has been done and what remains.

**Why this priority**: Recording planned and completed work is the core information HomeBase needs to provide useful tracking.

**Independent Test**: A user can add a task to one property, edit it, mark it complete with a completion date, find it in history, and remove an active task.

**Acceptance Scenarios**:

1. **Given** one of the user's properties, **When** the user creates a maintenance task with a title and due date, **Then** the task is associated with that property and appears in its maintenance list.
2. **Given** an active task, **When** the user changes its details or due date, **Then** the updated information appears wherever that task is shown.
3. **Given** an active task, **When** the user marks it complete, **Then** it is removed from active due work and a dated completion record appears in the property's history.
4. **Given** a completion record, **When** the user corrects its date, notes, or actual cost, **Then** the history shows the corrected information.
5. **Given** an active task, **When** the user removes it, **Then** it no longer appears as upcoming or overdue; any existing completion records remain available in history.
6. **Given** a task with no estimated cost, **When** it appears in the task list or dashboard, **Then** it remains trackable and is not treated as a zero-cost estimate.

### User Story 4 - Schedule recurring maintenance (Priority: P1)

As a homeowner, I want to manage recurring maintenance schedules so routine work is not forgotten after one completion.

**Why this priority**: Recurrence reduces repeat data entry and helps homeowners plan routine upkeep, after the core one-time task workflow is available.

**Independent Test**: A user can create a recurring schedule for a property, change its cadence, stop it, and verify that completing an occurrence advances the next due date.

**Acceptance Scenarios**:

1. **Given** a user's property, **When** they create a recurring schedule with a task name, first due date, and cadence, **Then** HomeBase shows the next occurrence as due on that date.
2. **Given** an active recurring schedule, **When** the user changes its cadence or next due date, **Then** future occurrences follow the revised schedule.
3. **Given** an occurrence generated by a schedule, **When** the user records it as complete, **Then** the completion is added to history and the next occurrence is dated according to the schedule.
4. **Given** an active recurring schedule, **When** the user stops or deletes the schedule, **Then** no further occurrence is created; existing tasks and completion history remain visible.

### User Story 5 - See upcoming and overdue work (Priority: P0)

As a homeowner, I want a dashboard showing upcoming and overdue maintenance across my properties so I can decide what needs attention.

**Why this priority**: A clear view of due work turns stored records into the primary day-to-day value of HomeBase.

**Independent Test**: With test tasks having past, near-future, and later due dates, the dashboard lists overdue and upcoming work in the correct groups and links each item to its property.

**Acceptance Scenarios**:

1. **Given** one or more active tasks with due dates in the past, **When** the user opens the dashboard, **Then** those tasks appear in an overdue group with their property and due dates.
2. **Given** active tasks with due dates in the upcoming period, **When** the user opens the dashboard, **Then** those tasks appear in chronological order with their property and due dates.
3. **Given** a task is completed or removed, **When** the dashboard is refreshed, **Then** it no longer appears as active upcoming or overdue work.
4. **Given** the user has no upcoming or overdue tasks, **When** they open the dashboard, **Then** HomeBase shows a clear empty state rather than an error.
5. **Given** tasks across multiple properties, **When** the user views the dashboard, **Then** all displayed tasks belong to the signed-in user and identify their associated property.

### User Story 6 - Review possible maintenance expenses (Priority: P1)

As a homeowner, I want to see optional estimated expenses for upcoming and overdue maintenance so I can anticipate likely costs without mistaking estimates for actual spending.

**Why this priority**: Cost estimates add planning value, but the maintenance tracker remains useful when estimates are unavailable.

**Independent Test**: With costs entered for some due tasks and left blank for others, a user can see labeled estimates and totals for the dashboard's upcoming and overdue groups.

**Acceptance Scenarios**:

1. **Given** an active task, **When** the user enters or changes an optional estimated cost, **Then** the task displays the estimate with its currency.
2. **Given** dashboard tasks with estimates and tasks without estimates, **When** the dashboard is opened, **Then** it shows a clearly labeled possible-expense total for the estimated tasks and does not imply that missing estimates are zero.
3. **Given** a completed task with an actual cost, **When** the user views its history, **Then** the actual cost is distinct from any original estimate.
4. **Given** no estimates for the dashboard period, **When** the user views possible expenses, **Then** HomeBase indicates that estimates are unavailable instead of displaying a misleading zero.

### User Story 7 - Focus an expense outlook (Priority: P2)

As a homeowner, I want to choose a date range for the possible-expense outlook so I can focus on the costs relevant to my planning period.

**Why this priority**: Date-range filtering improves planning but is not necessary for the first useful dashboard.

**Independent Test**: A user can select a date range and verify that the displayed possible-expense total includes only active tasks due within that range.

**Acceptance Scenarios**:

1. **Given** active tasks with estimates on different due dates, **When** the user selects a start and end date, **Then** only estimates for tasks due within the inclusive range contribute to the outlook.
2. **Given** an invalid range where the start date is after the end date, **When** the user submits it, **Then** HomeBase explains the issue and keeps the previous valid outlook.
3. **Given** no estimated tasks in the selected range, **When** the user views the outlook, **Then** HomeBase distinguishes the absence of estimates from an estimated total of zero.

### Edge Cases

- When a user has no properties, the property list and dashboard provide helpful empty states and a clear way to add a first property.
- When a required task title or due date is missing or invalid, HomeBase identifies the field and does not save an incomplete task.
- When a task's due date is today, it is shown as due today rather than overdue.
- When a recurrence cadence would produce a date that does not exist in a month (for example, the 31st), the occurrence uses the last calendar day of that month.
- When a recurring task is overdue and remains incomplete, HomeBase shows the existing occurrence as overdue and does not create duplicate overdue occurrences.
- When an estimate is absent, it is excluded from expense totals and is never represented as a confirmed actual expense.
- When an account is deleted, its private account, property, task, schedule, and history data is no longer accessible.
- When a user is offline or a request cannot be completed, HomeBase preserves already saved information, explains that the change did not complete, and allows the user to retry.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: HomeBase MUST allow a user to sign up, sign in, sign out, and recover access to their account.
- **FR-002**: HomeBase MUST allow a signed-in user to view and update account details, change their password, and request account deletion with confirmation.
- **FR-003**: HomeBase MUST ensure that a user can access and change only their own account, property, maintenance, schedule, and history information.
- **FR-004**: HomeBase MUST allow a signed-in user to create, view, update, and delete properties with a name and location and optional notes.
- **FR-005**: HomeBase MUST allow a user to create, view, update, and delete maintenance tasks associated with one of their properties. A task MUST include a title and due date and MAY include a description, category, and estimated cost.
- **FR-006**: HomeBase MUST allow a user to mark an active task complete and create a completion-history record containing a completion date and optional notes and actual cost.
- **FR-007**: HomeBase MUST allow a user to view, correct, and delete completion-history records. Removing an active task MUST NOT silently remove its existing history records.
- **FR-008**: HomeBase MUST allow a user to create, view, update, and stop or delete recurring maintenance schedules associated with one of their properties.
- **FR-009**: A recurring schedule MUST have a task name, first or next due date, and cadence. Completing an occurrence MUST add a history record and advance the next due date according to that cadence.
- **FR-010**: HomeBase MUST show each signed-in user a dashboard of their active upcoming and overdue tasks, grouped by status and showing the property and due date.
- **FR-011**: HomeBase MUST classify a task due today separately from overdue work and show upcoming work in due-date order.
- **FR-012**: HomeBase MUST support optional estimated costs for active maintenance tasks and show clearly labeled possible-expense totals for upcoming and overdue work. Missing estimates MUST be excluded and disclosed.
- **FR-013**: HomeBase MUST distinguish an estimated cost from the actual cost recorded for completed work.
- **FR-014**: HomeBase MUST allow users to filter the possible-expense outlook to an inclusive due-date range. This is a P2 capability.
- **FR-015**: HomeBase MUST provide clear empty, validation, access-denied, and recoverable-failure messages without exposing another user's data.
- **FR-016**: When a user deletes an account, HomeBase MUST remove access to that account's associated property and maintenance records.
- **FR-017**: Deleting or stopping a recurring schedule MUST prevent future occurrences without silently deleting existing tasks or completion history.
- **FR-018**: Deleting a property MUST require confirmation and remove its associated tasks, schedules, and completion history from the user's account.

### Assumptions

- Sign-up and account recovery use an email address; account recovery verifies control of that address.
- The dashboard's default upcoming window is the next 30 calendar days, including today. Users can use the P2 date-range control to choose another period for the expense outlook.
- Users choose a recurrence cadence in days, weeks, months, or years. A monthly or yearly occurrence that falls on a nonexistent calendar date uses the last valid day of that month.
- Estimated and actual costs use one clearly labeled currency per account; HomeBase does not convert between currencies. Estimates are planning aids, not confirmed charges.
- Deleting a property or account removes its associated records after the user confirms the action. Deleting only a task or schedule does not silently erase existing completion history.
- Dates are interpreted in the user's local calendar for due-today, overdue, and upcoming grouping.
- No external product or service dependencies are assumed by this specification.

### Implementation Priorities

Priorities indicate delivery order; all listed capabilities remain in the project scope.

- **P0 — Essential tracker**: Sign-up, sign-in, sign-out and account recovery; account management; property CRUD; one-time maintenance task CRUD; completion history; dashboard with upcoming and overdue work.
- **P1 — Routine planning**: Recurring schedule CRUD and advancement after completion; optional task estimates; possible-expense totals and clear estimate-versus-actual labeling.
- **P2 — Planning refinement**: Date-range filtering for the possible-expense outlook.

### API Endpoints

The following endpoint catalog defines the expected product-facing API contract. `{propertyId}`, `{taskId}`, `{scheduleId}`, and `{completionId}` identify the corresponding user's records. Every endpoint that reads or changes private data MUST enforce the signed-in user's access.

| Priority | Method | Endpoint | Purpose |
|---|---|---|---|
| P0 | POST | `/api/auth/signup` | Create an account and begin a signed-in session. |
| P0 | POST | `/api/auth/login` | Sign in to an existing account. |
| P0 | POST | `/api/auth/logout` | End the current signed-in session. |
| P0 | POST | `/api/auth/password-reset` | Request account access recovery. |
| P0 | POST | `/api/auth/password-reset/confirm` | Complete account recovery after verifying the request. |
| P0 | GET, PATCH, DELETE | `/api/account` | View or update account details; delete the account on confirmed request. |
| P0 | GET, POST | `/api/properties` | List the signed-in user's properties or create a property. |
| P0 | GET, PATCH, DELETE | `/api/properties/{propertyId}` | View, update, or delete one owned property. |
| P0 | GET, POST | `/api/properties/{propertyId}/maintenance-tasks` | List or create tasks for an owned property. |
| P0 | GET, PATCH, DELETE | `/api/maintenance-tasks/{taskId}` | View, update, or remove an owned active task. |
| P0 | POST | `/api/maintenance-tasks/{taskId}/completions` | Mark a task complete and record its completion. |
| P0 | GET | `/api/properties/{propertyId}/maintenance-history` | List completion history for an owned property. |
| P0 | PATCH, DELETE | `/api/maintenance-completions/{completionId}` | Correct or remove an owned completion-history record. |
| P0 | GET | `/api/dashboard` | Retrieve upcoming and overdue maintenance for the signed-in user. |
| P1 | GET, POST | `/api/properties/{propertyId}/maintenance-schedules` | List or create recurring schedules for an owned property. |
| P1 | GET, PATCH, DELETE | `/api/maintenance-schedules/{scheduleId}` | View, update, stop, or delete an owned recurring schedule. |
| P1 | GET | `/api/dashboard` | Include possible-expense totals for upcoming and overdue work when estimates are available; estimates are entered through task creation or update. |
| P2 | GET | `/api/dashboard?from={date}&to={date}` | Filter the possible-expense outlook to an inclusive due-date range. |

### Key Entities

- **Account**: A homeowner's sign-in identity and account details; owns their properties and maintenance records.
- **Property**: A home or other property owned by one account, with a name, location, and optional notes.
- **Maintenance task**: A one-time or scheduled piece of work associated with a property, with a title, due date, status, and optional estimate.
- **Recurring schedule**: The cadence and next due date for repeating maintenance associated with a property.
- **Completion record**: A dated record of completed maintenance, with optional notes and actual cost, retained in property history.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 90% of first-time users in a usability test can create an account and sign in successfully without assistance.
- **SC-002**: At least 90% of users in a usability test can add a property and its first maintenance task in under 3 minutes.
- **SC-003**: In test scenarios, every active task is shown in the correct dashboard group—upcoming, due today, or overdue—based on its due date.
- **SC-004**: At least 90% of users in a usability test can find a property's completed-maintenance history and identify its latest completion date without assistance.
- **SC-005**: For dashboard tasks with estimates, the displayed possible-expense totals match the sum of included estimates in 100% of verification cases; unestimated tasks are never counted as zero-cost items.
- **SC-006**: At least 90% of users in a usability test can identify the next due date for a recurring task after recording its current occurrence as complete.
- **SC-007**: In access-control verification scenarios, no user can view or change another account's properties, tasks, schedules, or completion history.
- **SC-008**: At least 90% of users who complete the core property-and-task setup rate the dashboard as clear enough to identify their next maintenance action.

## Technical Requirements

- **Framework**: Next.js (App Router)
- **Language**: TypeScript in strict mode (no use of `any`)
- **Styling**: Tailwind CSS (utility-first)
- **Code quality**: ESLint and Prettier, using the shared `.prettierrc`
- **Components**: Server Components by default; Client Components only where interactivity is needed
- **Data and authentication**: Database and sign-in provider to be selected by the team during Week 03 data modeling
- **Hosting**: Vercel
- **Team workflow**: Feature branches (`feature/task-name`) and pull requests reviewed by at least one teammate before merging into `main`
