import { useRef, useCallback, useEffect } from "react";
import { removeTagsFromString } from "@oute/oute-ds.core.constants";
import { promptServices } from "../../services";

export function usePreviousAiQuestions({
  questionTitle,
  questionDescription,
  isLoading,
  onLoadToggle,
  onRewrite,
  type,
}: {
  questionTitle: string;
  questionDescription: string;
  isLoading: boolean;
  onLoadToggle: (status: boolean) => void;
  onRewrite: (newTitle: string) => void;
  type: "title" | "description";
}) {
  const previousQuestionsRef = useRef<string[]>([]);

  const addQuestion = useCallback((newContent: string) => {
    previousQuestionsRef.current = [
      ...previousQuestionsRef.current.slice(-2),
      newContent,
    ];
  }, []);

  const getPrompt = useCallback(
    (content: string, type: "title" | "description") => {
      let contextSection = "";
      if (previousQuestionsRef.current.length > 0) {
        contextSection = `\nPrevious AI-Generated ${type}s:\n${previousQuestionsRef.current
          .map((q, i) => `  ${i + 1}. ${q}`)
          .join("\n")}`;
      }

      return (
        `You are an AI assistant that rewrites ${type}s.\n` +
        `Your task is to rewrite the provided ${type} to make it more clear and concise, while preserving its original meaning.\n` +
        `${contextSection}\n` +
        `Original ${type.charAt(0).toUpperCase() + type.slice(1)}: ${content}\n` +
        `Tone: Neutral\n\n` +
        `Important Instructions:\n` +
        `- Only return the rewritten ${type}.\n` +
        `- Do NOT include any explanations, prefixes like "Revised ${type.charAt(0).toUpperCase() + type.slice(1)}:", or additional formatting.\n` +
        `- Your output should be a plain sentence with no extra characters.\n\n` +
        `Now rewrite the ${type}:`
      );
    },
    []
  );

  const onAiGeneration = useCallback(async () => {
    const contentToRewrite =
      type === "title" ? questionTitle : questionDescription;
    if (!contentToRewrite || isLoading) return;
    onLoadToggle(true);

    if (
      contentToRewrite !==
      previousQuestionsRef.current[previousQuestionsRef.current.length - 1]
    ) {
      previousQuestionsRef.current = [];
    }

    try {
      const contentWithoutTags = removeTagsFromString(contentToRewrite);
      const prompt = getPrompt(contentWithoutTags, type);
      const response = await promptServices.prompt(prompt);
      if (response?.status === "success") {
        const choices = response?.result?.data?.choices;
        const content = choices[0]?.message?.content;
        const cleaned = content.replace(/^"|"$/g, "");
        const startsWithPTag = /^<p(\s|>)/i.test(cleaned.trim());
        const finalContent = startsWithPTag ? cleaned : `<p>${cleaned}</p>`;
        onRewrite(finalContent);
        addQuestion(finalContent);
      }
    } catch (error) {
    } finally {
      onLoadToggle(false);
    }
  }, [
    isLoading,
    onLoadToggle,
    questionTitle,
    questionDescription,
    onRewrite,
    addQuestion,
    getPrompt,
    type,
  ]);

  return {
    onAiGeneration,
  };
}
