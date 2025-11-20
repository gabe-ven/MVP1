import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { loadLoads } from "@/lib/storage";
import { formatLoadsSummary, getSystemPrompt } from "@/lib/chat";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/chat
 * Handles chat messages and returns AI responses with context from user's loads
 */
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Load user's loads for context
    const loads = await loadLoads(userEmail || undefined);
    const loadsSummary = formatLoadsSummary(loads);

    // Build conversation messages
    const messages: any[] = [
      {
        role: "system",
        content: `${getSystemPrompt()}\n\nCurrent user data:\n${loadsSummary}`,
      },
    ];

    // Add conversation history (last 10 messages to avoid token limits)
    const recentHistory = conversationHistory.slice(-10);
    recentHistory.forEach((msg: { role: string; content: string }) => {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    });

    // Add current user message
    messages.push({
      role: "user",
      content: message,
    });

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using gpt-4o-mini for better availability and lower cost
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiResponse = response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    return NextResponse.json({
      response: aiResponse,
    });
  } catch (error: any) {
    console.error("Error in chat API:", error);
    
    // Handle specific OpenAI API errors
    if (error.code === 'insufficient_quota' || error.status === 429) {
      return NextResponse.json(
        { 
          error: "OpenAI API quota exceeded. Please check your OpenAI account billing and add credits to continue using the chatbot.",
          code: "quota_exceeded"
        },
        { status: 429 }
      );
    }
    
    if (error.code === 'invalid_api_key') {
      return NextResponse.json(
        { 
          error: "Invalid OpenAI API key. Please check your .env.local file.",
          code: "invalid_api_key"
        },
        { status: 401 }
      );
    }
    
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
    });
    
    return NextResponse.json(
      { 
        error: error.message || "Failed to process chat message",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

