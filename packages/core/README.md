# @babeli/core

<p align="center">
  <img src="https://github.com/uebelack/babeli/blob/main/babeli.png?raw=true" style="height: 150px;" alt="Babeli"/>
</p>

Core library for babeli. Provides the translation engine, built-in actions, file readers/writers, and AI model integration.

For CLI usage and configuration, see the [`@babeli/cli` README](../cli).

## Installation

```bash
bun add @babeli/core
```

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

## Extensibility

### Custom Actions

```typescript
import { ActionRegistry } from "@babeli/core";

ActionRegistry.registerAction("my-action", (config) => new MyAction(config));
```

### Custom File Readers/Writers

```typescript
import { FileReaderRegistry, FileWriterRegistry } from "@babeli/core";

FileReaderRegistry.registerFileReader(
  ".custom",
  (config) => new MyReader(config),
);
FileWriterRegistry.registerFileWriter(
  ".custom",
  (config) => new MyWriter(config),
);
```

### Custom Model Providers

Model providers are auto-loaded from `@babeli/<name>` packages. You can also register them manually:

```typescript
import { ChatModelFactory } from "@babeli/core";
import { AnthropicChatModelProvider } from "@babeli/anthropic";

ChatModelFactory.registerProvider(
  "anthropic",
  new AnthropicChatModelProvider(),
);
```

## Built-in Actions

### `sort`

Validates that translation keys are sorted alphabetically. On update, sorts them.

### `missing`

Validates that all keys exist across all languages. On update, generates missing translations using the configured AI model provider.

## Supported File Formats

JSON (`.json`), JavaScript (`.js`/`.mjs`), TypeScript (`.ts`/`.mts`), YAML (`.yaml`/`.yml`), and Apple Strings (`.strings`).

## License

MIT
