export const generateIdenticon = (seed = "default") => {
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate color
  const h = Math.abs(hash) % 360;
  const color = `hsl(${h}, 70%, 50%)`;

  // 5x5 grid (GitHub style uses 5x5 with horizontal symmetry)
  // We only need to generate a 3x5 grid and mirror it
  const size = 5;
  const blocks = [];
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < Math.ceil(size / 2); x++) {
      // Use bits of hash to determine if block is filled
      const bitIndex = y * Math.ceil(size / 2) + x;
      const isFilled = (hash >> bitIndex) & 1;
      
      if (isFilled) {
        // Draw left side
        blocks.push(`<rect x="${x * 20}" y="${y * 20}" width="20" height="20" fill="${color}" />`);
        // Draw mirrored right side (if not center column)
        if (x !== 2) {
          blocks.push(`<rect x="${(4 - x) * 20}" y="${y * 20}" width="20" height="20" fill="${color}" />`);
        }
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100" height="100" fill="#f0f0f0" />
    ${blocks.join('')}
  </svg>`;

  // Return as data URI
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};
