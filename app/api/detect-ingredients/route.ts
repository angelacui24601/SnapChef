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
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image and identify all the food ingredients you can see. Return ONLY a valid JSON array of ingredient names as strings. Do not include any other text, explanations, or formatting. Example: [\"chicken breast\", \"carrots\", \"onions\"]. If you can't identify any ingredients, return an empty array []."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${image.type};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 300
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response
    let ingredients: string[];
    try {
      // First try to parse as JSON
      ingredients = JSON.parse(response);
      if (!Array.isArray(ingredients)) {
        throw new Error("Response is not an array");
      }
    } catch (parseError) {
      console.warn("Failed to parse JSON response, trying fallback parsing:", response);

      // Fallback: try to extract ingredients from various text formats
      let cleanedResponse = response.trim();

      // Remove markdown code blocks if present
      cleanedResponse = cleanedResponse.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');

      // Try parsing again after cleaning
      try {
        ingredients = JSON.parse(cleanedResponse);
        if (!Array.isArray(ingredients)) {
          throw new Error("Cleaned response is not an array");
        }
      } catch (secondParseError) {
        // Final fallback: extract from text
        const lines = cleanedResponse.split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .map(line => {
            // Remove common list markers and quotes
            return line
              .replace(/^[•\-*]\s*/, '') // Remove bullet points
              .replace(/^["']|["']$/g, '') // Remove surrounding quotes
              .replace(/^,\s*/, '') // Remove leading commas
              .trim();
          })
          .filter(line => line.length > 0 && !line.match(/^\d+\.$/)); // Remove empty lines and numbered markers

        ingredients = lines;
      }
    }

    // Validate and clean the ingredients
    ingredients = ingredients
      .filter(ing => typeof ing === 'string' && ing.trim().length > 0)
      .map(ing => ing.trim().toLowerCase())
      .filter((ing, index, arr) => arr.indexOf(ing) === index); // Remove duplicates

    console.log("Parsed ingredients:", ingredients);

    return NextResponse.json({ ingredients });

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