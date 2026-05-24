import type { Configuration } from "./Configuration";
import { ActionRegistry } from "./actions/ActionRegistry";
import { Logger } from "./logging/Logger";
import type { TranslationError } from "./model/Error";
import { FileReaderRegistry } from "./readers/FileReaderRegistry";
import { FileWriterRegistry } from "./writers/FileWriterRegistry";

function skip(configuration: Configuration): boolean {
  return (
    (process.env.BABELI_SKIP ?? String(configuration.skip ?? false)) === "true"
  );
}

function getActions(configuration: Configuration): string[] {
  return configuration.actions ?? [...ActionRegistry.getActionNames()];
}

export const Babeli = {
  validate(configuration: Configuration): TranslationError[] {
    const log = new Logger(configuration);

    if (skip(configuration)) {
      log.info("Babeli is skipped.");
      return [];
    }

    const errors: TranslationError[] = [];
    const fileReader = FileReaderRegistry.getFileReader(configuration);
    const actions = getActions(configuration);

    if (configuration.file) {
      const translationFile = fileReader.readMultiLanguageFile(
        configuration.file,
      );
      for (const actionName of actions) {
        const action = ActionRegistry.createAction(actionName, configuration);
        errors.push(...action.validateMultiLanguageFile(translationFile));
      }
    }

    if (configuration.files?.length) {
      const translationFiles = configuration.files.map((f) =>
        fileReader.readSingleLanguageFile(f.language, f.file),
      );
      for (const actionName of actions) {
        const action = ActionRegistry.createAction(actionName, configuration);
        errors.push(...action.validateSingleLanguageFiles(translationFiles));
      }
    }

    return errors;
  },

  async update(configuration: Configuration): Promise<void> {
    const log = new Logger(configuration);

    if (skip(configuration)) {
      log.info("Babeli is skipped.");
      return;
    }

    const modelProvider =
      process.env.BABELI_MODEL_PROVIDER ?? configuration.modelProvider;

    if (!modelProvider) {
      log.warn(
        "No model provider specified. Babeli requires a model provider to function. Please specify a model provider using 'modelProvider' in the configuration or specify it as environment variable BABELI_MODEL_PROVIDER. Skipping execution.",
      );
      return;
    }

    const fileReader = FileReaderRegistry.getFileReader(configuration);
    const fileWriter = FileWriterRegistry.getFileWriter(configuration);
    const actions = getActions(configuration);

    if (configuration.file) {
      let translationFile = fileReader.readMultiLanguageFile(
        configuration.file,
      );
      for (const actionName of actions) {
        const action = ActionRegistry.createAction(actionName, configuration);
        translationFile = await action.updateMultiLanguageFile(translationFile);
      }
      fileWriter.writeMultiLanguageFile(translationFile);
    }

    if (configuration.files?.length) {
      let translationFiles = configuration.files.map((f) =>
        fileReader.readSingleLanguageFile(f.language, f.file),
      );
      for (const actionName of actions) {
        const action = ActionRegistry.createAction(actionName, configuration);
        translationFiles =
          await action.updateSingleLanguageFiles(translationFiles);
      }
      for (const tf of translationFiles) {
        fileWriter.writeSingleLanguageFile(tf);
      }
    }
  },
};
