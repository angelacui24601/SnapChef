import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  console.log("[detect-ingredients] OPENAI_API_KEY present:", Boolean(apiKey), "env:", process.env.VERCEL_ENV ?? "local");
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  return new OpenAI({ apiKey });
}

export async function POST(req: Request) {
  try {
    const client = getOpenAIClient();
    const formData = await req.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          // System message: establishes vision-specialist identity and output contract.
          // Placing the JSON schema requirement here prevents the model from adding
          // prose or markdown around the response.
          role: "system",
          content:
            "You are a strict food-safety and culinary expert. " +
            "Your only job is to identify raw or processed FOOD INGREDIENTS that are safe to eat and cook with. " +
            "\n\nINCLUDE: actual edible ingredients (vegetables, fruits, meat, dairy, grains, spices, oils, sauces, eggs, etc.). " +
            "\n\nEXCLUDE — never include these even if visible in the image: " +
            "kitchen tools or utensils (knives, pans, cutting boards, appliances), " +
            "packaging, containers, plates, or bowls, " +
            "non-food objects (hands, countertops, labels, backgrounds), " +
            "substances that are not safe or intended for human consumption. " +
            "\n\nIf the image contains no identifiable edible ingredients, set \"ingredients\" to an empty array " +
            "and set \"warning\" to a short human-readable message explaining why (e.g. \"No food ingredients detected. The image appears to show kitchen equipment.\"). " +
            "If food is found, omit the \"warning\" key entirely. " +
            "\n\nAlways respond with a single valid JSON object: " +
            "{\"ingredients\": [\"ingredient1\", \"ingredient2\"]} or {\"ingredients\": [], \"warning\": \"...\"}. " +
            "Use lowercase singular nouns (e.g. \"chicken breast\", \"carrot\", \"olive oil\"). " +
            "Never include explanations, markdown, or any text outside the JSON object.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Identify all food ingredients visible in this image.",
            },
            {
              type: "image_url",
              image_url: { url: `data:${image.type};base64,${base64Image}` },
            },
          ],
        },
      ],
      // Low temperature for a deterministic, factual visual recognition task.
      temperature: 0.2,
      max_tokens: 400,
      // Enforces valid JSON output at the API level — eliminates the need
      // for the multi-stage fallback parsing cascade.
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error("No response from AI");
    }

    // response_format: json_object guarantees valid JSON; extract and sanitize.
    const parsed = JSON.parse(response) as { ingredients?: unknown; warning?: unknown };
    const rawList = Array.isArray(parsed.ingredients) ? parsed.ingredients : [];
    const ingredients: string[] = rawList
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      .map((item) => item.trim().toLowerCase())
      .filter((item, index, arr) => arr.indexOf(item) === index); // deduplicate

    // Surface a warning when the model found no edible ingredients
    // (e.g. irrelevant photo, kitchen equipment, non-food image).
    const warning = typeof parsed.warning === "string" && parsed.warning.trim().length > 0
      ? parsed.warning.trim()
      : undefined;

    return NextResponse.json({ ingredients, ...(warning ? { warning } : {}) });

  } catch (error) {
    console.error("Error detecting ingredients:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to detect ingredients",
      },
      { status: 500 }
    );
  }
}