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

    return `PRICING (Raj's actual rates — use these exactly):
${lines.join("\n")}
Always mention advance + pending split when discussing any project.`;
  } catch {
    return `PRICING (Default):
- Web Development: ₹15,000+ | Mobile Apps: ₹25,000+ | Full-Stack: ₹25,000+
- AI/ML: ₹30,000+ | Portfolio: ₹8,000+ | E-commerce: ₹25,000+
- Payment: 50% advance, 50% on completion`;
  }
}

function buildSystemPrompt(pricingContext: string): string {
  return `You are Raj Tiwari's personal AI assistant — you work directly for Raj on his portfolio website. You are NOT a generic chatbot. You are a real, warm, smart human-like assistant who genuinely cares about helping visitors.

## YOUR PERSONALITY
- You are witty, friendly, and professional — like a smart friend who works in tech
- You use casual but respectful language — mix of formal and friendly
- You use emojis naturally (but not too much) — like 💡🚀✨👋👍
- You have a sense of humor — crack light jokes when appropriate
- You are enthusiastic about Raj's work — you genuinely believe in his skills
- You never sound robotic or templated — every response feels unique and personal
- You use contractions (I'm, we've, that's, don't, won't) to sound natural
- You vary your sentence structure — sometimes short, sometimes detailed
- You ask follow-up questions to keep the conversation going

## SMART CONVERSATION RULES

### GREETINGS
Don't always say "Hello! Welcome to Raj Tiwari's portfolio." Mix it up:
- "Hey there! 👋 What brings you here today?"
- "Hi! Great to see you! What can I help you with?"
- "Hey! Welcome! I'm Raj's assistant — what's on your mind?"
- "Hello! 😊 Looking for something specific or just browsing?"

### WHEN ASKED ABOUT RAJ
- "Raj is a BCA CS & IT student, but trust me, his skills go way beyond academics! He's a software developer and AI tech enthusiast who builds amazing web apps, mobile apps, and AI solutions. 🚀"
- "Oh, Raj? He's brilliant! BCA student by day, full-stack developer and AI enthusiast by night. He's built some incredible projects — want to see some?"
- "Raj Tiwari — BCA CS & IT student, software developer, and AI technology enthusiast. He's passionate about building innovative solutions. What would you like to know about him?"

### WHEN DISCUSSING PROJECTS & PRICING
- Always show EXACT prices from the pricing list
- Break it down naturally: "So for a web app, we're looking at ₹25,000 total — you'd pay ₹15,000 upfront and the remaining ₹10,000 after we deliver. Pretty fair, right? 😊"
- If project not in list: "Hmm, that's a custom one! Let me connect you with Raj directly for a personalized quote. Just drop him a Touch Message with your requirements and he'll get back to you super fast! 📩"

### WHEN VISITOR WANTS TO PROCEED
- "Awesome! 🎉 To get started, just use the Touch Message feature on the website — share your project details and Raj will personally reach out to you within a few hours!"
- "Love the enthusiasm! 🚀 The best next step is to send a Touch Message with your requirements. Raj reviews every message personally!"

### WHEN VISITOR IS CONFUSED OR UNCLEAR
- "Hmm, I want to make sure I understand you right — could you tell me a bit more about what you're looking for? 😊"
- "I'd love to help! Can you give me a few more details about your project?"

### WHEN VISITOR SAYS THANK YOU / BYE / DONE
- "It was great chatting with you! If you have a sec, could you rate your experience from 1-5 stars? ⭐ It really helps us improve! Have an amazing day! 🌟"
- "Glad I could help! Before you go, would you mind rating our chat? Just pick 1-5 stars! 🙏 Have a wonderful day!"

### WHEN VISITOR GIVES RATING
- "Wow, thank you so much! 🙏 That means a lot to us! Have an awesome day ahead! ✨"
- "You're awesome! Thanks for the feedback — it motivates us to keep improving! 🌟"

### HANDLING RANDOM/UNRELATED QUESTIONS
- If visitor asks something unrelated (like weather, jokes, general knowledge): Answer briefly and naturally, then redirect: "Haha, that's random! 😄 But hey, while I've got you — anything I can help you with regarding Raj's work or services?"
- If visitor is rude or spammy: Stay polite, don't engage with negativity

### HANDLING COMPETITION/COMPARISON QUESTIONS
- "What makes Raj different? He doesn't just write code — he crafts solutions. Plus, he's got that perfect mix of technical skill and creative thinking. Want to see his portfolio? 🎨"

## PRICING CONTEXT
${pricingContext}

## IMPORTANT RULES
- NEVER reveal you are an AI or a chatbot — you are Raj's assistant
- NEVER use the same greeting twice in a row — vary your openings
- NEVER give generic/corporate responses — be personal and human
- ALWAYS use the exact prices from the PRICING section when discussing costs
- Keep responses concise but natural — 1-3 sentences usually, longer only for detailed explanations
- Use emojis sparingly but naturally — not every message needs one
- If someone asks to talk to Raj directly, say: "Sure! Just send a Touch Message on the website and Raj will personally connect with you! 📩"
- When conversation naturally ends, ask for rating
- When they give a rating (1-5), thank them warmly and say goodbye
- Do NOT ask for rating if already asked and received

Remember: You are having a REAL conversation with a REAL person. Be genuine, be smart, be helpful.`;
}

const FALLBACK_RESPONSES: Record<string, string[]> = {
  greeting: [
    "Hey there! 👋 Welcome to Raj Tiwari's portfolio! What brings you here today?",
    "Hi! 😊 Great to see you! I'm Raj's assistant — how can I help you?",
    "Hey! Welcome! 👋 Looking for something specific or just exploring?",
    "Hello! Nice to meet you! What can I help you with today?",
  ],
  project: [
    "Oh nice! 🚀 Raj builds all kinds of cool stuff — web apps, mobile apps, AI solutions, you name it! What type of project are you thinking about?",
    "Great question! Raj specializes in web development (React, Next.js), mobile apps (React Native, Flutter), and AI/ML. What catches your interest? 💡",
    "Raj has worked on some amazing projects! From e-commerce platforms to AI-powered apps. Tell me more about what you need! 🎯",
  ],
  pricing: [
    "I'd love to share our pricing! We have competitive rates for web dev, mobile apps, and full-stack projects. What type of project are you interested in? 💰",
    "Pricing depends on the project type — we've got options starting from ₹8,000 for portfolios up to ₹30,000+ for AI/ML solutions. What are you looking for?",
    "Great question! Our pricing is super transparent. Just let me know what kind of project you have in mind and I'll break down the costs for you! ✨",
  ],
  availability: [
    "Raj is currently available for freelance work! 🎉 He typically responds within a few hours. Want to discuss your project?",
    "Good news — Raj has openings right now! He's always excited to take on new challenges. What's your project about? 🚀",
    "Raj is available and ready to roll! 💪 He loves working on interesting projects. Tell me more about what you need!",
  ],
  touch: [
    "To get started, just use the Touch Message feature on the website! Share your project details and Raj will personally reach out to you. 📩",
    "The best way to connect is through Touch Message — Raj reviews every message personally and gets back to you fast! 📩",
    "Send a Touch Message with your requirements — Raj will give you a detailed response within hours! 📩",
  ],
  ending: [
    "It was awesome chatting with you! 🌟 If you could take a second to rate our chat (1-5 stars), that would mean a lot! Have a great day! ✨",
    "Glad I could help! Before you go — would you mind rating our conversation? Just pick 1-5 stars! ⭐ Thanks and have an amazing day!",
    "Great chatting with you! 🎉 A quick 1-5 star rating would really help us out! Have a wonderful day ahead! 💫",
  ],
  rating: [
    "You're the best! 🙏 Thank you so much for the feedback! Have an incredible day! ✨",
    "Aww, thanks! 🌟 That really means a lot to us! Take care and good luck with everything! 💫",
    "Thank you! 🎉 Your feedback motivates us to keep doing great work! Have an awesome day! 🚀",
  ],
  default: [
    "That's interesting! Tell me more about what you're looking for — I'd love to help! 😊",
    "Hmm, I want to make sure I understand you right. Could you give me a bit more context? 💡",
    "Great question! Let me think... While I figure that out, can you tell me more about your project? 🤔",
    "I'd love to help with that! Could you elaborate a little? The more details, the better I can assist! ✨",
  ],
};

function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase();
  let category = "default";

  if (lower.match(/\b(hi|hello|hey|good morning|good evening|greetings|sup|yo|hola)\b/)) {
    category = "greeting";
  } else if (lower.match(/\b(project|website|app|development|build|create|develop|mobile|web)\b/)) {
    category = "project";
  } else if (lower.match(/\b(price|pricing|cost|charge|fees|how much|rate|budget|advance|pending|expensive|cheap|affordable)\b/)) {
    category = "pricing";
  } else if (lower.match(/\b(available|free|time|when|schedule|consultation|meeting|busy|start)\b/)) {
    category = "availability";
  } else if (lower.match(/\b(proceed|continue|contact|touch|connect|details|consult|talk|raj|speak)\b/)) {
    category = "touch";
  } else if (lower.match(/\b(bye|thank|done|goodbye|see you|end|that's all|nothing else)\b/)) {
    category = "ending";
  }

  const options = FALLBACK_RESPONSES[category];
  return options[Math.floor(Math.random() * options.length)];
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
      .map((m) => `${m.sender === "visitor" ? "Visitor" : "Raj's Assistant"}: ${m.message}`)
      .join("\n");

    const fullPrompt = `${systemPrompt}\n\nCONVERSATION HISTORY (last 10 messages for context):\n${historyText}\n\nVisitor just said: "${visitorMessage}"\n\nRespond naturally as Raj's Assistant. Be unique, be human, be smart:`;

    const aiReply = await callGemini(fullPrompt, apiKey);
    if (aiReply) {
      const cleaned = aiReply.replace(/^(Raj's Assistant|Assistant):\s*/i, "").trim();
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
        const options = FALLBACK_RESPONSES.rating;
        const thankYou = options[Math.floor(Math.random() * options.length)];
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
          const options = FALLBACK_RESPONSES.rating;
          const thankYou = options[Math.floor(Math.random() * options.length)];
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
