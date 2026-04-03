const page = await browser.newPage();
const projectId = "project-c879e5d9-759c-4989-8eb";

await page.goto("https://console.cloud.google.com/auth/overview/create?project=" + projectId, { timeout: 90000, waitUntil: "load" });
await new Promise(r => setTimeout(r, 20000));

// 1. Click "1 App Information" to expand it
await page.evaluate(() => {
  const btns = document.querySelectorAll("button");
  for (const b of btns) {
    if (b.textContent.includes("App Information")) { b.click(); return; }
  }
});
await new Promise(r => setTimeout(r, 3000));

// Check what inputs are visible now
const inputs1 = await page.evaluate(() => {
  const inputs = document.querySelectorAll("input, textarea");
  return Array.from(inputs).map((inp, i) => {
    const rect = inp.getBoundingClientRect();
    const visible = rect.height > 0;
    return i + ": type=" + (inp.type || inp.tagName) + " visible=" + visible + " label=" + (inp.getAttribute("aria-label") || "") + " placeholder=" + (inp.placeholder || "");
  }).join("\n");
});
console.log("INPUTS AFTER EXPAND:\n" + inputs1);
