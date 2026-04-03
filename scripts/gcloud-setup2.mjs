const page = await browser.newPage();
const projectId = "project-c879e5d9-759c-4989-8eb";

// Google Auth Platform - Get Started
console.log("Clicking Get Started...");
await page.goto("https://console.cloud.google.com/auth/clients?project=" + projectId, { timeout: 90000, waitUntil: "load" });
await new Promise(r => setTimeout(r, 15000));

// Click Get Started
await page.evaluate(() => {
  const btns = document.querySelectorAll("button, a");
  for (const b of btns) {
    const t = (b.textContent || "").trim();
    if (t === "Get started" || t === "GET STARTED") { b.click(); return "clicked"; }
  }
  return "not found";
});
await new Promise(r => setTimeout(r, 10000));
console.log("URL after get started:", await page.url());

// Fill App name
await page.evaluate(() => {
  const inputs = document.querySelectorAll("input");
  for (const inp of inputs) {
    const p = inp.closest("[class]");
    const text = p ? p.textContent : "";
    if (text.includes("App name") || text.includes("app name") || text.includes("Application name")) {
      inp.focus();
      inp.value = "BotPress AI";
      inp.dispatchEvent(new Event("input", { bubbles: true }));
      inp.dispatchEvent(new Event("change", { bubbles: true }));
      console.log("Filled app name");
      break;
    }
  }
});
await new Promise(r => setTimeout(r, 1000));

// Fill support email
await page.evaluate(() => {
  const inputs = document.querySelectorAll("input[type=email], input");
  for (const inp of inputs) {
    const p = inp.closest("[class]");
    const text = p ? p.textContent : "";
    if (text.toLowerCase().includes("support email") || text.toLowerCase().includes("user support")) {
      inp.focus();
      inp.value = "mulpy.ai@gmail.com";
      inp.dispatchEvent(new Event("input", { bubbles: true }));
      inp.dispatchEvent(new Event("change", { bubbles: true }));
      console.log("Filled support email");
      break;
    }
  }
});
await new Promise(r => setTimeout(r, 1000));

// Select audience: External
await page.evaluate(() => {
  const els = document.querySelectorAll("*");
  for (const el of els) {
    if (el.children.length === 0 && el.textContent.trim() === "External") {
      el.click();
      console.log("Selected External");
      return;
    }
  }
});
await new Promise(r => setTimeout(r, 1000));

// Fill developer email
await page.evaluate(() => {
  const inputs = document.querySelectorAll("input");
  for (const inp of inputs) {
    const label = inp.getAttribute("aria-label") || "";
    const p = inp.closest("[class]");
    const text = p ? p.textContent : "";
    if (label.toLowerCase().includes("developer") || text.toLowerCase().includes("developer contact")) {
      inp.focus();
      inp.value = "mulpy.ai@gmail.com";
      inp.dispatchEvent(new Event("input", { bubbles: true }));
      inp.dispatchEvent(new Event("change", { bubbles: true }));
      console.log("Filled developer email");
      break;
    }
  }
});
await new Promise(r => setTimeout(r, 1000));

// Click Continue / Next / Save
await page.evaluate(() => {
  const btns = document.querySelectorAll("button");
  for (const b of btns) {
    const t = (b.textContent || "").trim().toUpperCase();
    if (t === "NEXT" || t === "CONTINUE" || t === "CREATE" || t === "SAVE") {
      b.click();
      return t;
    }
  }
});
await new Promise(r => setTimeout(r, 8000));
console.log("After first save:", await page.url());

// Keep clicking Next/Continue/Save until done
for (let i = 0; i < 5; i++) {
  const clicked = await page.evaluate(() => {
    const btns = document.querySelectorAll("button");
    for (const b of btns) {
      const t = (b.textContent || "").trim().toUpperCase();
      if (t === "NEXT" || t === "CONTINUE" || t === "SAVE" || t === "SAVE AND CONTINUE") {
        b.click();
        return t;
      }
    }
    return null;
  });
  if (!clicked) break;
  console.log("Clicked:", clicked);
  await new Promise(r => setTimeout(r, 5000));
}

console.log("Auth platform setup done. URL:", await page.url());

// Now create OAuth client
console.log("Creating OAuth client...");
await page.goto("https://console.cloud.google.com/auth/clients/create?project=" + projectId, { timeout: 90000, waitUntil: "load" });
await new Promise(r => setTimeout(r, 15000));

let snap = await page.evaluate(() => document.body.innerText.substring(0, 1000));
console.log("Create client page:", snap.substring(0, 300));

// Select Web Application
await page.evaluate(() => {
  const els = document.querySelectorAll("[role=combobox], [role=listbox], select, mat-select");
  if (els.length > 0) els[0].click();
});
await new Promise(r => setTimeout(r, 3000));
await page.evaluate(() => {
  const opts = document.querySelectorAll("[role=option], mat-option, option");
  for (const o of opts) {
    if (o.textContent.toLowerCase().includes("web application") || o.textContent.toLowerCase().includes("web")) {
      o.click();
      console.log("Selected:", o.textContent.trim());
      return;
    }
  }
});
await new Promise(r => setTimeout(r, 3000));

// Fill client name
await page.evaluate(() => {
  const inputs = document.querySelectorAll("input");
  for (const inp of inputs) {
    if (inp.value === "" || inp.value.includes("Web client")) {
      inp.focus();
      inp.value = "BotPress AI";
      inp.dispatchEvent(new Event("input", { bubbles: true }));
      inp.dispatchEvent(new Event("change", { bubbles: true }));
      break;
    }
  }
});
await new Promise(r => setTimeout(r, 1000));

// Click ADD URI for redirect
await page.evaluate(() => {
  const btns = document.querySelectorAll("button");
  for (const b of btns) {
    const t = (b.textContent || "").trim().toUpperCase();
    if (t.includes("ADD URI") || t.includes("ADD REDIRECT")) { b.click(); return; }
  }
});
await new Promise(r => setTimeout(r, 2000));

// Fill redirect URI
await page.evaluate(() => {
  const inputs = Array.from(document.querySelectorAll("input"));
  // Find empty inputs or ones with placeholder about URI
  for (let i = inputs.length - 1; i >= 0; i--) {
    if (inputs[i].value === "" || inputs[i].placeholder.toLowerCase().includes("uri")) {
      inputs[i].focus();
      inputs[i].value = "https://botpress-ai.vercel.app/api/auth/gmail/callback";
      inputs[i].dispatchEvent(new Event("input", { bubbles: true }));
      inputs[i].dispatchEvent(new Event("change", { bubbles: true }));
      console.log("Filled redirect URI in input", i);
      break;
    }
  }
});
await new Promise(r => setTimeout(r, 2000));

// Click Create
await page.evaluate(() => {
  const btns = document.querySelectorAll("button");
  for (const b of btns) {
    const t = (b.textContent || "").trim().toUpperCase();
    if (t === "CREATE" || t === "SAVE") { b.click(); return t; }
  }
});
await new Promise(r => setTimeout(r, 10000));

// Extract credentials
const creds = await page.evaluate(() => {
  const text = document.body.innerText;
  let clientId = null;
  let clientSecret = null;

  // Look for patterns
  const idMatch = text.match(/([0-9]+-[a-z0-9]+\.apps\.googleusercontent\.com)/);
  if (idMatch) clientId = idMatch[1];

  const secretMatch = text.match(/Client secret[:\s]*\n?\s*([A-Za-z0-9_-]{20,})/i);
  if (secretMatch) clientSecret = secretMatch[1];

  // Also try GOCSPX pattern
  const gocspx = text.match(/(GOCSPX-[A-Za-z0-9_-]+)/);
  if (gocspx) clientSecret = gocspx[1];

  return { clientId, clientSecret, snippet: text.substring(0, 2000) };
});

console.log("=== CREDENTIALS ===");
console.log("CLIENT_ID:", creds.clientId);
console.log("CLIENT_SECRET:", creds.clientSecret);

if (!creds.clientId || !creds.clientSecret) {
  console.log("SNIPPET:", creds.snippet);
}
