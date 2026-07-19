# AGENTS.md

## Project scope

This repository contains the independent **Exchange Life (交换人生)** project.

- Keep all project work within this repository.
- Do not read from, copy from, or modify the DesignSpark project.
- The product scope is a desktop-first Web product; do not silently redefine it as a mobile app.
- Follow the existing documentation structure under `docs/`.
- Keep changes minimal and directly related to the requested task.

## Privacy and AI rules

- Drafts, original recordings, original images, transcripts, OCR results, and AI working summaries are private to their owner by default.
- Only content explicitly confirmed and published by its owner may be shown to the other participant.
- Every AI-organized or AI-generated result requires the owner's confirmation before publication.
- AI perspective convergence may read only both participants' final published letters and explicitly published attachments.
- Do not expose service credentials or AI provider keys in browser code; AI capabilities belong behind server-side interfaces.

## Development constraints

- Treat `docs/product/functional-requirements.md` as the primary functional requirements source.
- Keep the two choice dimensions independent: narrative content and exchange method.
- Do not add instant chat, stranger matching, leaderboards, check-ins, tree decay, or other unrequested engagement mechanics.
- Do not install dependencies, connect external services, or mutate a database unless the user explicitly requests it.
- Preserve existing documents and make additive, reviewable changes.
