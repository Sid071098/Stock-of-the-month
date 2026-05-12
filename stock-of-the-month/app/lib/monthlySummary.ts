import type { MonthlyPick } from "./picks";

export async function getMonthlyPickSummary(pick: MonthlyPick): Promise<string[]> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return pick.summaryBullets;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You summarize equity research for a SaaS dashboard. Return compact JSON only with key bullets, an array of 3-4 short punchy strings. Vary the wording naturally between requests. Do not provide personalized financial advice."
          },
          {
            role: "user",
            content: `Summarize this ${pick.ticker} detailed analysis into 3-4 dashboard bullets, max 16 words each: ${pick.detailedAnalysis}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.65
      })
    });

    if (!response.ok) {
      return pick.summaryBullets;
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      return pick.summaryBullets;
    }

    const parsed = JSON.parse(content) as { bullets?: unknown };
    if (!Array.isArray(parsed.bullets)) {
      return pick.summaryBullets;
    }

    const bullets = parsed.bullets.filter((item): item is string => typeof item === "string").slice(0, 4);
    return bullets.length > 0 ? bullets : pick.summaryBullets;
  } catch {
    return pick.summaryBullets;
  }
}
