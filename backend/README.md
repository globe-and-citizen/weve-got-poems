# We've Got Poems - Backend

## How to Run

### Ask for the `.env` file

This file is not included in the repository for security reasons.
Ask a member of the team for the file.

### Install Dependencies

```bash
npm install
```

### Run the Server

```bash
npm start
```

---

## Database Diagram

```mermaid
erDiagram
    USERS ||--|{ POEMS : creates
    USERS {
        int id PK
        string name
        string email UK
        string password
        timestamp created_at
    }
    POEMS {
        int id PK
        int user_id FK
        text content
        timestamp created_at
        string title
    }
```
