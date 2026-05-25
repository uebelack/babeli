# @babeli/anthropic

Anthropic Claude model provider for [babeli](../../README.md).

## Installation

```bash
bun add @babeli/core @babeli/anthropic
```

## Usage

With the CLI (auto-loaded):

```bash
bunx babeli update -f translations.json -p anthropic -k sk-ant-...
```

Or via environment variable:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
bunx babeli update -f translations.json -p anthropic
```

Programmatic registration:

```typescript
import { ChatModelFactory } from "@babeli/core";
import { AnthropicChatModelProvider } from "@babeli/anthropic";

ChatModelFactory.registerProvider(
  "anthropic",
  new AnthropicChatModelProvider(),
);
```

## Configuration

| Setting | Environment Variable                              | Default                    |
| ------- | ------------------------------------------------- | -------------------------- |
| API Key | `BABELI_ANTHROPIC_API_KEY` or `ANTHROPIC_API_KEY` | (required)                 |
| Model   | `BABELI_MODEL`                                    | `claude-sonnet-4-20250514` |

## License

MIT
