export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const { prompt } = await request.json();

        if (!prompt) {
            return new Response(JSON.stringify({ error: 'Prompt is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const PROVIDERS = [
            {
                name: "SiliconFlow",
                url: "https://api.siliconflow.cn/v1/chat/completions",
                key: env.SILICONFLOW_API_KEY || "",
                model: "deepseek-ai/DeepSeek-V3",
            },
            {
                name: "DeepSeek",
                url: "https://api.deepseek.com/chat/completions",
                key: env.DEEPSEEK_API_KEY || "",
                model: "deepseek-chat",
            }
        ];

        for (const provider of PROVIDERS) {
            if (!provider.key) continue;

            try {
                const response = await fetch(provider.url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${provider.key}`
                    },
                    body: JSON.stringify({
                        model: provider.model,
                        messages: [
                            {
                                role: "system",
                                content: "你是一位精通易经、语气庄重且指引明确的易学宗师。你必须只通过 JSON 格式回答。注意：所有 JSON 字段的值必须是 纯字符串 格式，严禁返回嵌套的对象或数组。你的内容应融合象数与义理，解答用户疑惑。"
                            },
                            {
                                role: "user",
                                content: prompt
                            }
                        ],
                        temperature: 0.7,
                        response_format: { type: "json_object" }
                    })
                });

                if (!response.ok) {
                    console.error(`${provider.name} failed with status ${response.status}`);
                    continue;
                }

                const data = await response.json();
                const content = data.choices[0].message.content;

                let cleanContent = content.trim();
                if (cleanContent.startsWith("```")) {
                    cleanContent = cleanContent.replace(/^```(json)?/, "").replace(/```$/, "");
                }

                return new Response(cleanContent.trim(), {
                    headers: { 'Content-Type': 'application/json' },
                });
            } catch (e) {
                console.error(`${provider.name} error:`, e);
            }
        }

        return new Response(JSON.stringify({ error: 'All AI providers failed' }), {
            status: 502,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
