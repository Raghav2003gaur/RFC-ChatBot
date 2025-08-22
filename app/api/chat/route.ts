import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

function buildSystemPrompt(audience: string | null): string {
  const base =
    "You are the IETF AI Assistant. Answer questions about IETF, RFCs, drafts, and Working Groups. When discussing RFCs, cite RFC numbers explicitly and be precise. If unsure, say so and suggest where to look (datatracker.ietf.org, rfc-editor.org). Be concise and accurate."

  const byAudience: Record<string, string> = {
    policymaker:
      "Use plain language, emphasize governance, policy implications, and high-level outcomes.",
    technical:
      "Use technical language, include protocol details, status (Proposed/Internet Standard/BCP/etc.), and relevant obsoletes/updates.",
    newcomer:
      "Explain concepts simply, avoid jargon, provide helpful examples and learning paths.",
  }

  if (!audience) return base
  return `${base}\nAudience: ${audience}. ${byAudience[audience] ?? ""}`
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, audience } = (await req.json()) as {
      prompt?: string
      audience?: string | null
    }

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 })
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server is not configured with OPENROUTER_API_KEY" },
        { status: 500 },
      )
    }

    const model = process.env.OPENROUTER_MODEL || "openrouter/auto"
    const referer = process.env.OPENROUTER_SITE_URL || "http://localhost:3000"

    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": referer,
        "X-Title": "IETF AI Assistant",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: buildSystemPrompt(audience ?? null) },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 512,
      }),
    })

    if (!upstream.ok) {
      const text = await upstream.text()
      return NextResponse.json({ error: "OpenRouter error", detail: text }, { status: 502 })
    }

    const data = (await upstream.json()) as any
    const content: string = data?.choices?.[0]?.message?.content ?? ""

    return NextResponse.json({ content })
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected server error", detail: (error as Error)?.message },
      { status: 500 },
    )
  }
}


