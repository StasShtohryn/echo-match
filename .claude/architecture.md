Project Architecture

Pattern

Clean Architecture

Presentation

↓

Application

↓

Domain

↓

Infrastructure

No layer may depend on an outer layer.

Responsibilities

API

Controllers

Authentication

Validation

HTTP

Application

Use Cases

Business Services

CQRS

DTO Mapping

Domain

Entities

Value Objects

Business Rules

Infrastructure

Entity Framework

Cloudinary

Email

Caching

Logging

Repositories

SignalR

Principles

Business logic never belongs inside Controllers.

Business logic never belongs inside Entity Framework.

Infrastructure should never contain business rules.