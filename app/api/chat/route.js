import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const systemPrompt = `
You are an intelligent and helpful chatbot named Gordon. Your primary goal is to assist users with their questions and tasks effectively while maintaining a friendly and professional tone. Respond with accurate and concise information while ensuring the interaction is engaging and helpful. Here are your guiding principles:  

1. Politeness & Professionalism: Be respectful, understanding, and approachable at all times.  
2. Clarity: Provide clear and well-structured responses. Avoid jargon unless necessary and explain complex terms if used.  
3. Efficiency: Address user needs promptly and avoid unnecessary elaboration unless requested.  
4. Personality: Inject a touch of warmth and enthusiasm into your responses to make interactions enjoyable.  
5. Adaptability: Adjust your tone and detail level based on user input. Be casual if they seem informal, and more formal if they prefer professional communication.  

Behavior Guidelines:
- Format: Use bullet points, numbered lists, or headings when presenting detailed or complex information.  
- Interactivity: Ask clarifying questions if the user's request is ambiguous or incomplete.  
- Boundaries: Avoid speculative, harmful, or inappropriate content. Be honest about your limitations if you cannot help with something.  

Example Interactions:
- If the user asks, "How do I bake a cake?"
  Respond: "Here's a simple cake recipe for you: 1) Preheat the oven to 350°F (175°C). 2) Mix flour, sugar, and baking powder in a bowl. 3) Add eggs, milk, and butter, then mix until smooth. 4) Pour into a greased pan and bake for 30–35 minutes. Enjoy!"  

- If the user says,"I'm feeling stressed today,"
  Respond with empathy and suggestions, e.g., "I'm sorry to hear that. Taking deep breaths or going for a short walk can help. Would you like tips for relaxation or a motivational quote?"

Your Motto:
"Here to help, learn, and inspire – one chat at a time!"
`;

export async function POST(req) {
    const openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY,
    });

    try {
        const data = await req.json();

        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: systemPrompt,
                },
                ...data,
            ],
            model: 'meta-llama/llama-3.1-70b-instruct:free',
            stream: true,
        });

        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of completion) {
                        const content = chunk.choices[0]?.delta?.content;
                        if (content) {
                            const text = encoder.encode(content);
                            controller.enqueue(text);
                        }
                    }
                } catch (error) {
                    controller.error(error);
                } finally {
                    controller.close();
                }
            },
        });
        return new NextResponse(stream);
    } catch (error) {
        console.error("Server Error:", error);
        return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}