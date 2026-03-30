import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { getAllFirmsWithEvaluations } from "@/lib/queries";
import { buildChatSystemPrompt } from "../../../../scripts/prompts/chat-system";

export const maxDuration = 120;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const firmsData = await getAllFirmsWithEvaluations();
  const systemPrompt = buildChatSystemPrompt(firmsData);

  // Convert UIMessage format to simple role/content for the model
  const formattedMessages = messages.map(
    (m: { role: string; content?: string; parts?: Array<{ type: string; text?: string }> }) => {
      if (m.content) return { role: m.role, content: m.content };
      // Extract text from parts (v6 UIMessage format)
      const text = m.parts
        ?.filter((p: { type: string; text?: string }) => p.type === "text")
        .map((p: { type: string; text?: string }) => p.text)
        .join("") || "";
      return { role: m.role, content: text };
    }
  );

  const result = streamText({
    model: anthropic("claude-opus-4-20250514"),
    system: systemPrompt,
    messages: formattedMessages,
  });

  return result.toTextStreamResponse();
}
