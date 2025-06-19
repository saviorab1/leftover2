import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  // Empty schema but properly formatted
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
