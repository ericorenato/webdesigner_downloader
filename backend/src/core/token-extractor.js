import * as csstree from "css-tree";

export function extract(cssTexts) {
  const colors = new Map();
  const fonts = new Map();
  const fontSizes = new Map();
  const fontWeights = new Map();
  const spacings = new Map();
  const breakpoints = new Set();
  const shadows = new Map();
  const borderRadii = new Map();

  for (const css of cssTexts) {
    try {
      const ast = csstree.parse(css);
      csstree.walk(ast, {
        visit: "Declaration",
        enter(node) {
          const prop = node.property;
          const value = csstree.generate(node.value);

          // Colors
          if (isColorProperty(prop)) {
            extractColors(value).forEach((c) => {
              const key = normalizeColor(c);
              colors.set(key, (colors.get(key) || 0) + 1);
            });
          }

          // Font families
          if (prop === "font-family") {
            const families = value.split(",").map((f) => f.trim().replace(/['"]/g, ""));
            families.forEach((f) => {
              if (f && !isGenericFamily(f)) {
                fonts.set(f, (fonts.get(f) || 0) + 1);
              }
            });
          }

          // Font sizes
          if (prop === "font-size") {
            fontSizes.set(value, (fontSizes.get(value) || 0) + 1);
          }

          // Font weights
          if (prop === "font-weight") {
            fontWeights.set(value, (fontWeights.get(value) || 0) + 1);
          }

          // Spacing (padding, margin, gap)
          if (/^(padding|margin|gap)(-top|-right|-bottom|-left)?$/.test(prop)) {
            const vals = value.split(/\s+/);
            vals.forEach((v) => {
              if (v !== "0" && v !== "auto" && v !== "inherit") {
                spacings.set(v, (spacings.get(v) || 0) + 1);
              }
            });
          }

          // Shadows
          if (prop === "box-shadow" && value !== "none") {
            shadows.set(value, (shadows.get(value) || 0) + 1);
          }

          // Border radius
          if (prop === "border-radius" && value !== "0") {
            borderRadii.set(value, (borderRadii.get(value) || 0) + 1);
          }
        },
      });

      // Media queries / breakpoints
      csstree.walk(ast, {
        visit: "Atrule",
        enter(node) {
          if (node.name === "media" && node.prelude) {
            const media = csstree.generate(node.prelude);
            const bpMatch = media.match(/(\d+)\s*px/g);
            if (bpMatch) {
              bpMatch.forEach((bp) => breakpoints.add(bp));
            }
          }
        },
      });
    } catch {
      // Skip unparseable CSS
    }
  }

  return {
    colors: sortByFrequency(colors).map(([value, count]) => ({ value, count })),
    fonts: sortByFrequency(fonts).map(([family, count]) => ({ family, count })),
    fontSizes: sortByFrequency(fontSizes).map(([value, count]) => ({ value, count })),
    fontWeights: sortByFrequency(fontWeights).map(([value, count]) => ({ value, count })),
    spacings: sortByFrequency(spacings).map(([value, count]) => ({ value, count })),
    breakpoints: [...breakpoints].sort((a, b) => parseInt(a) - parseInt(b)),
    shadows: sortByFrequency(shadows).map(([value, count]) => ({ value, count })),
    borderRadii: sortByFrequency(borderRadii).map(([value, count]) => ({ value, count })),
  };
}

function isColorProperty(prop) {
  return /^(color|background-color|background|border-color|border|outline-color|fill|stroke|box-shadow|text-shadow|text-decoration-color)$/.test(prop);
}

function extractColors(value) {
  const colors = [];
  // Hex colors
  const hexRe = /#([0-9a-fA-F]{3,8})\b/g;
  let m;
  while ((m = hexRe.exec(value)) !== null) colors.push(m[0]);

  // rgb/rgba
  const rgbRe = /rgba?\([^)]+\)/g;
  while ((m = rgbRe.exec(value)) !== null) colors.push(m[0]);

  // hsl/hsla
  const hslRe = /hsla?\([^)]+\)/g;
  while ((m = hslRe.exec(value)) !== null) colors.push(m[0]);

  return colors;
}

function normalizeColor(color) {
  return color.toLowerCase().replace(/\s+/g, "");
}

function isGenericFamily(f) {
  return /^(serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-serif|ui-sans-serif|ui-monospace|ui-rounded|emoji|math|fangsong)$/i.test(f);
}

function sortByFrequency(map) {
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}
