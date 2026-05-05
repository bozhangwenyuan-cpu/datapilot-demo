// Vercel Serverless Function:代理转发到 DeepSeek API
// 这样前端不会暴露 API key,且不会有 CORS 问题
//
// 部署后访问:https://你的项目.vercel.app/api/chat

export default async function handler(req, res) {
  // 仅允许 POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server misconfigured: DEEPSEEK_API_KEY not set" });
  }

  const { messages, stream = false } = req.body || {};
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Missing or invalid 'messages' array" });
  }

  try {
    const upstream = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages,
        temperature: 0.7,
        max_tokens: 800,
        stream,
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      return res.status(upstream.status).json({ error: `DeepSeek API error: ${errText}` });
    }

    if (stream) {
      // 流式转发 SSE
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const reader = upstream.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(decoder.decode(value, { stream: true }));
      }
      res.end();
    } else {
      const data = await upstream.json();
      return res.status(200).json(data);
    }
  } catch (err) {
    return res.status(500).json({ error: `Proxy error: ${err.message}` });
  }
}
