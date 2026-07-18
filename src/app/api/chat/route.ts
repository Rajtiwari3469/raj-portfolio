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
      return `PRICING (Default estimates):
- Web Development (React, Next.js, Node.js): ₹15,000+
- Mobile App Development (React Native, Flutter): ₹25,000+
- Full-Stack Projects: ₹25,000+
- AI/ML Solutions: ₹30,000+
- Portfolio Website: ₹8,000+
- E-commerce Website: ₹25,000+
- Payment: 50% advance, 50% on completion`;
    }

    const lines = pricing.map((p) => {
      const pending = p.totalPrice - p.advancePrice;
      const desc = p.description ? ` (${p.description})` : "";
      return `- ${p.projectName}${desc}: ₹${p.totalPrice.toLocaleString("en-IN")} total | ₹${p.advancePrice.toLocaleString("en-IN")} advance | ₹${pending.toLocaleString("en-IN")} pending`;
    });

    return `ACTUAL PRICING (use these EXACT prices — never make up numbers):
${lines.join("\n")}
Always mention advance + pending split when discussing any project. If project type is not in the list, say you'll connect them with Sir for a custom quote.`;
  } catch {
    return `PRICING (Default):
- Web Development: ₹15,000+ | Mobile Apps: ₹25,000+ | Full-Stack: ₹25,000+
- AI/ML: ₹30,000+ | Portfolio: ₹8,000+ | E-commerce: ₹25,000+
- Payment: 50% advance, 50% on completion`;
  }
}

function buildSystemPrompt(pricingContext: string): string {
  return `You are a smart, friendly, and professional AI assistant working on Raj Tiwari's portfolio website. You are a REAL person-like assistant — NOT a robot, NOT a generic chatbot. You think before replying, understand context, and respond naturally.

## YOUR CORE BEHAVIOR

### 1. GREETINGS — Match their energy
When someone says hi/hello/hey:
- If they say "hi" → reply with "Hey! 👋" or "Hi there!" (short, matching energy)
- If they say "hello" → reply with "Hello! 😊" 
- If they say "hey" → reply with "Hey! What's up?"
- If they say "good morning" → reply with "Good morning! ☀️"
- ALWAYS follow up with a question like "How can I help you?" or "What brings you here?"
- NEVER say "Welcome to Raj Tiwari's portfolio" on every greeting — vary it

### 2. REPLY TO RANDOM/ANY MESSAGE — Read and understand
- Read the visitor's message carefully BEFORE replying
- Understand the INTENT behind their message, not just keywords
- If they say something random/funny → be playful, then redirect to how you can help
- If they say something confusing → ask for clarification politely
- If they send just emojis → respond with emojis and ask what they need
- If they ask a general question → answer it briefly, then ask about their project needs
- If they seem frustrated → be empathetic and helpful
- NEVER give robotic/template responses — every reply must feel unique
- If they ask "who are you" → "I'm Raj's personal assistant! I help with project inquiries, pricing, and everything related to Raj's work. What can I do for you? 😊"

### 3. ABOUT RAJ — Don't reveal details, redirect to Sir
When someone asks about Raj (who is Raj, tell me about Raj, Raj kaun hai, Raj details, etc.):
- NEVER give Raj's bio, education details, skills, or personal info
- ALWAYS say something like:
  - "Sir will connect with you soon! 😊 In the meantime, is there anything I can help you with regarding projects or services?"
  - "Sir will be in touch with you shortly! Is there something specific I can help you with right now?"
  - "Sir personally handles all client relationships and will connect with you soon! Meanwhile, feel free to ask me about our services and pricing. 🚀"
- Keep it brief and professional

### 4. PROJECT DEVELOPMENT & PRICING — Use EXACT admin prices
When someone asks about development, projects, services, or pricing:
- ALWAYS use the EXACT prices from the pricing list below
- Present prices naturally in conversation:
  - "For a web app, we're looking at ₹X total — ₹Y upfront and ₹Z on delivery."
  - "Our rates start from ₹X for [project type]. Want me to break it down?"
- If their project type matches a pricing item → show the EXACT price
- If their project type is NOT in the list → say: "That's a custom project! Sir will connect with you soon for a personalized quote. You can also send a Touch Message with your requirements! 📩"
- ALWAYS mention the advance + pending split
- Be confident about pricing — never say "I think" or "maybe around"

### 5. WHEN VISITOR WANTS TO PROCEED / CONTACT
- "Great! 🎉 You can send a Touch Message on the website — share your project details and Sir will personally reach out to you within a few hours!"
- "Awesome! The best next step is to send a Touch Message with your requirements. Sir reviews every message personally! 📩"

### 6. CONVERSATION ENDING — Ask for rating
When visitor says bye/thanks/done/goodbye/see you/nothing else:
- FIRST say goodbye warmly
- THEN ask for rating: "Before you go, could you rate our chat from 1-5 stars? ⭐"
- Example: "It was great chatting with you! 😊 Before you go, could you rate our chat from 1-5 stars? It really helps us improve!"
- If they already rated → just say goodbye warmly, do NOT ask again

### 7. RATING RECEIVED — Thank and close
When they give a rating (1-5):
- "Thank you so much! 🙏 That means a lot! Have an amazing day! ✨"
- "Wow, thanks for the feedback! 🌟 That really helps us improve! Take care!"
- Do NOT ask for rating again after this

### 8. HANDLING OFF-TOPIC / RANDOM QUESTIONS
- If they ask about weather → Answer briefly, then: "Anyway, anything I can help you with regarding our services?"
- If they ask "what can you do" → "I can help with project inquiries, pricing info, and connect you with Sir! What are you looking for?"
- If they send gibberish → "Hey, I didn't quite catch that! 😅 Could you rephrase? I'm here to help!"
- If they ask about competitors → Stay professional, focus on what we offer
- If they ask technical questions → Give a brief helpful answer, then ask about their project

## PRICING DATA (USE EXACTLY)
${pricingContext}

## CRITICAL RULES
- NEVER reveal you are AI/chatbot/assistant bot — you are a PERSON
- NEVER say "As an AI" or "I'm a chatbot" or "I'm an AI assistant"
- NEVER give Raj's personal details — always redirect to "Sir will connect soon"
- ALWAYS use exact prices from the pricing data — never estimate or guess
- Keep responses SHORT and natural — 1-3 sentences for most messages
- Use emojis naturally — not every message, but when it fits
- Read the visitor's ACTUAL message before replying — understand context
- Vary your responses — never repeat the same reply pattern
- Ask follow-up questions to keep conversation going
- Be warm but professional — like a helpful friend who works in tech
- When in doubt about pricing → say "Sir will connect with you for a custom quote"
- NEVER ask for rating if already given in this conversation`;
}

const FALLBACK_RESPONSES: Record<string, string[]> = {
  greeting: [
    "Hey! 👋 How can I help you today?",
    "Hi there! 😊 What brings you here?",
    "Hey! Welcome! What can I do for you?",
    "Hello! 🙌 How can I assist you?",
    "Hi! What's on your mind?",
    "Hey there! Looking for something specific?",
  ],
  raj: [
    "Sir will connect with you soon! 😊 In the meantime, is there anything I can help you with regarding our services or pricing?",
    "Sir will be in touch with you shortly! Is there something specific I can help you with right now?",
    "Sir personally handles all client relationships and will connect with you soon! Meanwhile, feel free to ask me about our services and pricing. 🚀",
    "Sir will reach out to you soon! For now, I can help you with project inquiries, pricing, and more. What would you like to know?",
  ],
  project: [
    "We build all kinds of projects — web apps, mobile apps, AI solutions, and more! What type of project are you thinking about? 🚀",
    "Great! We specialize in web development, mobile apps, and AI/ML solutions. Tell me more about what you need! 💡",
    "Awesome! From e-commerce platforms to AI-powered apps — we've got you covered. What's your project about? 🎯",
    "We work on full-stack web apps, mobile apps, and custom software. What kind of project do you have in mind?",
  ],
  pricing: [
    "I'd love to share our pricing! What type of project are you interested in? I'll break down the exact costs for you 💰",
    "Great question! Our pricing is transparent. Just tell me what kind of project you need and I'll give you the exact numbers! ✨",
    "Pricing depends on the project type. What are you looking to build? I'll share the exact rates! 💵",
  ],
  availability: [
    "Sir is available for freelance work! 🎉 He typically responds within a few hours. Want to discuss your project?",
    "Good news — Sir has openings right now! He's always excited to take on new challenges. What's your project about? 🚀",
    "Sir is available and ready to work! 💪 What kind of project are you looking to build?",
  ],
  contact: [
    "You can send a Touch Message on the website! Share your project details and Sir will personally reach out to you. 📩",
    "The best way to connect is through Touch Message — Sir reviews every message personally and gets back to you fast! 📩",
    "Send a Touch Message with your requirements — Sir will give you a detailed response within hours! 📩",
  ],
  ending: [
    "It was great chatting with you! 😊 Before you go, could you rate our chat from 1-5 stars? It really helps us improve!",
    "Glad I could help! Before you go — would you mind rating our conversation? Just pick 1-5 stars! ⭐ Have a wonderful day!",
    "Thanks for chatting! 🌟 A quick 1-5 star rating would really help us out! Have an amazing day ahead!",
    "Awesome chatting with you! 🎉 Before you go, could you rate our chat 1-5 stars? Take care! ✨",
  ],
  rating: [
    "Thank you so much! 🙏 That means a lot! Have an amazing day! ✨",
    "Wow, thanks! 🌟 That really helps us improve! Take care and good luck!",
    "You're awesome! 🎉 Thanks for the feedback — it motivates us to keep doing great work! Have a wonderful day! 🚀",
    "Thanks a ton! 🙌 Your feedback means the world to us! Have an incredible day ahead! 💫",
  ],
  thanks: [
    "You're welcome! 😊 Is there anything else I can help you with?",
    "Happy to help! 🙌 Anything else on your mind?",
    "Anytime! Let me know if you need anything else! 👍",
  ],
  confusion: [
    "Hmm, I want to make sure I understand you right — could you tell me a bit more? 😊",
    "I'd love to help! Can you give me a few more details about what you're looking for?",
    "Could you elaborate a little? The more details, the better I can assist! 💡",
  ],
  random: [
    "Haha, that's interesting! 😄 While I've got you — anything I can help you with regarding our services?",
    "Oh cool! 😊 By the way, are you looking for any development services? I can help with that!",
    "Interesting! 🤔 Is there anything specific I can help you with today?",
    "That's random! 😄 But hey, while I'm here — do you have any project needs I can help with?",
  ],
  default: [
    "That's interesting! Tell me more about what you're looking for — I'd love to help! 😊",
    "Hmm, I want to make sure I understand. Could you give me a bit more context? 💡",
    "Great question! Can you tell me more about your project needs? The more details, the better! 🎯",
    "I'd love to help with that! Could you elaborate a little? ✨",
  ],
};

function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase().trim();

  if (lower.match(/^(hi|hello|hey|yo|sup|hiya|howdy|hola|namaste|good\s*(morning|afternoon|evening)|greetings)$/)) {
    return FALLBACK_RESPONSES.greeting[Math.floor(Math.random() * FALLBACK_RESPONSES.greeting.length)];
  }

  if (lower.match(/\b(who.*(ra[jz]|sir)|tell.*about.*ra[jz]|ra[jz].*kaun|ra[jz].*info|ra[jz].*detail|ra[jz].*bio|ra[jz].*background|about.*ra[jz]|ra[jz].*about|know.*ra[jz]|ra[jz].*know)\b/)) {
    return FALLBACK_RESPONSES.raj[Math.floor(Math.random() * FALLBACK_RESPONSES.raj.length)];
  }

  if (lower.match(/\b(price|pricing|cost|charge|fees|how\s*much|rate|budget|advance|pending|expensive|cheap|affordable|tariff|quotation|quote)\b/)) {
    return FALLBACK_RESPONSES.pricing[Math.floor(Math.random() * FALLBACK_RESPONSES.pricing.length)];
  }

  if (lower.match(/\b(project|website|app|development|build|create|develop|mobile|web|software|saas|ecommerce|e-commerce|dashboard|blog|portfolio|ai|ml|chatbot|api|frontend|backend|full\s*stack)\b/)) {
    return FALLBACK_RESPONSES.project[Math.floor(Math.random() * FALLBACK_RESPONSES.project.length)];
  }

  if (lower.match(/\b(available|free|time|when|schedule|consultation|meeting|busy|start|start\s*working|hiring|hire|freelance)\b/)) {
    return FALLBACK_RESPONSES.availability[Math.floor(Math.random() * FALLBACK_RESPONSES.availability.length)];
  }

  if (lower.match(/\b(proceed|continue|contact|touch|connect|details|consult|talk|speak|reach|message|call|email)\b/)) {
    return FALLBACK_RESPONSES.contact[Math.floor(Math.random() * FALLBACK_RESPONSES.contact.length)];
  }

  if (lower.match(/\b(thank|thanks|thx|ty|appreciate)\b/)) {
    return FALLBACK_RESPONSES.thanks[Math.floor(Math.random() * FALLBACK_RESPONSES.thanks.length)];
  }

  if (lower.match(/\b(bye|goodbye|see\s*you|done|that'?s\s*all|nothing\s*else|end|quit|exit|later|gotta\s*go|have\s*to\s*go|talk\s*later)\b/)) {
    return FALLBACK_RESPONSES.ending[Math.floor(Math.random() * FALLBACK_RESPONSES.ending.length)];
  }

  if (lower.match(/\b(what\s*can\s*you\s*do|what\s*do\s*you\s*do|help|services|what\s*services|capabilities)\b/)) {
    return "I can help you with project inquiries, pricing info, and connect you with Sir! I can tell you about web development, mobile apps, AI solutions, and more. What are you looking for? 😊";
  }

  if (lower.match(/\b(who\s*are\s*you|what\s*are\s*you|your\s*name|introduce\s*yourself)\b/)) {
    return "I'm Raj's personal assistant! I help with project inquiries, pricing, and everything related to our services. What can I do for you? 😊";
  }

  if (lower.match(/\b(weather|joke|funny|laugh|entertain|music|movie|game|sport|cricket|football|score)\b/)) {
    return FALLBACK_RESPONSES.random[Math.floor(Math.random() * FALLBACK_RESPONSES.random.length)];
  }

  if (lower.match(/\b(good|great|nice|awesome|amazing|cool|wow|ok|okay|fine|alright|hmm|oh|ah|um)\b/) && lower.length < 15) {
    return "😊 That's great! Is there anything I can help you with regarding our services or projects?";
  }

  if (lower.match(/\?$/)) {
    return FALLBACK_RESPONSES.confusion[Math.floor(Math.random() * FALLBACK_RESPONSES.confusion.length)];
  }

  return FALLBACK_RESPONSES.default[Math.floor(Math.random() * FALLBACK_RESPONSES.default.length)];
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
          generationConfig: {
            maxOutputTokens: 400,
            temperature: 0.9,
            topP: 0.95,
            topK: 40,
          },
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
      .slice(-10)
      .map((m) => `${m.sender === "visitor" ? "Visitor" : "Assistant"}: ${m.message}`)
      .join("\n");

    const fullPrompt = `${systemPrompt}\n\nCONVERSATION HISTORY (for context — understand what has been discussed):\n${historyText}\n\nVisitor just said: "${visitorMessage}"\n\nRead the visitor's message carefully. Understand their intent. Reply naturally and smartly as a real human assistant would:`;

    const aiReply = await callGemini(fullPrompt, apiKey);
    if (aiReply) {
      const cleaned = aiReply.replace(/^(Assistant|Raj's Assistant|AI Assistant):\s*/i, "").trim();
      return cleaned;
    }
    return getFallbackResponse(visitorMessage);
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

function isEndingMessage(message: string): boolean {
  const lower = message.toLowerCase().trim();
  return /\b(bye|goodbye|see\s*you|done|that'?s\s*all|nothing\s*else|end|quit|exit|later|gotta\s*go|have\s*to\s*go|talk\s*later|good\s*night|gn|cya|ttyl|brb)\b/.test(lower);
}

async function hasRatingAlready(sessionId: string): Promise<boolean> {
  try {
    const rating = await prisma.chatMessage.findFirst({
      where: { sessionId, rating: { not: null } },
    });
    return rating !== null;
  } catch {
    return false;
  }
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
        const thankYou = FALLBACK_RESPONSES.rating[Math.floor(Math.random() * FALLBACK_RESPONSES.rating.length)];
        await prisma.chatMessage.create({
          data: { sessionId, sender: "ai", message: thankYou, messageType: "text" },
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
          const thankYou = FALLBACK_RESPONSES.rating[Math.floor(Math.random() * FALLBACK_RESPONSES.rating.length)];
          await prisma.chatMessage.create({
            data: { sessionId, sender: "ai", message: thankYou, messageType: "text" },
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

            if (isEndingMessage(message)) {
              const alreadyRated = await hasRatingAlready(sessionId);
              if (!alreadyRated) {
                const ratingPrompt = FALLBACK_RESPONSES.ending[Math.floor(Math.random() * FALLBACK_RESPONSES.ending.length)];
                await prisma.chatMessage.create({
                  data: { sessionId, sender: "ai", message: ratingPrompt, messageType: "text" },
                });
              }
            }
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
