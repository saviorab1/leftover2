import { defineBackend } from "@aws-amplify/backend";
import { data } from "./data/resource";
import { auth } from "./auth/resource";

const backend = defineBackend({
  auth,
  data,
});
