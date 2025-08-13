import { defineAuth } from '@aws-amplify/backend';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailStyle:"CODE",
      verificationEmailSubject:"Welcome to Leftover!",
      verificationEmailBody:(createCode) =>
        `Please use this code to confirm your account: ${createCode()}`,
    },
  },
});
