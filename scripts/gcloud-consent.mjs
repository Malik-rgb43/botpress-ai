const page = await browser.newPage();
const projectId = "project-c879e5d9-759c-4989-8eb";

// Go to consent screen config
console.log("Going to consent config...");
await page.goto("https://console.cloud.google.com/auth/overview/create?project=" + projectId, { timeout: 90000, waitUntil: "load" });
await new Promise(r => setTimeout(r, 20000));

// Get page snapshot to understand the form
const snap = await page.evaluate(() => {
  const inputs = document.querySelectorAll("input, select, textarea, [role=combobox], [role=listbox]");
  const result = [];
  inputs.forEach((inp, i) => {
    const label = inp.getAttribute("aria-label") || inp.getAttribute("placeholder") || "";
    const name = inp.getAttribute("name") || "";
    const type = inp.getAttribute("type") || inp.tagName;
    const val = inp.value || "";
    result.push(i + ": " + type + " | label=" + label + " | name=" + name + " | val=" + val);
  });
  return result.join("\n");
});
console.log("FORM FIELDS:\n" + snap);

// Also get buttons
const buttons = await page.evaluate(() => {
  const btns = document.querySelectorAll("button, [role=button]");
  return Array.from(btns).map((b, i) => i + ": " + b.textContent.trim().substring(0, 40)).join("\n");
});
console.log("\nBUTTONS:\n" + buttons);
