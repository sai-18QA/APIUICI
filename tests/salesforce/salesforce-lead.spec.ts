import test, { expect } from "@playwright/test";
import dotenv from "dotenv";
dotenv.config({ path: "secrets.env" });
test.use({ storageState: "storager/storageState.json" });
test("salesforce lead api marathon", async ({ page, request }) => {
console.log(
  "Consumer Key available:",
  !!process.env.SF_CONSUMER_KEY,
);

console.log(
  "Consumer Secret available:",
  !!process.env.SF_CONSUMER_SECRET,
);

  let access_Token: any;
  let instance_Url: any;
  let iD: any;
  let token_Type: any;

  const generateTokens = await request.post(
    "https://orgfarm-626247aec2-dev-ed.develop.my.salesforce.com/services/oauth2/token",
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },

      form: {
        grant_type: "client_credentials",
        client_id: process.env.SF_CONSUMER_KEY as string,
        client_secret: process.env.SF_CONSUMER_SECRET as string,
      },
    },
  );

  const response = await generateTokens.json();
  console.log(response);
  access_Token = response.access_token;
  instance_Url = response.instance_url;
  iD = response.id;
  token_Type = response.token_type;

  const postRes = await request.post(
    `${instance_Url}/services/data/v65.0/sobjects/Lead`,
    {
      headers: {
        Authorization: `${token_Type} ${access_Token}`,
        "Content-Type": "application/json",
      },

      data: {
        Salutation: "Mr",
        LastName: "kumar",
        Company: "Qeagle",
      },
    },
  );

  const res = await postRes.json();
  console.log(res);
  const leadId = res.id;
  console.log("Lead ID :", leadId);

  const patchRes = await request.patch(
    `${instance_Url}/services/data/v65.0/sobjects/Lead/${leadId}`,
    {
      headers: {
        Authorization: `${token_Type} ${access_Token}`,
        "Content-Type": "application/json",
      },

      data: {
        FirstName: "sandy",
        Title: "developer",
      },
    },
  );

  await page.goto(
    "https://orgfarm-626247aec2-dev-ed.develop.lightning.force.com/lightning/page/home",
  );
  await page.waitForTimeout(4000);
  await page.locator(".slds-icon-waffle").click();
  await page.getByRole("button", { name: "View All Applications" }).click();
  await page.waitForTimeout(4000);
  const searchBox = page.getByPlaceholder("Search apps or items...");
  await searchBox.fill("Leads");
  await searchBox.press("Enter");
  await page.locator('//span[@class="label-display"]').click();
  const searchList = page.getByRole("searchbox", {
    name: "Search this list...",
  });
  await searchList.click();
  await searchList.fill("kumar");
  await searchList.press("Enter");
  await expect(
  page.getByRole("link", { name: "sandy kumar" }).first()
).toContainText("sandy kumar");
  await page.getByRole("link", { name: "sandy kumar" }).first().click();
  //await page.locator("(//span[text()='kumar'])[1]").click();
  await page
    .locator(
      "(//button[contains(@class,'slds-button slds-button_icon-border-')])[1]",
    )
    .click();
  await page.locator("//span[text()='Delete']").click();
  await page.getByRole("button", { name: "Delete" }).click();
  await expect(
    page.locator('//div[contains(@class,"slds-theme")]'),
  ).toBeVisible();
});
