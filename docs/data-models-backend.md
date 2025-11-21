# Backend Data Models

This document describes the database schema for the "AI CV and Application" project, as inferred from the models in `src/models/`. The backend uses a PostgreSQL database.

## Tables

### `users`
Stores user account information.

| Column          | Type      | Description                               |
|-----------------|-----------|-------------------------------------------|
| `id`            | SERIAL    | **Primary Key**                           |
| `name`          | VARCHAR   | The user's full name.                     |
| `email`         | VARCHAR   | The user's email address (must be unique).|
| `password_hash` | VARCHAR   | The hashed password for the user.         |
| `created_at`    | TIMESTAMP | Timestamp of when the user was created.   |
| `updated_at`    | TIMESTAMP | Timestamp of the last update.             |

### `cvs`
Represents a complete CV, which is composed of several components.

| Column          | Type      | Description                                     |
|-----------------|-----------|-------------------------------------------------|
| `id`            | SERIAL    | **Primary Key**                                 |
| `user_id`       | INTEGER   | Foreign Key to `users.id`.                      |
| `title`         | VARCHAR   | A user-defined title for the CV (e.g., "Software Engineer CV"). |
| `component_ids` | INTEGER[] | An array of foreign keys to `cv_components.id`. |
| `created_at`    | TIMESTAMP | Timestamp of when the CV was created.           |
| `updated_at`    | TIMESTAMP | Timestamp of the last update.                   |

### `cv_components`
Stores individual, reusable parts of a CV, like a work experience entry or an education entry.

| Column           | Type      | Description                                     |
|------------------|-----------|-------------------------------------------------|
| `id`             | SERIAL    | **Primary Key**                                 |
| `user_id`        | INTEGER   | Foreign Key to `users.id`.                      |
| `component_type` | VARCHAR   | The type of component (e.g., 'experience', 'education', 'skill'). |
| `content`        | JSONB     | The actual data for the component, stored in JSON format. |
| `created_at`     | TIMESTAMP | Timestamp of when the component was created.    |
| `updated_at`     | TIMESTAMP | Timestamp of the last update.                   |

### `job_postings`
Stores information about job postings that a user has saved or imported.

| Column      | Type      | Description                             |
|-------------|-----------|-----------------------------------------|
| `id`          | SERIAL    | **Primary Key**                         |
| `user_id`     | INTEGER   | Foreign Key to `users.id`.              |
| `title`       | VARCHAR   | The job title.                          |
| `company`     | VARCHAR   | The name of the company.                |

| `description` | TEXT      | The full text of the job description.   |
| `url`         | VARCHAR   | A URL link to the original job posting. |
| `created_at`  | TIMESTAMP | Timestamp of when the record was created. |
| `updated_at`  | TIMESTAMP | Timestamp of the last update.           |

### `application_analyses`
Stores the results of an analysis performed on a CV against a specific job posting.

| Column                        | Type      | Description                                  |
|-------------------------------|-----------|----------------------------------------------|
| `id`                          | SERIAL    | **Primary Key**                              |
| `user_id`                     | INTEGER   | Foreign Key to `users.id`.                   |
| `cv_id`                       | INTEGER   | Foreign Key to `cvs.id`.                     |
| `job_posting_id`              | INTEGER   | Foreign Key to `job_postings.id`.            |
| `generated_application_content` | TEXT      | The tailored cover letter or application text. |
| `generated_cv_content`        | TEXT      | The tailored CV content.                     |
| `ats_feedback`                | JSONB     | Structured feedback on ATS compatibility.    |
| `quality_feedback`            | JSONB     | Structured feedback on overall quality.      |
| `created_at`                  | TIMESTAMP | Timestamp of when the analysis was created.  |
