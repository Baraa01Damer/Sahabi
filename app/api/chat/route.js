import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const systemPrompt = `You are Sahabi, a helpful and knowledgeable AI assistant. You aim to provide accurate, clear, and concise responses while maintaining a friendly and professional tone. You should:

1. Answer questions directly and truthfully
2. Admit when you don't know something
3. Ask for clarification when needed
4. Maintain a consistent persona across conversations
5. Be respectful and courteous at all times
6. If someone greets you with "walaikum assalam" or similar, respond as a fellow Muslim with appropriate Islamic greetings and maintain that cultural context throughout the conversation.
7. When analyzing images, describe what you see in detail and provide relevant insights.

If you're asked to perform tasks that could be harmful or unethical, politely decline and explain why.`;

export async function POST(req) {
    if (!process.env.OPENAI_API_KEY) {
        console.error('OpenAI API key is missing');
        return new NextResponse(JSON.stringify({ error: 'OpenAI API key is not configured' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });

    try {
        const contentType = req.headers.get('content-type') || '';
        if (contentType.includes('multipart/form-data')) {
            console.log('Processing image upload...');
            const formData = await req.formData();
            const images = formData.getAll('images');

            if (!images || images.length === 0) {
                console.error('No images found in request');
                return new NextResponse(JSON.stringify({ error: 'No images provided' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            console.log(`Processing ${images.length} images`);

            // Convert images to base64
            const imageContents = await Promise.all(
                images.map(async (image, index) => {
                    try {
                        const bytes = await image.arrayBuffer();
                        const buffer = Buffer.from(bytes);
                        const base64 = buffer.toString('base64');
                        console.log(`Successfully processed image ${index + 1}`);
                        return base64;
                    } catch (error) {
                        console.error(`Error processing image ${index + 1}:`, error);
                        throw new Error(`Failed to process image ${index + 1}`);
                    }
                })
            );

            const messages = [
                {
                    role: 'system',
                    content: systemPrompt,
                },
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Please analyze these images and describe what you see.' },
                        ...imageContents.map(content => ({
                            type: 'image_url',
                            image_url: {
                                url: `data:image/jpeg;base64,${content}`,
                                detail: 'low'
                            }
                        }))
                    ]
                }
            ];

            console.log('Sending request to OpenAI...');
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages,
                max_tokens: 500,
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
                    } catch (err) {
                        console.error('Error in stream processing:', err);
                        controller.error(err);
                    } finally {
                        controller.close();
                    }
                }
            });

            return new NextResponse(stream);
        } else {
            // Handle regular text messages
            const data = await req.json();
            const completion = await openai.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt,
                    },
                    ...data,
                ],
                model: 'gpt-4',
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
                    } catch (err) {
                        console.error('Error in stream processing:', err);
                        controller.error(err);
                    } finally {
                        controller.close();
                    }
                }
            });

            return new NextResponse(stream);
        }
    } catch (error) {
        console.error('Error in chat API:', error);
        return new NextResponse(JSON.stringify({
            error: 'Internal server error',
            details: error.message
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}