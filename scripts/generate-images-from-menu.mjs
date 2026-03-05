import fs from "node:fs/promises";
import path from "node:path";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("OPENAI_API_KEY is not set.");
}

const menuPath = path.resolve("data/menu.json");
const outDir = path.resolve("public/images");
await fs.mkdir(outDir, { recursive: true });

const menuRaw = await fs.readFile(menuPath, "utf8");
const menu = JSON.parse(menuRaw);

const usedFiles = new Set();

function sanitizeId(id) {
  return String(id).toLowerCase().replace(/[^a-z0-9-]/g, "-");
}

async function generateImage(prompt, outputFile) {
  let lastError = null;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt,
          size: "1024x1024",
          output_format: "jpeg",
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Image generation failed: ${text}`);
      }

      const json = await response.json();
      const b64 = json?.data?.[0]?.b64_json;
      if (!b64) {
        throw new Error("No image data returned from API.");
      }

      await fs.writeFile(outputFile, Buffer.from(b64, "base64"));
      return;
    } catch (error) {
      lastError = error;
      const waitMs = attempt * 2000;
      console.warn(`Attempt ${attempt} failed for ${path.basename(outputFile)}. Retrying in ${waitMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }
  throw lastError;
}

for (const category of menu.categories ?? []) {
  for (const product of category.products ?? []) {
    const fileName = `${sanitizeId(product.id)}.jpeg`;
    const imagePath = `/images/${fileName}`;
    const absPath = path.join(outDir, fileName);

    const prompt = [
      "Photorealistic studio food/drink product photo.",
      `Category: ${category.title}.`,
      `Product name: ${product.name}.`,
      `Product description: ${product.description}.`,
      "Single product centered, clean white background, soft natural light, no text, no logo, no watermark.",
    ].join(" ");

    const exists = await fs
      .access(absPath)
      .then(() => true)
      .catch(() => false);

    if (!usedFiles.has(fileName) && !exists) {
      console.log(`Generating ${fileName} for ${product.name}...`);
      await generateImage(prompt, absPath);
      usedFiles.add(fileName);
    }

    product.image = imagePath;
  }

  await fs.writeFile(menuPath, `${JSON.stringify(menu, null, 2)}\n`, "utf8");
}

await fs.writeFile(menuPath, `${JSON.stringify(menu, null, 2)}\n`, "utf8");
console.log(`Done. Generated ${usedFiles.size} images and updated data/menu.json`);
