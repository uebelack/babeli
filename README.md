# babeli

[![CI](https://github.com/uebelack/babeli/actions/workflows/ci.yml/badge.svg)](https://github.com/uebelack/babeli/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Coverage Status](https://coveralls.io/repos/github/uebelack/babeli/badge.svg?branch=main)](https://coveralls.io/github/uebelack/babeli?branch=main)

<p align="center">
  <img src="https://github.com/uebelack/babeli/blob/main/babeli.png?raw=true" style="height: 150px;" alt="Babeli"/>
</p>

AI-powered translation management. Validate, sort, and automatically generate missing translations using LLMs.

## Quick Start

```bash
bun add @babeli/cli @babeli/anthropic
```

```bash
# Validate translation files
bunx babeli validate -f en:locales/en.json de:locales/de.json

# Auto-translate missing keys
bunx babeli update -f en:locales/en.json de:locales/de.json -p anthropic -k sk-ant-...
```

Or use a config file (`babeli.config.mjs`):

```js
export default {
  files: [
    { language: "en", file: "locales/en.json" },
    { language: "de", file: "locales/de.json" },
  ],
  modelProvider: "anthropic",
  baseLanguage: "en",
};
```

```bash
bunx babeli validate
bunx babeli update
```

## Packages

| Package                                     | Description                                |
| ------------------------------------------- | ------------------------------------------ |
| [`@babeli/cli`](./packages/cli)             | Command-line interface                     |
| [`@babeli/core`](./packages/core)           | Core library, readers/writers, and actions |
| [`@babeli/anthropic`](./packages/anthropic) | Anthropic Claude model provider            |
| [`@babeli/ollama`](./packages/ollama)       | Ollama local LLM provider                  |

## Supported File Formats

JSON, JavaScript (`.js`/`.mjs`), TypeScript (`.ts`/`.mts`), YAML (`.yaml`/`.yml`), and Apple Strings (`.strings`).

See the [`@babeli/cli` README](./packages/cli) for full documentation on CLI options, configuration, file formats, and usage.

See the [`@babeli/core` README](./packages/core) for programmatic usage and extensibility.

## Development

```bash
bun install
bun run test
bun run lint:check
bun run format:check
```

## License

MIT
