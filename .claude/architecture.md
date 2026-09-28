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

The hub is an Api concern, like a controller: ChatHub takes calls from clients
(subscriptions, typing) and holds no state, since a hub instance lives for one
invocation.

Application never references SignalR. It depends on IChatNotifier, and the Api
implements it with IHubContext. A handler therefore writes to the database and
announces the result without knowing how, or whether, anyone is listening.

    Handler ──► IChatNotifier ──► SignalRChatNotifier ──► IHubContext ──► clients
    (Application)  (Application)        (Api)

Groups are named after the match, so an event addresses a conversation rather
than a person, and both participants receive the same call. Membership lives in
the memory of one process, which is what a backplane would have to replace
before a second instance is started.

Principles

Business logic never belongs inside Controllers.

Business logic never belongs inside Entity Framework.

Infrastructure should never contain business rules.