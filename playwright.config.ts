import { defineConfig, devices } from "@playwright/test";

const PORT = 3000;

export default defineConfig({
  testDir: "./e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  // 카톡 인앱 브라우저 등 모바일이 주 사용 환경이라 모바일 뷰포트도 함께 확인
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    // CI는 빌드 결과물로, 로컬은 dev 서버로
    command: process.env.CI ? `pnpm start --port ${PORT}` : `pnpm dev --port ${PORT}`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
  },
});
