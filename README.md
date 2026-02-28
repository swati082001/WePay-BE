# WePay — Expense Sharing Application

A simple and efficient application for managing shared expenses within groups. Users can create groups, add expenses, automatically calculate balances, settle debts, and track payment and activity history.

---

## Table of Contents

- [Vision](#vision)
- [Scope](#scope)
- [Functional Requirements](#functional-requirements)
- [System Behavior](#system-behavior)
- [Architecture](#architecture)
- [API Design](#api-design)
- [Database Schemas](#database-schemas)

---

## Vision

| Feature | Description |
|--------|-------------|
| **Groups** | Create and manage groups of people who share expenses |
| **Expenses** | Add shared expenses with flexible split options |
| **Balances** | Automatically calculate who owes whom |
| **Settlements** | Settle debts between users and record payments |
| **History** | Track payment and activity history |

---

## Scope

### 2.1 User Authentication

- User Registration  
- User Login  
- User Logout  

### 2.2 Group Management

- Create groups  
- Add members to groups  
- Remove members from groups  
- Leave group  
- View group balance summary  

### 2.3 Expense Management

- Add expenses  
- Edit expenses  
- Delete expenses  
- Support **equal** and **custom** splits  

### 2.4 Dashboard

- **Total Owed** — amount others owe the user  
- **Total Owing** — amount the user owes others  
- **Net Balance** — overall balance  

### 2.5 Activity & Settlements

- Activity history (expenses and settlements)  
- Settle-up feature  
- Manual settlement recording  

### 2.6 Notifications (Basic)

- Expense added  
- Settlement recorded  
- Member added  
- Member removed  

---

## Functional Requirements

### 3.1 User Management

The system shall allow users to:

- Register a new account  
- Log in to an existing account  
- Log out securely  
- Update profile information  
- Delete their account  

### 3.2 Group Management

The system shall allow users to:

- Create a group  
- Add members to a group  
- Remove members from a group  
- Leave a group  
- View group balance summary  

### 3.3 Expense Management

The system shall:

- Automatically recalculate balances after every expense or settlement  
- Maintain complete transaction history  

Users shall be able to:

- Add an expense  
- Select the payer  
- Choose split type: **Equal** | **Exact amount** | **Percentage**  
- Attach notes to the expense  
- Edit an existing expense  
- Delete an expense  

### 3.4 Settlements

The system shall:

- Adjust balances automatically when a settlement is recorded  
- Maintain a settlement log  

Users shall be able to:

- Mark a debt as settled  
- Record a manual settlement  

### 3.5 Notifications

The system shall generate basic notifications for:

- Expense added  
- Settlement recorded  
- Member added to group  
- Member removed from group  

---

## System Behavior

- **Real-time balances** — All balances must be recalculated in real-time after any expense or settlement.  
- **Activity history** — All financial activities must be recorded in the activity history.  
- **Dashboard** — Must reflect updated totals instantly.  
- **Consistency** — Group balances and individual balances must stay in sync.  
- **Protected routes** — Protected pages must enforce authentication checks.  
- **Responsive UI** — Desktop and mobile support required.  

---

## Architecture

### Backend Modules

| Module | Responsibility |
|--------|----------------|
| **AuthModule** | Registration, login, logout, refresh tokens |
| **UsersModule** | Profile, update, delete account |
| **GroupsModule** | CRUD groups, members |
| **ExpensesModule** | CRUD expenses, splits |
| **SettlementsModule** | Create and list settlements |
| **NotificationsModule** | Basic in-app/email notifications |

### Frontend — Pages

**Public (no auth):**

- Login  
- Register  

**Protected (auth required):**

- Dashboard  
- Group Details  
- Add Expense  
- Profile  
- Activity History  

Protected routes must verify user authentication before rendering.

### Frontend — Core Components

| Category | Components |
|----------|------------|
| **Layout** | Navbar, Sidebar (desktop), Bottom Navigation (mobile) |
| **Group & Expense** | GroupCard, ExpenseCard, BalanceSummary |
| **Modals** | AddExpenseModal, SettlementModal |
| **Notifications** | NotificationToast |

---

## API Design (REST)

### Auth APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout |

### User APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/me` | Get current user |
| PATCH | `/users/me` | Update profile |
| DELETE | `/users/me` | Delete account |

### Group APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/groups` | Create group |
| GET | `/groups` | List user's groups |
| GET | `/groups/:id` | Get group by ID |
| PATCH | `/groups/:id` | Update group |
| DELETE | `/groups/:id` | Delete group |
| POST | `/groups/:id/members` | Add member(s) |

### Expense APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/expenses` | Create expense |
| GET | `/groups/:id/expenses` | List group expenses |
| PATCH | `/expenses/:id` | Update expense |
| DELETE | `/expenses/:id` | Delete expense |

### Settlement APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/settlements` | Record settlement |
| GET | `/groups/:id/settlements` | List group settlements |

---

## Database Schemas

### User

```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string (unique, indexed)",
  "passwordHash": "string",
  "avatarUrl": "string",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Group

```json
{
  "_id": "ObjectId",
  "name": "string",
  "createdBy": "userId",
  "members": ["userId"],
  "createdAt": "Date"
}
```

### Expense

```json
{
  "_id": "ObjectId",
  "groupId": "ObjectId",
  "description": "string",
  "amount": "number",
  "paidBy": "userId",
  "splitType": "equal | exact | percentage",
  "splits": [
    {
      "userId": "ObjectId",
      "amountOwed": "number"
    }
  ],
  "createdAt": "Date"
}
```

### Settlement

```json
{
  "_id": "ObjectId",
  "groupId": "ObjectId",
  "fromUser": "userId",
  "toUser": "userId",
  "amount": "number",
  "createdAt": "Date"
}
```

---

## Summary

This document defines the product and technical requirements for the WePay Expense Sharing Application: vision, scope, functional requirements, system behavior, backend and frontend architecture, REST API design, and database schemas. Use it as the single source of truth for implementation and alignment across frontend and backend.
