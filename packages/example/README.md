# @babeli/example

Example project for testing babeli with all supported file formats.

## Translation Files

| Format | Single-language | Multi-language |
| --- | --- | --- |
| JSON | `en.json`, `de.json`, `fr.json` | `multi.json` |
| JavaScript | `en.mjs`, `de.mjs` | `multi.mjs` |
| TypeScript | `en.ts`, `de.ts` | `multi.ts` |
| YAML | `en.yaml`, `de.yaml` | `multi.yaml` |
| Apple Strings | `en.lproj/Localizable.strings`, `de.lproj/Localizable.strings` | n/a |

## Usage

```bash
# Validate all translation files
bun run babeli:validate

# Update (sort + auto-translate missing keys)
bun run babeli:update

# Full integration test (validate, update, validate)
bun run integration
```

## License

MIT
