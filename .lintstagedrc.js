module.exports = {
  "*.{js,jsx,ts,tsx}": (filenames) => {
    const filtered = filenames.filter((f) => !f.includes("generated"));
    if (filtered.length === 0) return [];
    return [`eslint --fix ${filtered.join(" ")}`, `prettier --write ${filtered.join(" ")}`];
  },
  "*.{json,md,css}": ["prettier --write"],
};
