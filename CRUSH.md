# CRUSH.md

Project: Flask web app + CLI script (Python)

Build/Run
- Web: python app.py (Flask dev server on http://localhost:5000)
- CLI: python gpa.py
- Install deps: python -m venv .venv && .venv/Scripts/pip install -r requirements.txt (Windows) | python3 -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt (POSIX)

Lint/Format/Typecheck (suggested defaults)
- Ruff lint: ruff check .
- Ruff format: ruff format .
- MyPy: mypy .
- Single-file: ruff check gpa.py; mypy gpa.py

Tests (if pytest added later)
- Run all: pytest -q
- Single test file: pytest -q tests/test_app.py::TestApp::test_route

Code style
- Imports: stdlib, third-party, local; no wildcard imports; group with blank lines; prefer absolute imports.
- Formatting: 120-char soft limit; use black/ruff formatting; single quotes or double consistently; trailing commas for multiline.
- Types: add type hints for function params/returns; use typing.Optional, dict/list generics; validate external inputs.
- Naming: snake_case for functions/vars, PascalCase for classes, UPPER_SNAKE for constants.
- Errors: never swallow exceptions; return JSON errors with proper HTTP codes in Flask; raise ValueError for invalid CLI args.
- Security: never log secrets; validate user input (roll number regex already enforced); set timeouts on requests.
- HTTP: requests.get(..., timeout=10); check status codes; avoid retries without backoff.
- Files/Paths: use os.path / pathlib; no hardcoded OS paths; create dirs with exist_ok=True.
- Logging: prefer logging module over prints in web code; CLI may use prints with color but keep errors to stderr.

Notes
- No Cursor or Copilot rules found.
- Consider adding ruff and mypy to dev dependencies for consistent CI.
