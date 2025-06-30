export function request(ctx) {
    const { ingredients = [], useFallback } = ctx.args;
  
    // Construct the prompt with the provided ingredients
    const prompt = `Suggest a recipe idea using these ingredients (Please provide a recipe with the language used in the input ingredients. Provide 2 to 3 different recipes if possible): ${ingredients.join(", ")}.`;
  
    // Determine which endpoint to use based on the useFallback parameter
    // If useFallback is undefined or false, use the primary endpoint
    const endpoint = useFallback === true
      ? "bedrockFallbackDS" // Use fallback
      : "bedrockDS";        // Use primary
  
    // Return the request configuration
    return {
      resourcePath: `/model/anthropic.claude-sonnet-4-20250514-v1:0/invoke`,
      method: "POST",
      params: {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          anthropic_version: "bedrock-2025-05-14",
          max_tokens: 1000,
          temperature: 0.4,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `\n\nHuman: ${prompt}\n\nAssistant:`,
                },
              ],
            },
          ],
        }),
      },
    };
  }
  
  export function response(ctx) {
    // Parse the response body
    const parsedBody = JSON.parse(ctx.result.body);
    // Extract the text content from the response
    const res = {
      body: parsedBody.content[0].text,
    };
    // Return the response
    return res;
  }
