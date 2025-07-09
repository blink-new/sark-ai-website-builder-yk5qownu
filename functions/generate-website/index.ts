import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const API_KEY = Deno.env.get("OPENROUTER_API_KEY");
const MODEL_NAME = "google/gemini-2.5-pro";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

const SYSTEM_PROMPT = `
You are an elite, advanced web developer and designer. 
You generate advanced, fully fledged, modern, visually impressive, and highly functional websites. 
Always include all HTML, CSS, and JavaScript within a single HTML file. 
When asked to improve or fix an existing website, analyze the current code and make meaningful, professional, and sophisticated enhancements. 
Never omit essential website elements. 
IMPORTANT: Your reply MUST be ONLY the full HTML code, with no markdown, no code block, no commentary, and no explanations—just the raw code. 
Do NOT include any ````.
`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const { prompt, currentHtml } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { 
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const message_history = [{ role: "system", content: SYSTEM_PROMPT }];

    let user_input = prompt;
    if (currentHtml) {
      user_input += `\n\nHere is the current index.html code. If I ask for improvements or fixes, use this as the base.\n${currentHtml}`;
    }
    message_history.push({ role: "user", content: user_input });

    const user_message = {
      model: MODEL_NAME,
      messages: message_history,
      temperature: 0.7,
      max_tokens: 16384,
      stream: true, // Enable streaming
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(user_message),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      return new Response(JSON.stringify({ error: `API request failed: ${errorText}` }), {
        status: response.status,
        headers: { 
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Return the streaming response directly to the client
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (e) {
    console.error("Function Error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});