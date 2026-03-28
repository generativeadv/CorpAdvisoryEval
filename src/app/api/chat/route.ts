import { anthropic } from "@ai-sdk/anthropic";
import { streamText, createUIMessageStreamResponse } from "ai";
import { getAllFirmsWithEvaluations } from "@/lib/queries";
import { buildChatSystemPrompt } from "../../../../scripts/prompts/chat-system";

export const maxDuration = 120;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const firmsData = await getAllFirmsWithEvaluations();
  const systemPrompt = buildChatSystemPrompt(firmsData);

  const result = streamText({
    model: anthropic("claude-opus-4-20250514"),
    system: systemPrompt,
    messages,
  });

  return createUIMessageStreamResponse({
    stream: result.toUIMessageStream(),
  });
}
