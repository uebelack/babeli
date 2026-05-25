import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import type { Configuration } from "../Configuration";
import { ChatModelFactory } from "../ai/ChatModelFactory";
import type { Translations } from "../model/Translations";
import { jaroWinklerSimilarity } from "../util/JaroWinklerSimilarity";

export class TranslationService {
  private readonly configuration: Configuration;
  private readonly translations: Translations;

  constructor(configuration: Configuration, translations: Translations) {
    this.configuration = configuration;
    this.translations = translations;
  }

  private findSimilarTranslations(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): Map<string, string> {
    const candidates = this.translations
      .getTranslationsForLanguage(sourceLanguage)
      .map((t) => t.value)
      .sort(
        (a, b) =>
          jaroWinklerSimilarity(text, b) - jaroWinklerSimilarity(text, a),
      )
      .slice(0, 26);

    const result = new Map<string, string>();
    for (const candidate of candidates) {
      const translation = this.translations.getTranslationForValue(
        candidate,
        sourceLanguage,
        targetLanguage,
      );
      if (translation !== undefined) {
        result.set(candidate, translation);
      }
    }

    return result;
  }

  async translate(
    value: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<string> {
    const existingTranslation = this.translations.getTranslationForValue(
      value,
      sourceLanguage,
      targetLanguage,
    );

    if (existingTranslation !== undefined) {
      return existingTranslation;
    }

    const similarTranslations = this.findSimilarTranslations(
      value,
      sourceLanguage,
      targetLanguage,
    );

    let similarTranslationsString = "";
    if (similarTranslations.size > 0) {
      const entries = [...similarTranslations.entries()]
        .map(([key, val]) => `- ${key} -> ${val}`)
        .join("\n");
      similarTranslationsString =
        "\nHere are some other translations as a reference, please try to reuse the terms of this translations if any match the text to be translated." +
        entries +
        "\n";
    }

    const systemMessageContent = `You are a professional translation assistant. Your task is to translate text from ${sourceLanguage} to ${targetLanguage}.
${similarTranslationsString}
Guidelines:
- Produce accurate, natural-sounding translations that a native speaker would write
- Preserve the tone, register, and style of the original (formal, casual, technical, literary, etc.)
- Maintain the original formatting, including line breaks, lists, and punctuation
- Keep proper nouns, brand names, and technical terms in their original form unless a well-established translation exists
- For idioms and culturally specific expressions, use the closest natural equivalent in the target language rather than a literal translation
- When a term is ambiguous, choose the meaning that best fits the surrounding context
- Do not add explanations, commentary, or notes unless explicitly asked
- Do not translate code blocks, URLs, email addresses, or file paths
- If the input contains placeholders (e.g., {variable}, %s, \${name}), preserve them exactly

Output only the best translation, never multiple alternatives.
Do not include the original text in the output.
Output only the translated text, nothing else.`;

    const chatModel = await ChatModelFactory.createChatModel(this.configuration);
    const response = await chatModel.invoke([
      new SystemMessage(systemMessageContent),
      new HumanMessage(value),
    ]);

    return typeof response.content === "string"
      ? response.content
      : response.content
          .filter((block) => block.type === "text")
          .map((block) => ("text" in block ? block.text : ""))
          .join("");
  }
}
