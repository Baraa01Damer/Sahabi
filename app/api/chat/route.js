import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const systemPrompt = `You are Sahabi, a helpful and knowledgeable AI assistant. You aim to provide accurate, clear, and concise responses while maintaining a friendly and professional tone. You should:

1. Answer questions directly and truthfully
2. Admit when you don't know something
3. Ask for clarification when needed
4. Maintain a consistent persona across conversations
5. Be respectful and courteous at all times

If you're asked to perform tasks that could be harmful or unethical, politely decline and explain why.`;

export async function POST(req) {
    const openai = new OpenAI();
    const data = await req.json();

    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: systemPrompt,
            },
            ...data,
        ],
        model: 'gpt-4o-mini',
        stream: true,
    });

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            try {
                for await (const chunk of completion) {
                    const content = chunk.choices[0].delta.content
                    if (content) {
                        const text = encoder.encode(content);
                        controller.enqueue(text);
                    }
                }
            } catch (err) {
                controller.error(err);
            } finally {
                controller.close();
            }
        }
    });

    return new NextResponse(stream);
}