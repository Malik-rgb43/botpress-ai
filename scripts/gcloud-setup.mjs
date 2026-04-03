const page = await browser.newPage();
const projectId = "project-c879e5d9-759c-4989-8eb";

// Step 1: OAuth consent screen
console.log("Step 1: Setting up OAuth consent screen...");
await page.goto(`https://console.cloud.google.com/apis/credentials/consent?project=${projectId}`, { timeout: 90000, waitUntil: "load" });
await new Promise(r => setTimeout(r, 20000));

// Click External
await page.evaluate(() => {
  const all = document.querySelectorAll("*");
  for (const el of all) {
    if (el.children.length === 0 && el.textContent.trim() === "External") {
      el.click();
      return "clicked external";
    }
  }
  return "no external found";
});
await new Promise(r => setTimeout(r, 2000));

// Click CREATE
await page.evaluate(() => {
  const btns = document.querySelectorAll("button");
  for (const b of btns) {
    if (b.textContent.trim().toUpperCase() === "CREATE") { b.click(); return; }
  }
});
await new Promise(r => setTimeout(r, 10000));
console.log("After consent create:", await page.url());

// Fill app name
await page.evaluate(() => {
  const inputs = document.querySelectorAll("input");
  for (const inp of inputs) {
    const parent = inp.closest("div");
    const text = parent ? parent.textContent : "";
    if (text.includes("App name") || text.includes("app name")) {
      inp.focus();
      inp.value = "BotPress AI";
      inp.dispatchEvent(new Event("input", { bubbles: true }));
      inp.dispatchEvent(new Event("change", { bubbles: true }));
      break;
    }
  }
});
await new Promise(r => setTimeout(r, 1000));

// Select support email dropdown
await page.evaluate(() => {
  const dropdowns = document.querySelectorAll("[role=listbox], mat-select, select");
  if (dropdowns.length > 0) dropdowns[0].click();
});
await new Promise(r => setTimeout(r, 2000));
await page.evaluate(() => {
  const opts = document.querySelectorAll("[role=option], mat-option, option");
  if (opts.length > 0) opts[0].click();
});
await new Promise(r => setTimeout(r, 1000));

// Fill developer email (last email input on page)
await page.evaluate(() => {
  const inputs = Array.from(document.querySelectorAll("input"));
  const emailInputs = inputs.filter(i => {
    const p = i.closest("div");
    return p && p.textContent.toLowerCase().includes("developer");
  });
  if (emailInputs.length > 0) {
    const inp = emailInputs[emailInputs.length - 1];
    inp.focus();
    inp.value = "mulpy.ai@gmail.com";
    inp.dispatchEvent(new Event("input", { bubbles: true }));
    inp.dispatchEvent(new Event("change", { bubbles: true }));
  }
});
await new Promise(r => setTimeout(r, 1000));

// Save and Continue x3
for (let i = 0; i < 3; i++) {
  await page.evaluate(() => {
    const btns = document.querySelectorAll("button");
    for (const b of btns) {
      const t = b.textContent.trim().toUpperCase();
      if (t.includes("SAVE AND CONTINUE") || t === "SAVE") { b.click(); return; }
    }
  });
  await new Promise(r => setTimeout(r, 6000));
  console.log("Save " + (i+1) + " done");
}

// Step 2: Create OAuth client
console.log("Step 2: Creating OAuth client...");
await page.goto(`https://console.cloud.google.com/apis/credentials/oauthclient?project=${projectId}`, { timeout: 90000, waitUntil: "load" });
await new Promise(r => setTimeout(r, 15000));

// Select Web Application
await page.evaluate(() => {
  const els = document.querySelectorAll("[role=combobox], [role=listbox], mat-select, select");
  if (els.length > 0) els[0].click();
});
await new Promise(r => setTimeout(r, 3000));
await page.evaluate(() => {
  const opts = document.querySelectorAll("[role=option], mat-option");
  for (const o of opts) {
    if (o.textContent.toLowerCase().includes("web application")) { o.click(); return; }
  }
});
await new Promise(r => setTimeout(r, 3000));

// Add redirect URI button
await page.evaluate(() => {
  const btns = document.querySelectorAll("button");
  for (const b of btns) {
    if (b.textContent.trim().toUpperCase().includes("ADD URI")) { b.click(); return; }
  }
});
await new Promise(r => setTimeout(r, 2000));

// Fill redirect URI in last input
await page.evaluate(() => {
  const inputs = Array.from(document.querySelectorAll("input"));
  const last = inputs[inputs.length - 1];
  if (last) {
    last.focus();
    last.value = "https://botpress-ai.vercel.app/api/auth/gmail/callback";
    last.dispatchEvent(new Event("input", { bubbles: true }));
    last.dispatchEvent(new Event("change", { bubbles: true }));
  }
});
await new Promise(r => setTimeout(r, 2000));

// Click Create
await page.evaluate(() => {
  const btns = document.querySelectorAll("button");
  for (const b of btns) {
    if (b.textContent.trim().toUpperCase() === "CREATE") { b.click(); return; }
  }
});
await new Promise(r => setTimeout(r, 10000));

// Extract credentials
const creds = await page.evaluate(() => {
  const text = document.body.innerText;
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  let clientId = null;
  let clientSecret = null;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("Client ID") && lines[i+1] && lines[i+1].includes("googleusercontent")) {
      clientId = lines[i+1].trim();
    }
    if (lines[i].includes("Client secret") && lines[i+1]) {
      clientSecret = lines[i+1].trim();
    }
    if (lines[i].includes(".apps.googleusercontent.com")) {
      clientId = lines[i].trim();
    }
  }
  return { clientId, clientSecret, snippet: text.substring(0, 2000) };
});

console.log("CLIENT_ID:", creds.clientId);
console.log("CLIENT_SECRET:", creds.clientSecret);
if (!creds.clientId) console.log("SNIPPET:", creds.snippet);
