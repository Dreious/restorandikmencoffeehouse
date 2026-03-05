import fs from "node:fs/promises";
import path from "node:path";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("OPENAI_API_KEY is not set.");
}

const outDir = path.resolve("public/images");
await fs.mkdir(outDir, { recursive: true });

const images = [
  {
    file: "zeytin-ezme-peynir.jpeg",
    prompt:
      "Studio product photo of a fresh Turkish sandwich with olive paste and cheese in a soft bun, minimal white background, soft natural light, realistic food photography.",
  },
  {
    file: "uc-peynirli.jpeg",
    prompt:
      "Studio product photo of a three-cheese sandwich in a soft bun, melted cheeses visible, minimal white background, realistic food photography.",
  },
  {
    file: "lotus-cheesecake.jpeg",
    prompt:
      "Studio product photo of a lotus cheesecake slice with biscuit topping, minimal white background, realistic dessert photography.",
  },
  {
    file: "nutella.jpeg",
    prompt:
      "Studio product photo of a dessert topped with Nutella and chocolate crumbs, served in a glass cup, minimal white background, realistic food photography.",
  },
  {
    file: "snicers-pasta.jpeg",
    prompt:
      "Studio product photo of a snickers style chocolate cake slice with peanuts and caramel detail, minimal white background, realistic dessert photography.",
  },
  {
    file: "latte-pasta.jpeg",
    prompt:
      "Studio product photo of a latte flavored cake slice with light coffee cream layers, minimal white background, realistic dessert photography.",
  },
  {
    file: "marlenka.jpeg",
    prompt:
      "Studio product photo of a marlenka honey cake slice with layered texture, minimal white background, realistic dessert photography.",
  },
  {
    file: "cookie.jpeg",
    prompt:
      "Studio product photo of a large chocolate chip cookie, minimal white background, realistic food photography.",
  },
  {
    file: "orman-meyveli-pasta.jpeg",
    prompt:
      "Studio product photo of a forest berry cake slice with purple berry topping and cream layer, minimal white background, realistic dessert photography.",
  },
  {
    file: "tiramisu.jpeg",
    prompt:
      "Studio product photo of a tiramisu dessert in a rectangular container with cocoa powder on top, minimal white background, realistic dessert photography.",
  },
  {
    file: "magnolya.jpeg",
    prompt:
      "Studio product photo of magnolia dessert in a glass jar with biscuit crumbs and strawberry slices, minimal white background, realistic dessert photography.",
  },
  {
    file: "menu-klasikler-specials.jpeg",
    prompt:
      "Elegant coffee menu board poster on a dark chalkboard style background, title COFFEE HOUSE, sections KLASIKLER and SPECIALS, professional typography, photographed straight-on.",
  },
  {
    file: "menu-iced-coffe.jpeg",
    prompt:
      "Elegant coffee menu board poster on a dark chalkboard style background, title COFFEE HOUSE, section ICED COFFE, professional typography, photographed straight-on.",
  },
  {
    file: "menu-teas-geleneksel.jpeg",
    prompt:
      "Elegant coffee menu board poster on a dark chalkboard style background, title COFFEE HOUSE, sections TEA'S and GELENEKSEL, professional typography, photographed straight-on.",
  },
];

for (const item of images) {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt: item.prompt,
      size: "1024x1024",
      output_format: "jpeg",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Image generation failed for ${item.file}: ${text}`);
  }

  const json = await response.json();
  const b64 = json?.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error(`No image data returned for ${item.file}`);
  }

  const filePath = path.join(outDir, item.file);
  await fs.writeFile(filePath, Buffer.from(b64, "base64"));
  console.log(`Generated ${item.file}`);
}

console.log("All AI images generated.");
