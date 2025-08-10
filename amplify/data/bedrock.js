export function request(ctx) {
  const { ingredients = [] } = ctx.args;

  // Construct the prompt with the provided ingredients
  const prompt = `Suggest a recipe idea using these ingredients (Please provide a recipe with the language used in the input ingredients. Provide 2 to 3 different recipes if possible): ${ingredients.join(", ")}.`;

  // Use cross-region inference profile for automatic region routing
  const modelId = "apac.anthropic.claude-sonnet-4-20250514-v1:0";

  // Return the request configuration
  return {
    resourcePath: `/model/${modelId}/invoke`,
    method: "POST",
    params: {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 300,
        temperature: 0.4,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,  
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
  
  // Handle potential errors
  if (parsedBody.error) {
    return {
      error: parsedBody.error.message || "Model invocation failed"
    };
  }
  
  // Extract the text content from the response
  const res = {
    body: parsedBody.content && parsedBody.content[0].text, 
  };
  
  // Return the response
  return res;
}