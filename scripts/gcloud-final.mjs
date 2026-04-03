const page = await browser.newPage();
const projectId = "project-c879e5d9-759c-4989-8eb";

await page.goto("https://console.cloud.google.com/auth/overview/create?project=" + projectId, { timeout: 90000, waitUntil: "load" });
await new Promise(r => setTimeout(r, 20000));

// Fill App Name using keyboard
const appInput = await page.$("input[type=text]:not([type=search])");
if (appInput) {
  await appInput.click();
  await appInput.fill("BotPress AI");
  console.log("Filled app name via fill()");
} else {
  console.log("No app input found, trying all inputs");
  const allInputs = await page.$$("input");
  console.log("Found", allInputs.length, "inputs");
  for (const inp of allInputs) {
    const visible = await inp.isVisible().catch(() => false);
    const type = await inp.getAttribute("type");
    if (visible && type !== "search" && type !== "radio" && type !== "checkbox" && type !== "hidden") {
      await inp.click();
      await inp.fill("BotPress AI");
      console.log("Filled visible input");
      break;
    }
  }
}
await new Promise(r => setTimeout(r, 2000));

// Click Next
const nextBtn = await page.$("button:has-text('Next')");
if (nextBtn) {
  await nextBtn.click();
  console.log("Clicked Next");
}
await new Promise(r => setTimeout(r, 5000));

// Step 2: Select External
const extRadio = await page.$("input[value=external]");
if (extRadio) {
  await extRadio.click({ force: true });
  console.log("Clicked external radio");
}
await new Promise(r => setTimeout(r, 2000));

// Fill email using keyboard
const emailInput = await page.$("[aria-label*=email]");
if (emailInput) {
  await emailInput.click();
  await emailInput.fill("orimalik19@gmail.com");
  console.log("Filled email via aria-label");
} else {
  // Try finding by label text
  const allInputs = await page.$$("input");
  for (const inp of allInputs) {
    const visible = await inp.isVisible().catch(() => false);
    const ariaLabel = await inp.getAttribute("aria-label") || "";
    if (visible && ariaLabel.toLowerCase().includes("email")) {
      await inp.click();
      await inp.fill("orimalik19@gmail.com");
      console.log("Filled email input");
      break;
    }
  }
}
await new Promise(r => setTimeout(r, 2000));

// Press Enter to add email (some forms require this)
await page.keyboard.press("Enter");
await new Promise(r => setTimeout(r, 2000));

// Click Next
const nextBtn2 = await page.$("button:has-text('Next')");
if (nextBtn2) {
  await nextBtn2.click();
  console.log("Clicked Next 2");
}
await new Promise(r => setTimeout(r, 5000));

// Click Create
const createBtn = await page.$("button:has-text('Create')");
if (createBtn) {
  await createBtn.click();
  console.log("Clicked Create");
}
await new Promise(r => setTimeout(r, 10000));
console.log("URL after create:", await page.url());

// Check if we're on the overview page now
const pageText = await page.evaluate(() => document.body.innerText.substring(0, 500));
console.log("Page text:", pageText.substring(0, 300));

// If successful, go create OAuth client
if (await page.url() !== "https://console.cloud.google.com/auth/overview/create?project=" + projectId) {
  console.log("Consent screen created! Now creating OAuth client...");

  await page.goto("https://console.cloud.google.com/auth/clients/create?project=" + projectId, { timeout: 90000, waitUntil: "load" });
  await new Promise(r => setTimeout(r, 15000));

  // Select Web Application from dropdown
  const dropdown = await page.$("[role=combobox], mat-select, select");
  if (dropdown) {
    await dropdown.click();
    await new Promise(r => setTimeout(r, 2000));
    const webOpt = await page.$("[role=option]:has-text('Web application')");
    if (webOpt) {
      await webOpt.click();
      console.log("Selected Web Application");
    }
  }
  await new Promise(r => setTimeout(r, 3000));

  // Fill name
  const nameInput = await page.$("input[type=text]:not([type=search])");
  if (nameInput) {
    await nameInput.click();
    await nameInput.fill("BotPress AI");
    console.log("Filled client name");
  }
  await new Promise(r => setTimeout(r, 2000));

  // Add redirect URI
  const addUriBtn = await page.$("button:has-text('Add URI')");
  if (addUriBtn) {
    await addUriBtn.click();
    await new Promise(r => setTimeout(r, 2000));
  }

  // Fill URI in last visible input
  const allInputs = await page.$$("input");
  for (let i = allInputs.length - 1; i >= 0; i--) {
    const visible = await allInputs[i].isVisible().catch(() => false);
    const val = await allInputs[i].inputValue().catch(() => "x");
    if (visible && val === "") {
      await allInputs[i].click();
      await allInputs[i].fill("https://botpress-ai.vercel.app/api/auth/gmail/callback");
      console.log("Filled redirect URI");
      break;
    }
  }
  await new Promise(r => setTimeout(r, 2000));

  // Click Create
  const createBtn2 = await page.$("button:has-text('Create')");
  if (createBtn2) {
    await createBtn2.click();
    console.log("Clicked Create client");
  }
  await new Promise(r => setTimeout(r, 10000));

  // Extract credentials
  const creds = await page.evaluate(() => {
    const text = document.body.innerText;
    const idMatch = text.match(/([0-9]+-[a-z0-9]+\.apps\.googleusercontent\.com)/);
    const secretMatch = text.match(/(GOCSPX-[A-Za-z0-9_-]+)/);
    return {
      clientId: idMatch ? idMatch[1] : null,
      clientSecret: secretMatch ? secretMatch[1] : null,
      text: text.substring(0, 2000)
    };
  });

  console.log("=== CREDENTIALS ===");
  console.log("CLIENT_ID:", creds.clientId);
  console.log("CLIENT_SECRET:", creds.clientSecret);
  if (!creds.clientId) console.log("TEXT:", creds.text.substring(0, 500));
} else {
  console.log("Still on create page - consent screen may not have saved");

  // Let's check what errors are shown
  const errors = await page.evaluate(() => {
    const errorEls = document.querySelectorAll("[class*=error], [class*=invalid], [role=alert]");
    return Array.from(errorEls).map(e => e.textContent.trim()).join(" | ");
  });
  console.log("ERRORS:", errors);
}
