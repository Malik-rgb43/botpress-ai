const page = await browser.newPage();
const projectId = "project-c879e5d9-759c-4989-8eb";

await page.goto("https://console.cloud.google.com/auth/overview/create?project=" + projectId, { timeout: 90000, waitUntil: "load" });
await new Promise(r => setTimeout(r, 20000));

// Step 1: Fill App Name (input index 1)
await page.evaluate(() => {
  const inputs = document.querySelectorAll("input[type=text], input:not([type])");
  const visible = Array.from(inputs).filter(i => i.getBoundingClientRect().height > 0);
  if (visible.length > 0) {
    visible[0].focus();
    visible[0].value = "BotPress AI";
    visible[0].dispatchEvent(new Event("input", { bubbles: true }));
    visible[0].dispatchEvent(new Event("change", { bubbles: true }));
  }
});
await new Promise(r => setTimeout(r, 1000));
console.log("Filled app name");

// Click Next
await page.evaluate(() => {
  const btns = document.querySelectorAll("button");
  for (const b of btns) {
    if (b.textContent.trim() === "Next") { b.click(); return; }
  }
});
await new Promise(r => setTimeout(r, 5000));
console.log("Clicked Next");

// Step 2: Should show audience - click External radio
await page.evaluate(() => {
  const radios = document.querySelectorAll("input[type=radio]");
  for (const r of radios) {
    if (r.value === "external") { r.click(); return "clicked external"; }
  }
  // Try clicking label
  const labels = document.querySelectorAll("label, [class*=radio]");
  for (const l of labels) {
    if (l.textContent.includes("External")) { l.click(); return "clicked label"; }
  }
});
await new Promise(r => setTimeout(r, 2000));
console.log("Selected External");

// Fill email field if visible
await page.evaluate(() => {
  const inputs = document.querySelectorAll("input");
  const visible = Array.from(inputs).filter(i => {
    const rect = i.getBoundingClientRect();
    return rect.height > 0 && (i.getAttribute("aria-label") || "").includes("email");
  });
  if (visible.length > 0) {
    visible[0].focus();
    visible[0].value = "mulpy.ai@gmail.com";
    visible[0].dispatchEvent(new Event("input", { bubbles: true }));
    visible[0].dispatchEvent(new Event("change", { bubbles: true }));
    console.log("Filled email");
  }
});
await new Promise(r => setTimeout(r, 1000));

// Click Next again
await page.evaluate(() => {
  const btns = document.querySelectorAll("button");
  for (const b of btns) {
    if (b.textContent.trim() === "Next") { b.click(); return; }
  }
});
await new Promise(r => setTimeout(r, 5000));
console.log("Clicked Next 2");

// Click Create
await page.evaluate(() => {
  const btns = document.querySelectorAll("button");
  for (const b of btns) {
    if (b.textContent.trim() === "Create") { b.click(); return; }
  }
});
await new Promise(r => setTimeout(r, 10000));
console.log("Clicked Create, URL:", await page.url());

// Now go to create OAuth client
await page.goto("https://console.cloud.google.com/auth/clients/create?project=" + projectId, { timeout: 90000, waitUntil: "load" });
await new Promise(r => setTimeout(r, 15000));

// Check what we see
const snap2 = await page.evaluate(() => {
  const inputs = document.querySelectorAll("input, select, [role=combobox]");
  return Array.from(inputs).map((inp, i) => {
    const rect = inp.getBoundingClientRect();
    return i + ": " + inp.tagName + " type=" + (inp.type || "") + " visible=" + (rect.height > 0) + " label=" + (inp.getAttribute("aria-label") || "") + " val=" + (inp.value || "");
  }).join("\n");
});
console.log("CREATE CLIENT FORM:\n" + snap2);

const btns2 = await page.evaluate(() => {
  return Array.from(document.querySelectorAll("button")).filter(b => b.getBoundingClientRect().height > 0).map(b => b.textContent.trim().substring(0, 30)).join(" | ");
});
console.log("BUTTONS:", btns2);
