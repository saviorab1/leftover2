import { defineBackend } from "@aws-amplify/backend";
import { data } from "./data/resource";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { auth } from "./auth/resource";

const backend = defineBackend({
  auth,
  data,
});

// Use the latest Claude 4.0 model with cross-region inference
const crossRegionModelId = "apac.anthropic.claude-sonnet-4-20250514-v1:0"; //Declare the inference profile ID here
const regionalModelId = "anthropic.claude-sonnet-4-20250514-v1:0"; //Declare the Bedrock modelID here

// Primary region  - Cross-region inference will handle routing automatically
const bedrockDataSource = backend.data.resources.graphqlApi.addHttpDataSource(
  "bedrockDS",
  "https://bedrock-runtime.ap-southeast-1.amazonaws.com",
  {
    authorizationConfig: {
      signingRegion: "ap-southeast-1",
      signingServiceName: "bedrock",
    },
  }
);

// Grant permissions for cross-region inference profile
bedrockDataSource.grantPrincipal.addToPrincipalPolicy(
  new PolicyStatement({
    resources: [
      // Cross-region inference profile
      `arn:aws:bedrock:ap-southeast-1:600627340244:inference-profile/${crossRegionModelId}`,
      // Regional model as fallback
      `arn:aws:bedrock:ap-southeast-1::foundation-model/${regionalModelId}`,
      // Additional regions that might be used by cross-region inference
      `arn:aws:bedrock:ap-northeast-1::foundation-model/${regionalModelId}`,
      `arn:aws:bedrock:ap-southeast-2::foundation-model/${regionalModelId}`,
      `arn:aws:bedrock:ap-northeast-2::foundation-model/${regionalModelId}`,
      `arn:aws:bedrock:ap-northeast-3::foundation-model/${regionalModelId}`,
      // Add wildcard for cross-region inference to handle all regions
      `arn:aws:bedrock:*::foundation-model/${regionalModelId}`,
    ],
    actions: ["bedrock:InvokeModel", "bedrock:InvokeModelWithResponseStream"],
  })
);
