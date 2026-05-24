# babeli

AI-powered translation management for JSON-based projects. Validate, sort, and automatically generate missing translations using LLMs.

## Features

- **Validate** translation files for missing keys and sort order
- **Auto-translate** missing translations using AI (Anthropic Claude or local Ollama models)
- **Flat and nested JSON** support (`"key": "value"` and `"section": { "key": "value" }`)
- **Single-language files** (`en.json`, `de.json`) and **multi-language files** (`translations.json` with `{ "key": { "en": "...", "de": "..." } }`)
- **Config file support** via `babeli.config.mjs`
- **Extensible** action, reader, writer, and model provider registries

## Requirements

- [Bun](https://bun.sh) v1.3+

## Installation

```bash
git clone <repository-url>
cd babeli
bun install
```

## Quick Start

### Using the CLI

```bash
# Validate a multi-language file
bunx babeli validate -f translations.json

# Validate single-language files
bunx babeli validate -f en:locales/en.json de:locales/de.json

# Update (sort + generate missing translations)
bunx babeli update -f translations.json -p anthropic -k sk-ant-...

# Update using Ollama (local)
bunx babeli update -f translations.json -p ollama -m qwen3:8b
```

### Using a Config File

Create a `babeli.config.mjs` in your project root:

```js
export default [
  {
    file: "translations.json",
    actions: ["sort", "missing"],
    modelProvider: "anthropic",
    baseLanguage: "en",
  },
];
```

Then simply run:

```bash
bunx babeli validate
bunx babeli update
```

CLI arguments override config file values:

```bash
# Override the model provider from config
bunx babeli update -p ollama
```

## CLI Reference

```
babeli <command>

Commands:
  babeli validate  Validates the translation files
  babeli update    Updates the translation files
```

### Options

| Option | Alias | Description |
|---|---|---|
| `--files <paths...>` | `-f` | Translation files. For multiple files, prefix with language: `de:de.json en:en.json` |
| `--charset <encoding>` | `-c` | Character set for reading/writing files (default: `utf-8`) |
| `--directory <path>` | `-d` | Working directory (default: current directory) |
| `--base-language <code>` | `-b` | Base language code for translations (default: `en`) |
| `--actions <list>` | `-a` | Comma-separated list of actions (default: all registered) |
| `--model-provider <name>` | `-p` | AI model provider (`anthropic` or `ollama`) |
| `--model <name>` | `-m` | AI model to use |
| `--api-key <key>` | `-k` | API key for the model provider |
| `--api-url <url>` | `-u` | API URL for the model provider |
| `--verbose` | `-v` | Enable verbose debug output |

## File Formats

### Single-Language Files

Flat:
```json
{
  "greeting": "Hello",
  "farewell": "Goodbye"
}
```

Nested (auto-detected on read, preserved on write):
```json
{
  "common": {
    "greeting": "Hello",
    "farewell": "Goodbye"
  },
  "home": {
    "title": "Welcome"
  }
}
```

### Multi-Language Files

Flat:
```json
{
  "greeting": { "en": "Hello", "de": "Hallo" },
  "farewell": { "en": "Goodbye", "de": "Auf Wiedersehen" }
}
```

Nested:
```json
{
  "common": {
    "greeting": { "en": "Hello", "de": "Hallo" }
  }
}
```

## Actions

### `sort`

Validates that translation keys are sorted alphabetically. On update, sorts them.

### `missing`

Validates that all keys exist across all languages. On update, generates missing translations using the configured AI model provider.

The translation prompt uses Jaro-Winkler similarity to find similar existing translations and includes them as context for better consistency.

## Model Providers

### Anthropic (`@babeli/anthropic`)

Uses Claude models via the Anthropic API.

| Setting | Environment Variable | Default |
|---|---|---|
| API Key | `BABELI_ANTHROPIC_API_KEY` or `ANTHROPIC_API_KEY` | (required) |
| Model | `BABELI_MODEL` | `claude-sonnet-4-20250514` |

```bash
bunx babeli update -f translations.json -p anthropic -k sk-ant-...
```

Or set the API key via environment variable:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
bunx babeli update -f translations.json -p anthropic
```

### Ollama (`@babeli/ollama`)

Uses local LLMs via [Ollama](https://ollama.ai).

| Setting | Environment Variable | Default |
|---|---|---|
| Model | `BABELI_MODEL` | `qwen3:8b` |
| Base URL | `BABELI_API_URL` | `http://localhost:11434` |

```bash
# Start Ollama first, then:
bunx babeli update -f translations.json -p ollama

# Use a specific model
bunx babeli update -f translations.json -p ollama -m llama3:8b
```

### Registering a Custom Provider

```typescript
import { ChatModelFactory } from "@babeli/core";
import { AnthropicChatModelProvider } from "@babeli/anthropic";

ChatModelFactory.registerProvider("anthropic", new AnthropicChatModelProvider());
```

## Config File Reference

`babeli.config.mjs` exports a single `Configuration` object or an array of them:

```js
// Single configuration
export default {
  file: "translations.json",
  modelProvider: "anthropic",
  baseLanguage: "en",
  actions: ["sort", "missing"],
};
```

```js
// Multiple configurations
export default [
  {
    file: "src/i18n/translations.json",
    actions: ["sort", "missing"],
    modelProvider: "anthropic",
  },
  {
    files: [
      { language: "en", file: "public/locales/en.json" },
      { language: "de", file: "public/locales/de.json" },
      { language: "fr", file: "public/locales/fr.json" },
    ],
    actions: ["sort", "missing"],
    modelProvider: "ollama",
    model: "qwen3:8b",
    baseLanguage: "en",
  },
];
```

### Configuration Properties

| Property | Type | Description |
|---|---|---|
| `file` | `string` | Path to a multi-language translation file |
| `files` | `{ language: string, file: string }[]` | Paths to single-language translation files |
| `modelProvider` | `string` | AI model provider name (`anthropic`, `ollama`) |
| `model` | `string` | AI model name |
| `apiKey` | `string` | API key for the model provider |
| `apiUrl` | `string` | API URL for the model provider |
| `baseLanguage` | `string` | Base language code (default: `en`) |
| `actions` | `string[]` | Actions to run (default: all registered) |
| `charset` | `string` | File encoding (default: `utf-8`) |
| `workingDirectory` | `string` | Working directory (default: `.`) |
| `debug` | `boolean` | Enable debug logging |
| `skip` | `boolean` | Skip execution |

## Environment Variables

| Variable | Description |
|---|---|
| `BABELI_SKIP` | Set to `true` to skip execution |
| `BABELI_MODEL_PROVIDER` | Override model provider |
| `BABELI_MODEL` | Override model name |
| `BABELI_API_URL` | Override API URL |
| `BABELI_ANTHROPIC_API_KEY` | Anthropic API key |
| `ANTHROPIC_API_KEY` | Anthropic API key (fallback) |

## Programmatic Usage

```typescript
import { Babeli } from "@babeli/core";
import type { Configuration } from "@babeli/core";

const config: Configuration = {
  file: "translations.json",
  actions: ["sort", "missing"],
  modelProvider: "anthropic",
  apiKey: "sk-ant-...",
  baseLanguage: "en",
};

// Validate
const errors = Babeli.validate(config);
if (errors.length > 0) {
  console.error("Validation errors:", errors);
}

// Update (sort + translate missing)
await Babeli.update(config);
```

## Project Structure

```
babeli/
  packages/
    core/              @babeli/core - Core library + CLI
      src/
        actions/       Sort and Missing translation actions
        ai/            ChatModelFactory and provider interface
        cli/           CLI commands and config file loading
        errors/        Error classes
        logging/       Logger and LoggingProvider
        model/         Translation, Translations, file interfaces
        readers/       JSON file reader
        services/      AI translation service
        util/          Jaro-Winkler similarity, relative path
        writers/       JSON file writer
        Babeli.ts      Main entry point (validate/update)
        Configuration.ts
    anthropic/         @babeli/anthropic - Anthropic Claude provider
    ollama/            @babeli/ollama - Ollama local LLM provider
```

## Development

```bash
# Install dependencies
bun install

# Run all tests
bun run test

# Run tests for a specific package
cd packages/core && bun test

# Lint
bun run lint:check
bun run lint:fix

# Format
bun run format:check
bun run format:fix
```

## License

MIT
