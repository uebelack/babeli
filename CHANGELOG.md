# Changelog

## [1.0.0] - 2026-11-13

### Breaking changes

- 💥 require Node.js 24

### Bug fixes

- 🐛 default Anthropic model to claude-sonnet-5-5

### Refactoring

- ♻️ use AIMessage.text to extract the translation
- ♻️ remove unreachable error handling in readers, writers and MissingAction

### Dependencies

- ⬆️ update TypeScript to v7
- ⬆️ update yargs to v18
- ⬆️ update @clack/prompts to v1
- ⬆️ update @langchain/anthropic and @langchain/ollama to v1
- ⬆️ update dependencies

### Documentation

- 📝 document Node.js requirement and development commands

### Tests

- ✅ raise coverage to 100%
- ✅ migrate from bun test to Vitest
- ✅ load fixture provider instead of @babeli/anthropic in core

### CI

- 👷 add release workflow with staged npm publish and git-cliff changelog
- 👷 run on pnpm and Node.js 24/26 with typecheck, build and integration

### Style

- 🎨 replace ESLint and Prettier with oxlint and oxfmt

### Chores

- 📦 build packages with tsdown and publish only dist
- 🔧 migrate from Bun to pnpm

### Other

- 🏷️ type the CLI --files option as string array and add typecheck script
- 🚨 resolve oxlint findings

## [0.0.3] - 2026-05-29

### Features

- ✨ add support for Apple .strings file format
- ✨ add YAML file format support
- ✨ add TypeScript file reader and writer support
- ✨ add example package and improve provider loading
- ✨ add JavaScript/ES module file support
- ✨ add config file support and project documentation
- ✨ add support for nested JSON translation files
- ✨ add CLI interface with validate and update commands
- feat: add Anthropic and Ollama chat model providers
- feat: add Babeli core class with validate and update methods
- ✨ add file reader and writer system with JSON support
- ✨ add action system with logging infrastructure
- ✨ add AI-powered translation service with chat model integration

### Refactoring

- 🔨 consolidate bunfig.toml configuration to root level
- 🔨 extract CLI into separate package

### Documentation

- docs: restructure documentation with package-specific READMEs

### Tests

- 🧪 add integration test workflow
- 🧪 add test coverage for translation models

### Chores

- 🔧 bump version to 0.0.3
- 🔧 bump version to 0.0.2 and update dependencies
- 🔧 remove unused test scripts from package.json files
- 🔧 add @babeli/anthropic as dev dependency to core package
- chore: consolidate build configuration and fix string escaping

### Other

- 🛠️ prepare packages for npm publication
- 🎉 initialize babeli monorepo with core translation management
