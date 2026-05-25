# @babeli/core

<p align="center">
  <img src="https://github.com/uebelack/babeli/blob/main/babeli.png?raw=true" style="height: 150px;" alt="Babeli"/>
</p>

Core library and CLI for babeli. Includes built-in readers and writers for JSON, JavaScript, TypeScript, YAML, and Apple Strings files.

## Installation

```bash
bun add @babeli/core
```

You also need at least one model provider for auto-translation:

```bash
bun add @babeli/anthropic  # or @babeli/ollama
```

## CLI Usage

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

### CLI Options

| Option                    | Alias | Description                                                                          |
| ------------------------- | ----- | ------------------------------------------------------------------------------------ |
| `--files <paths...>`      | `-f`  | Translation files. For multiple files, prefix with language: `de:de.json en:en.json` |
| `--charset <encoding>`    | `-c`  | Character set for reading/writing files (default: `utf-8`)                           |
| `--directory <path>`      | `-d`  | Working directory (default: current directory)                                       |
| `--base-language <code>`  | `-b`  | Base language code for translations (default: `en`)                                  |
| `--actions <list>`        | `-a`  | Comma-separated list of actions (default: all registered)                            |
| `--model-provider <name>` | `-p`  | AI model provider (`anthropic` or `ollama`)                                          |
| `--model <name>`          | `-m`  | AI model to use                                                                      |
| `--api-key <key>`         | `-k`  | API key for the model provider                                                       |
| `--api-url <url>`         | `-u`  | API URL for the model provider                                                       |
| `--verbose`               | `-v`  | Enable verbose debug output                                                          |

## Config File

Create a `babeli.config.mjs` in your project root:

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

Then run:

```bash
bunx babeli validate
bunx babeli update
```

CLI arguments override config file values.

### Configuration Properties

| Property           | Type                                   | Description                                    |
| ------------------ | -------------------------------------- | ---------------------------------------------- |
| `file`             | `string`                               | Path to a multi-language translation file      |
| `files`            | `{ language: string, file: string }[]` | Paths to single-language translation files     |
| `modelProvider`    | `string`                               | AI model provider name (`anthropic`, `ollama`) |
| `model`            | `string`                               | AI model name                                  |
| `apiKey`           | `string`                               | API key for the model provider                 |
| `apiUrl`           | `string`                               | API URL for the model provider                 |
| `baseLanguage`     | `string`                               | Base language code (default: `en`)             |
| `actions`          | `string[]`                             | Actions to run (default: all registered)       |
| `charset`          | `string`                               | File encoding (default: `utf-8`)               |
| `workingDirectory` | `string`                               | Working directory (default: `.`)               |
| `debug`            | `boolean`                              | Enable debug logging                           |
| `skip`             | `boolean`                              | Skip execution                                 |

## Supported File Formats

### JSON (`.json`)

Single-language (flat):

```json
{
  "greeting": "Hello",
  "farewell": "Goodbye"
}
```

Single-language (nested, auto-detected):

```json
{
  "common": {
    "greeting": "Hello",
    "farewell": "Goodbye"
  }
}
```

Multi-language (key-first):

```json
{
  "greeting": { "en": "Hello", "de": "Hallo" },
  "farewell": { "en": "Goodbye", "de": "Auf Wiedersehen" }
}
```

Multi-language (nested):

```json
{
  "common": {
    "greeting": { "en": "Hello", "de": "Hallo" }
  }
}
```

### JavaScript (`.js` / `.mjs`)

Single-language:

```js
export default {
  button: {
    yes: "Yes",
    no: "No",
  },
};
```

Multi-language (language-first):

```js
export default {
  en: {
    button: { yes: "Yes", no: "No" },
  },
  de: {
    button: { yes: "Ja", no: "Nein" },
  },
};
```

### TypeScript (`.ts` / `.mts`)

Same format as JavaScript. TypeScript files are loaded natively by Bun.

### YAML (`.yaml` / `.yml`)

Single-language:

```yaml
button:
  yes: "Yes"
  no: "No"
error:
  message:
    notfound: The requested resource was not found.
```

Multi-language (language-first):

```yaml
en:
  button:
    yes: "Yes"
    no: "No"
de:
  button:
    yes: Ja
    no: Nein
```

### Apple Strings (`.strings`)

Used in Xcode / iOS / macOS projects. Always single-language, one file per `.lproj` directory:

```
"button.yes" = "Yes";

"button.no" = "No";

"error.message.notfound" = "The requested resource was not found.";
```

Configuration example for `.strings` files:

```js
export default {
  files: [
    { language: "en", file: "Resources/en.lproj/Localizable.strings" },
    { language: "de", file: "Resources/de.lproj/Localizable.strings" },
  ],
  baseLanguage: "en",
  modelProvider: "anthropic",
};
```

## Actions

### `sort`

Validates that translation keys are sorted alphabetically. On update, sorts them.

### `missing`

Validates that all keys exist across all languages. On update, generates missing translations using the configured AI model provider.

The translation prompt uses Jaro-Winkler similarity to find similar existing translations and includes them as context for better consistency.

## Environment Variables

| Variable                   | Description                     |
| -------------------------- | ------------------------------- |
| `BABELI_SKIP`              | Set to `true` to skip execution |
| `BABELI_MODEL_PROVIDER`    | Override model provider         |
| `BABELI_MODEL`             | Override model name             |
| `BABELI_API_URL`           | Override API URL                |
| `BABELI_ANTHROPIC_API_KEY` | Anthropic API key               |
| `ANTHROPIC_API_KEY`        | Anthropic API key (fallback)    |

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
const errors = await Babeli.validate(config);
if (errors.length > 0) {
  console.error("Validation errors:", errors);
}

// Update (sort + translate missing)
await Babeli.update(config);
```

### Registering a Custom Provider

Model providers are auto-loaded from `@babeli/<name>` packages. You can also register them manually:

```typescript
import { ChatModelFactory } from "@babeli/core";
import { AnthropicChatModelProvider } from "@babeli/anthropic";

ChatModelFactory.registerProvider(
  "anthropic",
  new AnthropicChatModelProvider(),
);
```

## License

MIT
