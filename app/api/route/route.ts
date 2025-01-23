import { NextResponse } from "next/server";
import { HfInference } from "@huggingface/inference";

const HUGGING_FACE_TOKEN = process.env.HUGGING_FACE_TOKEN;
const client = new HfInference(HUGGING_FACE_TOKEN);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { input } = body;

    if (!input) {
      return NextResponse.json({ error: "Input is required" }, { status: 400 });
    }

    let output = "";
    const stream = await client.chatCompletionStream({
      model: "codellama/CodeLlama-34b-Instruct-hf",
      messages: [
        {
          role: "system",
          content:
            "Your name is Notifai, you are very smart. you are Ethiopian ai assistant. Developed By Core 5 who are Arsema, Nahom, Nebyu, Lukman, Michael.",
        },
        {
          role: "user",
          content: input,
        },
      ],
      max_tokens: 500,
    });

    for await (const chunk of stream) {
      if (chunk.choices && chunk.choices.length > 0) {
        const newContent = chunk.choices[0].delta.content;
        output += newContent;
      }
    }

    return NextResponse.json({ result: output });
  } catch (error) {
    console.error("Inference error:", error);
    return NextResponse.json(
      { error: "Failed to process inference request" },
      { status: 500 }
    );
  }
}
