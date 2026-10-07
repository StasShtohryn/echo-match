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

AI Assistant

The same shape as SignalR, for the same reason. Application depends on
IAiAssistant and knows only that something turns a context into text;
Infrastructure holds ClaudeAiAssistant, the SDK client, the prompts and the
parsing of what comes back.

    Handler ──► IAiAssistant ──► ClaudeAiAssistant ──► Anthropic SDK ──► model
    (Application)  (Application)    (Infrastructure)

What the model is asked stays in Infrastructure; what the model is asked *about*
is assembled by the handler, which decides what may leave the server. The split
matters when it is time to argue about privacy: there is one file to read.

Arithmetic is never delegated to the model. Compatibility overlaps are computed
from the database and the model only phrases them, because a number a model
invents is not reproducible, not comparable between pairs, and cannot be
explained to the person it describes.

Principles

Business logic never belongs inside Controllers.

Business logic never belongs inside Entity Framework.

Infrastructure should never contain business rules.