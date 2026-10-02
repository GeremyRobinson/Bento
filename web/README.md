# Bento (React + TypeScript rebuild)

The rebuild of the app in `../index.html`, which stays live and is the product spec until this reaches parity.
Plan and audit: `math-app/refactor/audit.md` in the project files.

Every lesson is one pipeline, and nothing problem-specific is written anywhere else:

```
generator → canonical problem → answer model → explanation + diagram model → UI, SVG, narration, hints, checks, animation
```

```
npm install
npm run dev            # local app
npm test               # engine, curriculum, diagram and UI flow tests
npm run build          # dist/ (static, works from any folder)
npm run build:preview  # dist-preview/index.html, one self-contained file
```

Folders: `app/` (routing, state), `curriculum/` (grades, lessons, generators, schemas), `engine/` (evaluation, diagnosis,
adaptive help, mastery, practice sessions), `explanations/` (diagram schemas and builders), `components/`, `screens/`,
`persistence/` (IndexedDB, migrations, backup), `styles/` (tokens, bands, motion), `tests/`.
