import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(".");
const menuPath = path.join(root, "data", "menu.json");
const srcDir = path.join(root, "urunler");
const dstDir = path.join(root, "public", "images");

const turkishMap = {
  ç: "c",
  Ç: "c",
  ğ: "g",
  Ğ: "g",
  ı: "i",
  İ: "i",
  ö: "o",
  Ö: "o",
  ş: "s",
  Ş: "s",
  ü: "u",
  Ü: "u",
};

function trToAscii(input) {
  return [...input].map((ch) => turkishMap[ch] ?? ch).join("");
}

function normalizeName(input) {
  return trToAscii(String(input).toLowerCase())
    .replace(/&/g, " ve ")
    .replace(/\(.*?\)/g, " ")
    .replace(/[^a-z0-9]+/g, "")
    .replace(/\s+/g, "");
}

function slugify(input) {
  return trToAscii(String(input).toLowerCase())
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function variantKeys(name) {
  const base = normalizeName(name);
  const vars = new Set([base]);

  const replacements = [
    ["tramisu", "tiramisu"],
    ["tiramisu", "tramisu"],
    ["snicers", "snickers"],
    ["snickers", "snicers"],
    ["3", "uc"],
    ["uc", "3"],
    ["sandwich", "sandvic"],
    ["sandvic", "sandwich"],
    ["ezmeli", "ezme"],
    ["ezme", "ezmeli"],
    ["lotuspasta", "lotuscheesecake"],
    ["lotuscheesecake", "lotuspasta"],
    ["nutellapasta", "nutella"],
    ["nutella", "nutellapasta"],
    ["peynirlisandwich", "peynirli"],
    ["peynirli", "peynirlisandwich"],
  ];

  for (const [from, to] of replacements) {
    if (base.includes(from)) vars.add(base.replace(from, to));
  }

  return vars;
}

function titleCaseFromFileName(name) {
  return name
    .split(/\s+/)
    .map((w) => {
      if (/^\d+$/.test(w)) return w;
      const lw = w.toLowerCase();
      return lw.charAt(0).toLocaleUpperCase("tr-TR") + lw.slice(1);
    })
    .join(" ");
}

function inferCategoryId(fileName) {
  const n = normalizeName(fileName);
  if (n.includes("sandwich") || n.includes("sandvic") || n.includes("yumurta")) return "yiyecekler";
  if (
    n.includes("fanta") ||
    n.includes("kola") ||
    n.includes("redbull") ||
    n.includes("su") ||
    n.includes("sprite") ||
    n.includes("gazoz") ||
    n.includes("sogukcay")
  ) {
    return "soguk-icecekler";
  }
  return "tatlilar";
}

function inferPrice(fileName) {
  return "?";
}

const raw = await fs.readFile(menuPath, "utf8");
const menu = JSON.parse(raw);

const categories = new Map((menu.categories ?? []).map((c) => [c.id, c]));
const allProducts = [];
for (const cat of menu.categories ?? []) {
  for (const p of cat.products ?? []) {
    allProducts.push({ cat, product: p });
  }
}

const nameIndex = new Map();
for (const item of allProducts) {
  for (const key of variantKeys(item.product.name)) {
    if (!nameIndex.has(key)) nameIndex.set(key, item);
  }
}

await fs.mkdir(dstDir, { recursive: true });

const files = await fs.readdir(srcDir);
const imageFiles = files.filter((f) => /\.(jpe?g|png|webp)$/i.test(f));

let updatedCount = 0;
let addedCount = 0;

for (const file of imageFiles) {
  const ext = path.extname(file).toLowerCase();
  const baseName = path.basename(file, ext).trim();
  const prettyName = titleCaseFromFileName(baseName);
  const slug = slugify(baseName);
  const destFileName = `${slug}${ext}`;
  const destFsPath = path.join(dstDir, destFileName);
  const imagePath = `/images/${destFileName}`;

  await fs.copyFile(path.join(srcDir, file), destFsPath);

  let existing = null;
  for (const key of variantKeys(baseName)) {
    if (nameIndex.has(key)) {
      existing = nameIndex.get(key);
      break;
    }
  }

  if (existing) {
    existing.product.image = imagePath;
    updatedCount += 1;
    continue;
  }

  const categoryId = inferCategoryId(baseName);
  const category = categories.get(categoryId);
  if (!category) continue;

  const prefix =
    categoryId === "yiyecekler"
      ? "food-"
      : categoryId === "soguk-icecekler"
        ? "cold-"
        : "dessert-";
  const maxNum = (category.products ?? [])
    .map((p) => Number(String(p.id).replace(prefix, "")))
    .filter((n) => Number.isFinite(n))
    .reduce((a, b) => Math.max(a, b), 0);

  const id = `${prefix}${maxNum + 1}`;
  const newProduct = {
    id,
    name: prettyName,
    description:
      categoryId === "yiyecekler"
        ? "Taze hazirlanan sandvic."
        : "Gunluk taze tatli cesidi.",
    price: inferPrice(baseName),
    image: imagePath,
    link: `/product/${id}`,
  };

  category.products.push(newProduct);
  addedCount += 1;

  const wrapped = { cat: category, product: newProduct };
  for (const key of variantKeys(newProduct.name)) {
    if (!nameIndex.has(key)) nameIndex.set(key, wrapped);
  }
}

await fs.writeFile(menuPath, `${JSON.stringify(menu, null, 2)}\n`, "utf8");
console.log(`Updated images: ${updatedCount}`);
console.log(`Added products: ${addedCount}`);
