# Contributing to Rungset

Rungset is a focused beta. Keep contributions centered on the goal → milestone → task → check-in loop and avoid speculative feature surface.

## Code of Conduct

Please read and follow the [Code of Conduct](CODE_OF_CONDUCT.md). Reports can be
sent privately using the contact method described there.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title** for the issue
* **Describe the exact steps to reproduce the problem**
* **Provide specific examples** to demonstrate the steps
* **Describe the behavior you observed after following the steps**
* **Explain which behavior you expected to see instead and why**
* **Include screenshots or animated GIFs** if possible
* **Include your environment details** (OS, browser version, etc.)
* **Remove secrets, credentials, personal data, and workspace content before posting**

Do not file a public issue for a suspected security vulnerability. See
[SECURITY.md](SECURITY.md) instead.

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title** for the issue
* **Provide a step-by-step description of the suggested enhancement**
* **Provide specific examples to demonstrate the steps**
* **Describe the current behavior** and **explain which behavior you expected to see instead**
* **Explain why this enhancement would be useful**
* **List some other applications where this enhancement exists** if applicable

### Pull Requests

1. Fork the repository and create your branch from `main`
2. If you've added code that should be tested, add tests
3. Ensure the test suite passes
4. Make sure your code follows the existing style guidelines
5. Sign commits if you already use commit signing; unsigned commits are accepted unless a repository policy says otherwise

### Development Process

1. Clone the repository
   ```bash
   git clone https://github.com/Ismailco/Rungset.git
   cd Rungset
   ```

2. Install dependencies
   ```bash
   pnpm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .dev.vars
   cp .env.example .env.local
   # Edit .dev.vars and .env.local with your configuration
   ```

4. Create a new branch
   ```bash
   git switch -c feature/your-feature-name
   ```

### Coding Style

- Use TypeScript for type safety
- Follow the existing code style
- Use meaningful variable and function names
- Comment your code when necessary
- Keep functions small and focused
- Use Next.js best practices
- Follow React hooks rules
- Implement proper error handling
- Write clean, maintainable code

### Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line
- Consider starting the commit message with an applicable emoji:
  * 🎨 `:art:` when improving the format/structure of the code
  * 🐛 `:bug:` when fixing a bug
  * ✨ `:sparkles:` when adding a new feature
  * 📝 `:memo:` when writing docs
  * 🔧 `:wrench:` when updating configuration files
  * ⚡️ `:zap:` when improving performance
  * 🔒 `:lock:` when dealing with security

### Testing

The repository uses dependency-light unit tests and an isolated OpenNext/D1 integration test. Build the Worker before running the integration suite:

```bash
pnpm exec eslint . --max-warnings=0
pnpm exec tsc --noEmit
pnpm build
pnpm_config_verify_deps_before_run=false pnpm exec opennextjs-cloudflare build
pnpm test
pnpm test:e2e
```

When adding tests, prioritize authorization, ownership checks, progress calculations, export scoping, and the critical browser journey. The browser suite uses the system Chromium/Chrome binary when available; set `BROWSER_EXECUTABLE_PATH` to override it.

### Documentation

- Update the README.md if needed
- Add JSDoc comments for new functions and components
- Update API documentation if you change any endpoints
- Include comments explaining complex logic

### Review Process

1. A maintainer will review your PR
2. They might request changes or improvements
3. Once approved, your PR will be merged
4. Your contribution will be added to the changelog

### Working with Issues

- Feel free to ask for help or clarification in issues
- Tag issues appropriately
- Reference related issues in your PRs
- Close issues with PRs when applicable
- Look for issues labelled `good first issue` or `help wanted` when starting out

## Project Structure

Please maintain the existing project structure:

```
rungset/
├── app/                # Next.js App Router pages and route handlers
├── components/         # Reusable React components
├── lib/                # Domain, auth, storage, and server utilities
├── drizzle/            # Forward-only D1 migrations
└── public/             # Static assets and PWA files
```

## Questions?

If you have any questions, please feel free to:

1. Check the in-app documentation at [https://rungset.com/docs](https://rungset.com/docs)
2. Create an issue for discussion
3. Reach out through GitHub issues

## License

By contributing to Rungset, you agree that your contributions will be licensed under its AGPLv3 license.

---

Thank you for contributing to Rungset! 🎯
