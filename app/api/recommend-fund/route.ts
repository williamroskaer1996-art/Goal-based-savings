import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { TRIODOS_FUNDS, recommendFundByKeyword } from '@/lib/funds';

const MODEL = 'claude-opus-4-5';

export async function POST(req: NextRequest) {
  const { goalName, purpose, timeHorizonMonths, amount } = (await req.json()) as {
    goalName: string;
    purpose?: string;
    timeHorizonMonths: number;
    amount?: number;
  };

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // ── Fallback: no API key → keyword matching ───────────────────────────────
  if (!apiKey) {
    const fund = recommendFundByKeyword(goalName, purpose ?? '', timeHorizonMonths);
    const years = (timeHorizonMonths / 12).toFixed(0);
    return NextResponse.json({
      fund,
      reason: `Given your ${years}-year horizon and goal to "${goalName}", ${fund.name} is a strong match. It focuses on ${fund.focus.toLowerCase()} and suits your timeline well.`,
    });
  }

  // ── AI recommendation via Claude ──────────────────────────────────────────
  try {
    const client = new Anthropic({ apiKey });

    const fundsContext = TRIODOS_FUNDS.map(f =>
      `id: ${f.id} | ${f.name} | Focus: ${f.focus} | Risk: ${f.risk} | Min horizon: ${f.minHorizonYears}y | ${f.description}`,
    ).join('\n');

    const timeHorizonYears = (timeHorizonMonths / 12).toFixed(1);

    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: `You are a Triodos Bank investment advisor. Recommend the single best fund for this customer.

Customer goal: "${goalName}"
Purpose: "${purpose || 'not specified'}"
Time horizon: ${timeHorizonYears} years (${timeHorizonMonths} months)
Target amount: ${amount ? `€${amount}` : 'not specified'}

Available funds (17 total):
${fundsContext}

Rules:
1. Only recommend funds where minHorizonYears ≤ ${timeHorizonYears}
2. Match the fund's focus theme to the goal topic
3. Longer horizons (10y+) can accept higher risk; 5-7y prefer medium risk
4. Write the reason in second person ("Your goal…"), warm and specific to this customer's goal name and purpose

Respond in JSON only — no explanation outside JSON:
{"fundId":"<id>","reason":"<2 sentences max, second person, specific to this goal>"}`,
        },
      ],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const match = text.match(/\{[\s\S]*?\}/);
    if (!match) throw new Error('No JSON in AI response');

    const { fundId, reason } = JSON.parse(match[0]) as { fundId: string; reason: string };
    const fund = TRIODOS_FUNDS.find(f => f.id === fundId);
    if (!fund) throw new Error(`Unknown fund id: ${fundId}`);

    return NextResponse.json({ fund, reason });
  } catch (err) {
    console.error('[recommend-fund] AI call failed, using keyword fallback:', err);
    const fund = recommendFundByKeyword(goalName, purpose ?? '', timeHorizonMonths);
    const years = (timeHorizonMonths / 12).toFixed(0);
    return NextResponse.json({
      fund,
      reason: `Given your ${years}-year horizon and goal to "${goalName}", ${fund.name} is well aligned with your interests and time horizon.`,
    });
  }
}
