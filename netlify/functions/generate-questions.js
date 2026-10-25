exports.handler = async (event) => {
  const headers = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers };
  
  try {
    const { prompt, counts } = JSON.parse(event.body);
    const mcq = counts?.MCQ || 2;
    const tf = counts?.TF || 1;

    // قائمة موديلات مجانية شغالة حاليا - يجرب واحد تلو الآخر
    const models = [
      "google/gemma-4-31b-it:free",
      "google/gemma-3-27b-it:free",
      "meta-llama/llama-3.3-70b-instruct:free",
      "nvidia/nemotron-3-super-120b-a12b:free",
      "nvidia/nemotron-3-nano-30b-a3b:free"
    ];

    const systemPrompt = `أنت مولد أسئلة تعليمية. أنشئ ${mcq} MCQ و ${tf} TF من النص التالي: ${prompt}
أرجع JSON فقط بهذا الشكل: {"questions": [{"type":"MCQ","textAr":"...","optionsAr":["a","b","c","d"],"correctOptionIndex":0},{"type":"TF","textAr":"...","trueFalseAnswer":true}]}`;

    let lastError = null;
    
    for (const model of models) {
      try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://magical-puffpuff-bae26f.netlify.app",
            "X-Title": "Academy Tamayoz"
          },
          body: JSON.stringify({
            model: model,
            response_format: { type: "json_object" },
            messages: [{ role: "user", content: systemPrompt }]
          })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        
        let content = data.choices[0].message.content.replace(/```json|```/g, "").trim();
        // نجح - أرجع النتيجة
        return { statusCode: 200, headers, body: content };

      } catch (e) {
        lastError = e.message + " (model: " + model + ")";
        continue; // جرب الموديل التالي
      }
    }
    
    // إذا كل الموديلات فشلت
    throw new Error("كل الموديلات فشلت. آخر خطأ: " + lastError);

  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
