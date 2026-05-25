# @babeli/ollama

[Ollama](https://ollama.ai) local LLM provider for [babeli](../../README.md).

## Installation

```bash
bun add @babeli/core @babeli/ollama
```

## Usage

Make sure Ollama is running locally, then:

```bash
bunx babeli update -f translations.json -p ollama

# Use a specific model
bunx babeli update -f translations.json -p ollama -m llama3:8b
```

Programmatic registration:

```typescript
import { ChatModelFactory } from "@babeli/core";
import { OllamaChatModelProvider } from "@babeli/ollama";

ChatModelFactory.registerProvider("ollama", new OllamaChatModelProvider());
```

## Configuration

| Setting  | Environment Variable | Default                  |
| -------- | -------------------- | ------------------------ |
| Model    | `BABELI_MODEL`       | `qwen3:8b`               |
| Base URL | `BABELI_API_URL`     | `http://localhost:11434` |

## License

MIT
