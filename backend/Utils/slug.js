export const toSlugBase = (value) => {
  const text = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return text || "team";
};

export const makeSlug = (name) => {
  const base = toSlugBase(name);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
};

