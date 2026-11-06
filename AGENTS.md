# AGENTS.md

## Project Overview

This project is a self-hosted, browser-based voice communication and screen-sharing application for small groups.

The core goals are:

- Voice communication between participants.
- Screen sharing through the browser.
- Ephemeral rooms.
- Short-lived, single-use invites.
- Explicit viewer authorization for screen shares.
- Self-hosting on a VPS or local network.
- No persistent chat or media storage.
- Security-focused design.
- Simple deployment.

The project is intentionally smaller in scope than Discord.

Do not introduce features such as persistent servers, chat history, friends, direct messages, recordings, databases, mobile applications, or user profiles unless explicitly requested.

---

# Development Philosophy

Prefer small, incremental changes.

Each task should:

1. Have one clear responsibility.
2. Be independently understandable.
3. Include relevant tests.
4. Avoid unrelated refactors.
5. Avoid implementing future features prematurely.
6. Leave the codebase in a working state.

Do not implement multiple roadmap steps at once unless explicitly requested.

If the requested task belongs to a specific roadmap step, only implement what is necessary for that step.

---

# Current Architecture

The project is a monorepo.

Expected structure:

```text
apps/
├── web/
└── server/

packages/
└── shared/

docs/
```

The exact structure may evolve, but preserve separation between:

- browser application;
- backend/control plane;
- shared contracts;
- infrastructure;
- documentation.

---

# Technology Stack

## Frontend

Preferred stack:

- React
- TypeScript
- Vite
- Vitest
- React Testing Library

The frontend runs in the browser.

Do not introduce Electron unless explicitly requested.

The browser is intentionally part of the security model and should remain the default client.

---

## Backend

Preferred stack:

- Node.js
- TypeScript
- NestJS

The backend is responsible for:

- room lifecycle;
- participant sessions;
- invites;
- authorization;
- signaling;
- WebSocket communication;
- media permissions;
- integration with the SFU.

The backend must not process or store media unnecessarily.

---

## Realtime Media

The planned media architecture is:

```text
Browser
   │
   │ WebRTC
   ▼
SFU
   │
   ▼
Other browsers
```

The expected SFU is mediasoup unless explicitly changed.

Do not implement custom RTP, ICE, DTLS, codec, or WebRTC stacks.

Do not attempt to send media through normal backend HTTP or WebSocket connections.

WebSockets are for signaling and realtime control messages, not media transport.

---

# Package Manager

Use `pnpm`.

Prefer pnpm workspaces for monorepo management.

Do not introduce npm, Yarn, Bun, Turborepo, Nx, or another build system unless explicitly requested.

Use existing workspace tooling before adding dependencies.

---

# Scope

The initial product includes:

- room creation;
- ephemeral rooms;
- single-use invites;
- short invite expiration;
- participants;
- voice communication;
- mute/unmute;
- deafen when implemented;
- screen sharing;
- screen viewer authorization;
- kick participant;
- room termination;
- self-hosting;
- Docker-based deployment;
- TURN support;
- browser client.

The initial product does NOT require:

- text chat;
- message history;
- persistent rooms;
- social graph;
- friends;
- direct messages;
- persistent user accounts;
- media recording;
- stored audio;
- stored video;
- PostgreSQL;
- MongoDB;
- persistent database storage.

Do not add a database just because the application has domain entities.

Rooms, participants, invites, and stream permissions should initially be ephemeral.

---

# Ephemeral State

The system is intentionally designed around ephemeral resources.

Initial in-memory state may include:

```text
rooms
participants
invites
sessions
stream permissions
```

Do not persist these objects unless explicitly required.

When the last participant leaves a room, the room should eventually be destroyed according to the room lifecycle rules.

Destroying a room must invalidate related ephemeral resources.

---

# Security Model

Security is a first-class concern.

Use defense in depth.

Assume:

```text
client does not trust server
server does not trust client
participants do not automatically trust other participants
```

Never rely only on frontend checks for authorization.

Authorization must be enforced server-side.

---

# Room Security

Room identifiers must not be predictable.

Do not use sequential IDs such as:

```text
room/1
room/2
room/3
```

Use cryptographically suitable random identifiers such as UUIDs or secure random bytes.

Do not expose internal implementation details through IDs.

---

# Invite Security

Invites must follow these rules unless explicitly changed:

- cryptographically strong random token;
- short expiration time;
- single use;
- scoped to one room;
- invalid when the room no longer exists.

Generate invite tokens using cryptographically secure randomness.

Example:

```ts
crypto.randomBytes(32)
```

Do not use:

- Math.random;
- sequential IDs;
- short numeric codes as the security boundary.

Prefer storing only a hash of the invite token server-side.

Example:

```text
Client:
raw invite token

Server:
SHA-256(raw invite token)
```

The raw invite token is a bearer credential and must be treated as sensitive.

Opening an invite URL must not automatically consume the invite.

The invite should only be consumed when the user explicitly attempts to join.

Invite redemption must be atomic.

Two requests attempting to redeem the same invite must not both succeed.

---

# Participant Sessions

An invite is not a long-lived session credential.

The expected flow is:

```text
invite
   ↓
redeem
   ↓
participant session
```

Participant sessions must be scoped to:

- participant;
- room;
- permissions.

Do not allow a session from one room to operate on another room.

Session IDs and credentials must not be predictable.

---

# Screen Share Authorization

Being a participant in a room does NOT automatically imply access to every screen share.

The intended security model is:

```text
Participant B wants to watch Participant A
                ↓
        request authorization
                ↓
         Participant A approves
                ↓
       server grants permission
                ↓
        media subscription allowed
```

This permission must be enforced server-side.

Do not implement screen-share access control merely by hiding or disabling UI elements.

A modified frontend must not be able to bypass the authorization.

Screen access should eventually be scoped to:

```text
viewer session
+
stream session
```

When the stream ends, its viewer permissions should be discarded.

When a participant disconnects and receives a new session, old stream authorization should not automatically transfer unless explicitly designed otherwise.

---

# Room Ownership

A room has an owner.

The owner is initially the participant who creates the room.

Owner-only operations may include:

- generating invites;
- kicking participants;
- destroying the room.

Authorization for these operations must be validated by the backend.

Never trust fields such as:

```json
{
  "isOwner": true
}
```

sent by the client.

Ownership must come from server-side state.

---

# Room Lifecycle

The room lifecycle should be explicit.

Typical lifecycle:

```text
CREATED
   ↓
ACTIVE
   ↓
EMPTY
   ↓
DESTROYED
```

The exact grace period before destruction may change.

A room must not remain indefinitely after all participants leave unless explicitly configured.

Room destruction should invalidate:

- unused invites;
- participant sessions;
- stream sessions;
- stream permissions;
- other room-scoped ephemeral state.

---

# Media Privacy

The server should not store:

- microphone audio;
- webcam video;
- screen-share video.

Do not add recording or persistence unless explicitly requested.

Media should use WebRTC and the SFU.

Transport encryption provided by WebRTC does not automatically mean end-to-end encryption against the SFU.

Do not describe media as end-to-end encrypted unless application-level E2EE has actually been implemented and verified.

---

# Browser Security

The browser is intentionally used as a security boundary.

Use standard browser APIs for:

- microphone access;
- camera access;
- screen capture;
- WebRTC.

Examples include:

```text
getUserMedia
getDisplayMedia
RTCPeerConnection
```

Do not attempt to bypass browser permission prompts.

Do not attempt to silently select or capture a user's screen.

The user must remain in control of media permissions.

---

# Backend Design

Prefer clear domain boundaries.

Potential modules include:

```text
RoomModule
InviteModule
ParticipantModule
SessionModule
RealtimeModule
MediaModule
```

Do not create modules solely to increase abstraction.

Create a module when it owns a meaningful domain responsibility.

Prefer domain logic inside services rather than controllers.

Controllers and WebSocket gateways should remain thin.

---

# Controllers

Controllers should primarily:

1. validate/request input;
2. call domain/application services;
3. map results to HTTP responses.

Avoid placing domain logic directly inside controllers.

Bad:

```ts
@Post()
createRoom() {
  // generate IDs
  // mutate room maps
  // create participant
  // create session
  // enforce rules
}
```

Preferred:

```ts
@Post()
createRoom(...) {
  return this.roomService.createRoom(...);
}
```

---

# WebSocket Gateways

WebSockets are used for realtime control and signaling.

Examples:

```text
participant joined
participant left
room destroyed
stream access requested
stream access approved
stream access denied
WebRTC signaling
```

Do not use WebSockets for transporting audio or video.

Validate every privileged realtime action using server-side session state.

Do not assume a connected socket is authorized for every event.

---

# Shared Contracts

Use `packages/shared` for contracts that genuinely need to be shared between frontend and backend.

Examples:

- DTO-like shared types;
- event payloads;
- enums;
- schemas;
- identifiers where appropriate.

Avoid dumping backend internals into the shared package.

Do not share database/domain implementation objects directly with the frontend.

Prefer explicit contracts.

---

# Validation

Validate untrusted input at system boundaries.

This includes:

- HTTP request bodies;
- URL parameters;
- query parameters;
- WebSocket messages;
- invite tokens;
- display names;
- room IDs;
- participant IDs.

Use the project's existing validation mechanism.

Do not duplicate validation libraries without a clear reason.

---

# Error Handling

Errors should be explicit and meaningful.

Examples:

```text
RoomNotFound
InviteNotFound
InviteExpired
InviteAlreadyUsed
Unauthorized
ParticipantNotFound
RoomDestroyed
```

Do not use generic `Error` everywhere when the domain distinction matters.

Map domain errors appropriately to transport-level responses.

For example:

```text
InviteExpired
→ HTTP 410 Gone

Unauthorized
→ HTTP 403 Forbidden
```

Exact mappings may evolve, but remain consistent.

---

# Testing Philosophy

Testing is an explicit project goal.

Do not treat tests as an optional follow-up task.

Feature changes should include relevant tests in the same task whenever practical.

The project does not require strict TDD.

Use the appropriate testing level for each behavior.

---

# Unit Tests

Use unit tests primarily for domain rules and deterministic logic.

Good candidates:

```text
RoomService
InviteService
Participant lifecycle
permission checks
invite expiration
single-use invite behavior
room destruction rules
```

Unit tests should:

- run quickly;
- avoid starting HTTP servers;
- avoid network access;
- minimize unnecessary mocks.

Test observable behavior rather than private implementation details.

---

# Integration Tests

Use integration tests for boundaries between components.

Good candidates:

```text
HTTP endpoint → controller → service
WebSocket event → gateway → service
Nest module wiring
invite redemption flow
room lifecycle through API
```

Prefer real application components when practical.

Do not mock the code being tested just to make the test easier.

---

# End-to-End Tests

Use a smaller number of E2E tests for critical workflows.

Examples:

```text
create room
→ create invite
→ redeem invite
→ participant joins
```

and:

```text
last participant leaves
→ room destroyed
→ old invite rejected
```

Do not try to cover every edge case with E2E tests.

Edge cases normally belong in unit or integration tests.

---

# Frontend Tests

Use React Testing Library.

Test behavior from the user's perspective.

Prefer:

```text
user clicks button
→ expected content appears
```

over:

```text
component internal state equals X
```

Avoid testing implementation details.

Mock external boundaries such as network requests when appropriate.

---

# Test Coverage

Do not optimize for 100% coverage.

Coverage is a diagnostic tool, not the primary goal.

Prioritize tests around:

- security-sensitive behavior;
- domain rules;
- lifecycle transitions;
- authorization;
- edge cases;
- failure handling.

A smaller number of meaningful tests is preferable to a large number of trivial tests.

---

# Bug Fixes

When fixing a reproducible bug:

1. Prefer adding a regression test that demonstrates the bug.
2. Fix the bug.
3. Verify the regression test now passes.
4. Run relevant existing tests.

Do not add meaningless tests solely to increase coverage.

---

# TypeScript Guidelines

Use strict TypeScript.

Avoid `any`.

If `any` is genuinely required, explain why in a comment or task summary.

Prefer:

```ts
unknown
```

over `any` when dealing with untrusted input.

Use explicit domain types where they improve clarity.

Do not add unnecessary generic abstractions.

Prefer readable TypeScript over clever TypeScript.

---

# Code Style

Prefer:

- small functions;
- explicit names;
- clear control flow;
- early returns;
- immutable data when reasonable;
- composition over inheritance;
- dependency injection where NestJS naturally supports it.

Avoid:

- deep nesting;
- unnecessary design patterns;
- speculative abstractions;
- premature optimization;
- giant services;
- magic constants.

Configuration values such as invite TTL should not be scattered through the code.

---

# Dependencies

Do not introduce a new dependency before checking whether:

1. the platform already provides the feature;
2. Node.js provides the feature;
3. the existing project dependencies already provide it.

Examples:

Use:

```ts
node:crypto
```

for cryptographic randomness and hashes.

Do not install another package for basic token generation.

Every new production dependency increases:

- maintenance;
- attack surface;
- supply-chain exposure.

Keep dependencies intentional.

---

# Security-Sensitive Code

Be especially careful when changing:

- authentication;
- authorization;
- invite handling;
- session handling;
- cryptographic token generation;
- room ownership;
- WebSocket authorization;
- stream authorization;
- CORS;
- CSP;
- cookies;
- tokens;
- network exposure.

Do not weaken security checks merely to make a test or development flow easier.

If a temporary development shortcut is necessary, make it explicit and keep it isolated from production behavior.

---

# Logging

Do not log sensitive credentials.

Never log:

- raw invite tokens;
- access/session tokens;
- authorization headers;
- cookies containing credentials.

Prefer structured logging where practical.

Room IDs and participant IDs may be logged when useful, provided they are not themselves authentication credentials.

---

# Git Workflow

Never make changes directly on the `main` branch.

For every development task:

1. Start from an up-to-date `main`.
2. Create a new branch dedicated to the task.
3. Make all changes on that branch.
4. Run the relevant validation commands.
5. Commit the changes.
6. Push the branch.
7. Open a Pull Request targeting `main`.

The expected workflow is:

```text
main
  ↓
feature/fix/chore branch
  ↓
implementation + tests
  ↓
commit
  ↓
push
  ↓
Pull Request
  ↓
review
  ↓
merge into main
```

Do not commit directly to `main`, even for small fixes, documentation changes, or configuration updates, unless explicitly instructed otherwise.

Prefer descriptive branch names, for example:

```text
chore/initialize-monorepo
feat/server-health-endpoint
feat/room-creation
feat/single-use-invites
fix/invite-double-redemption
test/room-lifecycle
```

Before creating a branch, ensure it is based on the latest available `main`.

Do not merge the Pull Request automatically unless explicitly instructed. The expected workflow is that the Pull Request is reviewed and accepted separately.

---

# Commits

When asked to suggest commit messages, use Conventional Commits.

Examples:

```text
chore: initialize monorepo
feat(server): add health endpoint
feat(web): add room creation flow
test(server): cover single-use invite behavior
fix(server): prevent duplicate invite redemption
refactor(server): extract room lifecycle service
```

A task does not need to artificially match one commit if the implementation naturally requires more, but keep commits understandable.

---

# Verification Before Completion

Before considering a task complete, run the relevant project checks when available.

Typical checks:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

If there are separate packages, run the relevant filtered commands when that is more appropriate.

Do not claim that tests pass unless they were actually executed successfully.

If a command cannot be run, state that clearly.

---

# Documentation

Update documentation when a change materially alters:

- architecture;
- security model;
- public API;
- room lifecycle;
- deployment;
- development workflow.

Do not create large documentation files for trivial implementation details.

---

# Roadmap Discipline

The project is intentionally developed in stages.

Current early roadmap:

```text
Stage 0
Project foundation

Stage 1
Rooms, participants, invites and lifecycle

Stage 2
1:1 voice

Stage 3
Multi-user voice

Stage 4
Basic screen sharing

Stage 5
Screen viewer authorization

Stage 6
Security hardening

Stage 7
Self-hosting

Stage 8
TURN and real-world NAT traversal

Stage 9
Media quality and metrics

Stage 10
Observability and performance
```

Do not implement features from future stages unless explicitly requested.

For example, during Stage 1 do not introduce:

- mediasoup;
- WebRTC;
- TURN;
- Redis;
- PostgreSQL;
- Kubernetes.

Build only what is required by the current stage.

---

# Working With Tasks

When given a development task:

1. Inspect the relevant existing code first.
2. Understand the current architecture.
3. Identify the smallest change that satisfies the task.
4. Implement it.
5. Add or update relevant tests.
6. Run relevant validation commands.
7. Summarize:
   - what changed;
   - important implementation decisions;
   - tests executed;
   - any remaining limitations.

Do not silently expand the task.

If there are multiple reasonable implementations, prefer the simplest one consistent with the project's current architecture.

---

# Learning-Oriented Development

This project is also used as a learning project.

Prefer implementations that remain understandable to a software engineer reading the code.

Do not hide important architecture behind excessive abstractions or generated code.

For significant concepts such as:

- WebSockets;
- WebRTC;
- mediasoup;
- ICE;
- DTLS;
- RTP;
- TURN;
- authorization;

keep code structure clear enough that the data flow can be followed.

Avoid treating libraries as magic.

When implementing non-obvious behavior, short comments explaining **why** are more useful than comments explaining obvious syntax.

---

# Non-Goals

Unless explicitly requested, do not:

- build a Discord clone;
- build text chat;
- persist conversation data;
- store media;
- build account management;
- add OAuth;
- add social features;
- add Kubernetes;
- add microservices;
- introduce event brokers such as Kafka;
- introduce Redis before there is a concrete need;
- build custom cryptography;
- build custom WebRTC protocols.

Keep the system small and understandable.

---

# Primary Design Principle

When choosing between two implementations, prefer the one that keeps this invariant:

> A small self-hosted server should be able to run the application with minimal infrastructure, while authorization and security are enforced by the server and media remains ephemeral.

The project should remain easy to:

```text
clone
configure
run
understand
test
self-host
```