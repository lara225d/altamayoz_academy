exports.handler = async (event) => {
  const headers = { 
    "Access-Control-Allow-Origin": "*", 
    "Content-Type": "application/json" 
  };
  
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers };
  }

  try {
    const { prompt, counts } = JSON.parse(event.body);
    
    const mcq = counts?.MCQ || 2;
    const tf = counts?.TF || 1;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://magical-puffpuff-bae26f.netlify.app",
        "X-Title": "Academy Tamayoz"
      },
      body: JSON.stringify({
        model: "google/gemini-flash-1.5-8b",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: `أنت مولد أسئلة. أنشئ ${mcq} سؤال اختيار من متعدد و ${tf} سؤال صح وخطأ من هذا النص: ${prompt}. أرجع JSON فقط بهذا الشكل الحرفي: {"questions": [{"type":"MCQ","textAr":"نص السؤال","optionsAr":["خيار1","خيار2","خيار3","خيار4"],"correctOptionIndex":0},{"type":"TF","textAr":"نص سؤال صح وخطأ","trueFalseAnswer":true}]}`
          }
        ]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    let content = data.choices[0].message.content;
    content = content.replace(/```json|```/g, "").trim();

    return {
      statusCode: 200,
      headers,
      body: content
    };

  } catch (e) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: e.message })
    };
  }
};
