import { NextRequest, NextResponse } from 'next/server';
import { getAgentConfig, getFallbackModel, OPENROUTER_BASE_URL, AgentType } from '@/lib/ai/agents';

export async function POST(req: NextRequest) {
    try {
        const { messages, agentType = 'chat' } = await req.json();
        const config = getAgentConfig(agentType as AgentType);

        const systemMessage = { role: 'system', content: config.systemPrompt };
        const allMessages = [systemMessage, ...messages];

        let response = await callOpenRouter(config.model, allMessages, config.temperature);

        if (!response.ok) {
            console.warn(`Primary model ${config.model} failed, trying fallback...`);
            response = await callOpenRouter(getFallbackModel(), allMessages, config.temperature);
        }

        if (!response.ok) {
            const error = await response.text();
            return NextResponse.json({ error: 'AI service unavailable', details: error }, { status: 502 });
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || 'No response generated.';

        return NextResponse.json({ content, model: data.model });
    } catch (error: unknown) {
        console.error('AI chat error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

async function callOpenRouter(model: string, messages: Array<{ role: string; content: string }>, temperature: number) {
    return fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://fintech-os.app',
            'X-Title': 'Fintech OS',
        },
        body: JSON.stringify({
            model,
            messages,
            temperature,
            max_tokens: 2048,
        }),
    });
}
