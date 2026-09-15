const apiKey = "";

export const isGeminiConfigured = Boolean(apiKey);
export const isGeminiMock = !isGeminiConfigured;

export async function callGeminiAPI(prompt: string): Promise<string> {
  if (!apiKey) {
    console.warn("Gemini API Key is missing. Using mock response.");
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (prompt.includes("Project Analysis")) {
      return `**プロジェクト分析レポート**\n\nこのプロジェクトは **Critical** レベルの脆弱性を複数含んでおり、即時の対応が必要です。\n\n1. **OpenSSLの更新**: 攻撃者がメモリ内容を読み取る可能性があるため、バージョン3.0.7以上への更新を最優先してください。\n2. **Log4jの確認**: 検出されたバージョンは古い可能性があります。Log4Shellの回避策が適用されているか確認が必要です。\n\n全体的なセキュリティスコアは **D** です。早急なパッチ適用を推奨します。`;
    } else {
      return `**AIによる解説と対策**\n\nこの脆弱性は、攻撃者がリモートで任意のコードを実行できる可能性があります（RCE）。\n\n**推奨される対策:**\n1. パッケージを最新の安定版にアップデートしてください。\n2. アップデートできない場合は、該当機能へのアクセス制限を行ってください。\n\n影響範囲は限定的ですが、放置すると危険です。`;
    }
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      },
    );
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data = await response.json();
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response generated."
    );
  } catch (error) {
    console.error("Gemini API Call Failed:", error);
    throw error;
  }
}
