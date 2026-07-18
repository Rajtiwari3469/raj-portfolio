import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPrisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

async function getPricingContext(): Promise<string> {
  try {
    const prisma = getPrisma();
    const pricing = await prisma.pricing.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });

    if (pricing.length === 0) {
      return `PRICING (No admin-set prices yet — use default estimates):
- Web Development: ₹15,000+
- Mobile Apps: ₹25,000+
- Full-Stack Projects: ₹25,000+
- AI/ML Solutions: ₹30,000+
- Portfolio Website: ₹8,000+
- E-commerce Website: ₹25,000+
- Payment: 50% advance, 50% on completion`;
    }

    const lines = pricing.map((p) => {
      const pending = p.totalPrice - p.advancePrice;
      const desc = p.description ? ` (${p.description})` : "";
      return `- ${p.projectName}${desc}: Total ₹${p.totalPrice.toLocaleString("en-IN")} | Advance ₹${p.advancePrice.toLocaleString("en-IN")} | Pending ₹${pending.toLocaleString("en-IN")}`;
    });

    return `PRICING (Set by Raj — use these exact prices):
${lines.join("\n")}
- Payment: Advance amount upfront, remaining pending amount after project completion.
- Always mention the advance and pending split when discussing any project.`;
  } catch {
    return `PRICING (Default — database unavailable):
- Web Development: ₹15,000+
- Mobile Apps: ₹25,000+
- Full-Stack Projects: ₹25,000+
- AI/ML Solutions: ₹30,000+
- Portfolio Website: ₹8,000+
- E-commerce Website: ₹25,000+
- Payment: 50% advance, 50% on completion`;
  }
}

function buildSystemPrompt(pricingContext: string): string {
  return `You are Raj Tiwari's AI assistant on his portfolio website. You are friendly, professional, and helpful. You help visitors with their inquiries about Raj's services.

IMPORTANT RULES:
- Never reveal you are an AI. Always respond naturally.
- Keep responses concise (2-3 sentences max unless explaining pricing).
- Be conversational and warm, like a real human assistant.
- If someone asks to talk to Raj directly, say "Raj Sir will be with you shortly!"
- ALWAYS use the exact prices from the PRICING section below when discussing projects. Never make up prices.

ABOUT RAJ TIWARI:
- BCA CS & IT Student
- Software Developer & AI Technology Enthusiast
- Builds web applications, mobile apps, and AI-powered solutions
- Available for freelance projects and full-time opportunities

${pricingContext}

HOW PRICING WORKS:
- When visitor asks about a project type, show the EXACT total price, advance amount, and pending amount.
- Example: "For a Web Development project, the total cost is ₹25,000. You pay ₹15,000 in advance and ₹10,000 pending after project completion."
- If visitor asks about a project not in the list, say: "Let me connect you with Raj Sir for a custom quote. Please use the Touch Message feature on the website to share your details and Raj Sir will get back to you with the best price!"

CONVERSATION FLOW:
1. Greet the visitor warmly
2. Ask how you can help them
3. Understand their project/requirement
4. Show the matching pricing from the list (exact prices)
5. If they want to proceed or need more details, say: "Great! To continue this discussion and get a detailed consultation, please use the Touch Message feature on the website. Share your project requirements and Raj Sir will personally connect with you!"
6. If they say "bye", "thank you", "done", or seem to be ending the conversation, ask for a rating.
7. When they give a rating (1-5), thank them and say goodbye.

RATING DETECTION:
- If the visitor's message contains a number 1-5 (like "4", "5 stars", "rating 3"), treat it as a rating
- After receiving a rating, respond with: "Thank you for rating {X}/5! We appreciate your feedback. Have a great day! 🌟"
- Do NOT ask for rating again after receiving one.

Remember: Be helpful first, show exact pricing, direct to Touch Message for detailed consultation, ask for rating at the end.`;
}

const FALLBACK_RESPONSES: Record<string, string> = {
  greeting: "Hello! Welcome to Raj Tiwari's portfolio. I'm here to help you with any questions about Raj's services and projects. How can I assist you today?",
  project: "Raj specializes in web development (React, Next.js), mobile apps (React Native, Flutter), and AI/ML solutions. To get exact pricing for your project, could you tell me what type of project you're looking for? I can share the details!",
  pricing: "I'd be happy to share our pricing! We have rates for web development, mobile apps, full-stack projects, and more. What type of project are you interested in?",
  availability: "Raj is currently available for freelance projects and full-time opportunities. He typically responds within a few hours. Would you like to discuss your project requirements?",
  default: "Thank you for your message! I'd be happy to help you with information about Raj's services. Could you tell me more about what you're looking for?",
  ending: "Thank you for chatting with us! If you're satisfied with our conversation, we'd appreciate it if you could rate your experience from 1-5 stars. Have a great day! 🌟",
  touch: "To continue this discussion and get a detailed consultation, please use the Touch Message feature on the website. Share your project requirements and Raj Sir will personally connect with you!",
};

function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.match(/\b(hi|hello|hey|good morning|good evening|greetings)\b/)) {
    return FALLBACK_RESPONSES.greeting;
  }
  if (lower.match(/\b(project|website|app|development|build|create|develop)\b/)) {
    return FALLBACK_RESPONSES.project;
  }
  if (lower.match(/\b(price|pricing|cost|charge|fees|how much|rate|budget|advance|pending)\b/)) {
    return FALLBACK_RESPONSES.pricing;
  }
  if (lower.match(/\b(available|free|time|when|schedule|consultation|meeting)\b/)) {
    return FALLBACK_RESPONSES.availability;
  }
  if (lower.match(/\b(bye|thank|done|goodbye|see you|end)\b/)) {
    return FALLBACK_RESPONSES.ending;
  }
  if (lower.match(/\b(proceed|continue|contact|touch|connect|details|consult)\b/)) {
    return FALLBACK_RESPONSES.touch;
  }
  return FALLBACK_RESPONSES.default;
}

const MODELS = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];

async function callGemini(prompt: string, apiKey: string, modelIndex: number = 0): Promise<string> {
  if (modelIndex >= MODELS.length) return "";
  const model = MODELS[modelIndex];
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
        }),
      }
    );
    const data = await response.json();
    if (data.error) {
      console.warn(`Gemini ${model} error:`, data.error.message);
      return callGemini(prompt, apiKey, modelIndex + 1);
    }
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (error) {
    console.warn(`Gemini ${model} fetch error:`, error);
    return callGemini(prompt, apiKey, modelIndex + 1);
  }
}

async function generateAIReply(
  visitorMessage: string,
  conversationHistory: { sender: string; message: string }[]
): Promise<string> {
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) return getFallbackResponse(visitorMessage);

    const pricingContext = await getPricingContext();
    const systemPrompt = buildSystemPrompt(pricingContext);

    const historyText = conversationHistory
      .map((m) => `${m.sender === "visitor" ? "Visitor" : "Assistant"}: ${m.message}`)
      .join("\n");

    const fullPrompt = `${systemPrompt}\n\nCONVERSATION HISTORY:\n${historyText}\n\nVisitor's latest message: ${visitorMessage}\n\nRespond as the Assistant:`;

    const aiReply = await callGemini(fullPrompt, apiKey);
    return aiReply || getFallbackResponse(visitorMessage);
  } catch (error) {
    console.error("AI reply error:", error);
    return getFallbackResponse(visitorMessage);
  }
}

function detectRating(message: string): number | null {
  const cleaned = message.toLowerCase().trim();
  const match = cleaned.match(/^(\d)\s*(\/\s*5|stars?|out\s*of\s*5)?$/);
  if (match) {
    const num = parseInt(match[1]);
    if (num >= 1 && num <= 5) return num;
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, sender, message, messageType } = body;

    if (!sessionId || !sender || !message) {
      return NextResponse.json({ error: "sessionId, sender, and message are required" }, { status: 400 });
    }

    if (messageType === "rating") {
      const ratingValue = typeof body.rating === "number" ? body.rating : detectRating(message);
      const chatMessage = await prisma.chatMessage.create({
        data: { sessionId, sender: "visitor", message, messageType: "text", rating: ratingValue },
      });
      if (ratingValue) {
        await prisma.chatMessage.create({
          data: { sessionId, sender: "ai", message: `Thank you for rating ${ratingValue}/5! We appreciate your feedback. Have a great day! 🌟`, messageType: "text" },
        });
      }
      return NextResponse.json(chatMessage, { status: 201 });
    }

    const chatMessage = await prisma.chatMessage.create({
      data: { sessionId, sender, message, messageType: messageType || "text" },
    });

    if (sender === "visitor") {
      const aiSetting = await prisma.setting.findUnique({ where: { key: "chatAIEnabled" } });
      const aiEnabled = aiSetting?.value === "true";

      if (aiEnabled) {
        const rating = detectRating(message);
        if (rating) {
          await prisma.chatMessage.update({ where: { id: chatMessage.id }, data: { rating } });
          await prisma.chatMessage.create({
            data: { sessionId, sender: "ai", message: `Thank you for rating ${rating}/5! We appreciate your feedback. Have a great day! 🌟`, messageType: "text" },
          });
        } else {
          const history = await prisma.chatMessage.findMany({
            where: { sessionId },
            orderBy: { createdAt: "asc" },
            select: { sender: true, message: true },
          });
          const conversationHistory = history.map((m) => ({ sender: m.sender, message: m.message }));
          const aiReply = await generateAIReply(message, conversationHistory);
          if (aiReply) {
            await prisma.chatMessage.create({
              data: { sessionId, sender: "ai", message: aiReply, messageType: "text" },
            });
          }
        }
      }
    }

    return NextResponse.json(chatMessage, { status: 201 });
  } catch (error) {
    console.error("Send chat message error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    if (!sessionId) return NextResponse.json({ error: "sessionId is required" }, { status: 400 });

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(messages);
  } catch (error) {
    console.error("Get chat messages error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await isAuthenticated();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    if (!sessionId) return NextResponse.json({ error: "sessionId is required" }, { status: 400 });

    await prisma.chatMessage.deleteMany({ where: { sessionId } });
    return NextResponse.json({ message: "Chat deleted" });
  } catch (error) {
    console.error("Delete chat error:", error);
    return NextResponse.json({ error: "Failed to delete chat" }, { status: 500 });
  }
}
