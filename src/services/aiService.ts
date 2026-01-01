import type { HexagramInfo, LineValue } from "../types";

export interface FullDivinationResult {
    originalText: string;
    explanation: string;
    movingLinesExplanation: string;
    coreInterpretation: string;
    verse: string;
    details: string;
}

// 代理接口配置
const PROXY_URL = "/api/divination";

export const fetchFullDivination = async (
    hexagram: HexagramInfo,
    lines: LineValue[],
    transformedHexagram: HexagramInfo | null,
    category: string,
    userQuery: string
): Promise<FullDivinationResult> => {
    const movingLinesIndices = lines
        .map((val, idx) => (val === 6 || val === 9 ? idx + 1 : null))
        .filter(val => val !== null);

    const prompt = `
## 易经占卦深度请求

### 1. 卦象基础
- **本卦**：${hexagram.nameZh}（${hexagram.name}）
- **六爻**：${lines.join('、')}
- **变爻**：${movingLinesIndices.length > 0 ? movingLinesIndices.map(i => `第${i}爻`).join('、') : '无（静卦）'}
${transformedHexagram ? `- **之卦**：${transformedHexagram.nameZh}（${transformedHexagram.name}）` : ''}

### 2. 问卦背景
- **事项分类**：${category || '综合运势'}
- **具体问题**：${userQuery || '请对此卦象做整体深度解读'}

### 3. 输出要求
请直接输出 JSON 格式，不要包含任何 Markdown 代码块，不要包含除 JSON 以外的任何文字。
JSON 结构如下：
{
  "originalText": "引用周易原文卦辞",
  "explanation": "白话简述本卦核心哲理",
  "movingLinesExplanation": "变爻原文及启发(若有)",
  "coreInterpretation": "针对用户事项的3-5句明确指引",
  "verse": "四句押韵偈言",
  "details": "象数分析等深度内容"
}
`;

    try {
        console.log(`Attempting divination via server proxy...`);
        const response = await fetch(PROXY_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                prompt: prompt
            })
        });

        if (!response.ok) {
            throw new Error(`Server proxy returned status ${response.status}`);
        }

        const data = await response.json();
        const parsed = data; // 后端应直接返回解析好的 JSON 对象

        return {
            originalText: parsed.originalText || "载入失败",
            explanation: parsed.explanation || "",
            movingLinesExplanation: parsed.movingLinesExplanation || "",
            coreInterpretation: parsed.coreInterpretation || "解卦暂无结果",
            verse: parsed.verse || "",
            details: parsed.details || ""
        };
    } catch (e) {
        console.error(`Divination proxy error:`, e);
        return {
            originalText: "载入失败",
            explanation: "暂时无法连接到先贤智慧，请检查网络或部署状态。",
            movingLinesExplanation: "",
            coreInterpretation: "解卦过程中出现一点波动，请您稍后再试。",
            verse: "万物皆波动，心诚则灵通。\n暂待时机至，妙算在其中。",
            details: "AI 代理服务调用失败。详细信息: " + (e instanceof Error ? e.message : String(e))
        };
    }
};
