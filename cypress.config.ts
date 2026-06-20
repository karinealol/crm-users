import { defineConfig } from "cypress";

export default defineConfig({
  allowCypressEnv: false,
  e2e: {
    baseUrl: "https://crm-users-peach.vercel.app/",
    setupNodeEvents(on, config) {
    },
  },
});