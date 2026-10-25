exports.handler = async (event) => {
  const headers = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };
  try {
    const { prompt, counts } = JSON.parse(event.body);
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://altamayoz-academy.netlify.app",
        "X-Title": "Academy Tamayoz"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free",
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: `أنشئ ${counts.MCQ} MCQ و ${counts.TF} TF من: ${prompt}. JSON: {"questions": [{"type":"MCQ","textAr":"...","optionsAr":["a","b","c","d"],"correctOptionIndex":0},{"type":"TF","textAr":"...","trueFalseAnswer":true}]}` }]
      })
    });
    const data = await res.json();
    if(data.error) throw new Error(data.error.message);
    return { statusCode: 200, headers, body: data.choices[0].message.content.replace(/```json|```/g,"").trim() };
  } catch(e){ return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) }; }
};
