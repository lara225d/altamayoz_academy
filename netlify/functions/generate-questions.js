exports.handler = async (event) => {
  try {
    const { lesson } = JSON.parse(event.body);
    
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://magical-puffpuff-bae26f.netlify.app",
        "X-Title": "Academy Tamayoz"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free",
        messages: [
          { role: "system", content: "أنت مولد أسئلة JSON فقط. أرجع {\"questions\": [{\"question\": \"...\", \"options\": [\"...\"], \"answer\": 0}]}" },
          { role: "user", content: `أنشئ 3 أسئلة من: ${lesson}` }
        ]
      })
    });

    const data = await res.json();
    if(data.error) throw new Error(data.error.message);
    
    return {
      statusCode: 200,
      body: data.choices[0].message.content
    };

  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
