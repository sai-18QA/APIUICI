import { test } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: "secrets.env" });

test("Salesforce storage state", async ({ page }) => {

  await page.goto("https://login.salesforce.com/",{ waitUntil: "domcontentloaded" });
  console.log("Username:", process.env.SF_USERNAME);
console.log("Password exists:", !!process.env.SF_PASSWORD);

  await page.getByRole("link", {
    name: "Log In with Username"
  }).click();

  await page.locator("#username").fill(
    process.env.SF_USERNAME as string
  );

  await page.locator("#Login").click();

  await page.locator("#password").fill(
    process.env.SF_PASSWORD as string
  );

  await page.locator("#Login").click();

  await page.waitForTimeout(30000);

  await page.context().storageState({
    path: "storager/storageState.json"
  });

})