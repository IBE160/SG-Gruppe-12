# Project Overview

This document provides a high-level overview of the "AI CV and Application" project.

## 1. Project Purpose

The goal of this project is to create a web application that leverages AI to help job seekers create CVs and cover letters that are perfectly tailored to specific job descriptions. It aims to reduce the time and effort job seekers spend on customizing applications and increase their chances of passing through Applicant Tracking Systems (ATS).

## 2. Executive Summary

This is a multi-part application consisting of:
- **A Next.js frontend:** Provides a rich, interactive user interface for managing CVs, analyzing job ads, and viewing results.
- **An Express.js backend:** A RESTful API that handles user data, interacts with the database, and will integrate with AI services.

The project is currently in the initial development phase. A significant amount of the data structure and UI components have been defined, but the integration between the frontend and backend is not yet implemented.

## 3. Technology Stack Summary

| Part       | Language     | Framework   | Key Libraries/DB     |
|------------|--------------|-------------|----------------------|
| **Frontend** | TypeScript   | Next.js     | React, Tailwind CSS  |
| **Backend**  | JavaScript   | Express.js  | PostgreSQL (`pg`)    |

## 4. Architecture

- **Repository Structure:** Multi-part (`frontend` and `src`)
- **Frontend Architecture:** Component-based
- **Backend Architecture:** Layered, Service-oriented API

For a detailed breakdown, please see the full architecture documents.

## 5. Links to Detailed Documentation

- **Architecture:**
    - [Frontend Architecture](./architecture-frontend.md)
    - [Backend Architecture](./architecture-src.md)
    - [Integration Architecture](./integration-architecture.md)
- **Development & Deployment:**
    - [Development Guide](./development-guide.md)
    - [Deployment Guide](./deployment-guide.md)
- **Source Code & Analysis:**
    - [Source Tree Analysis](./source-tree-analysis.md)
    - [Frontend Component Inventory](./component-inventory-frontend.md)
    - [Backend API Contracts](./api-contracts-backend.md)
    - [Backend Data Models](./data-models-backend.md)
