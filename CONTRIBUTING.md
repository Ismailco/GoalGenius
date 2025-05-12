# Contributing to GoalGenius

First off, thank you for considering contributing to GoalGenius! It's people like you that make GoalGenius such a great tool.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

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
5. Make sure your commits are signed

### Development Process

1. Clone the repository
   ```bash
   git clone https://github.com/ismailco/goalgenius.git
   cd goalgenius
   ```

2. Install dependencies
   ```bash
   pnpm install
   ```

3. Set up environment variables
   ```bash
   cp .dev.vars.example .dev.vars
   cp .env.local.example .env.local
   # Edit .dev.vars and .env.local with your configuration
   ```

4. Create a new branch
   ```bash
   git checkout -b feature/your-feature-name
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

- Write tests for new features
- Update tests when modifying existing features
- Ensure all tests pass before submitting a pull request
- Include both unit tests and integration tests where appropriate

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

## Project Structure

Please maintain the existing project structure:

```
goalgenius/
├── app/                # Next.js app router pages
├── components/         # Reusable React components
├── lib/               # Utility functions and helpers
├── drizzle/           # Database schema and migrations
└── public/            # Static assets
```

## Questions?

If you have any questions, please feel free to:

1. Check the documentation at [https://goalgenius.online/docs](https://goalgenius.online/docs) (coming soon)
2. Create an issue for discussion
3. Reach out through GitHub issues

## License

By contributing to GoalGenius, you agree that your contributions will be licensed under its AGPLv3 license.

---

Thank you for contributing to GoalGenius! 🎯
