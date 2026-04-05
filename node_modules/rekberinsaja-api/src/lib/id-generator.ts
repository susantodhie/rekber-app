/**
 * ID Generators for various entities
 * Generates human-readable codes matching frontend patterns
 */

/**
 * Generate a transaction code like TX-882941-ELK
 * @param category - Category string to derive 3-letter suffix
 */
export function generateTxCode(category: string): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  const suffix = getCategorySuffix(category);
  return `TX-${num}-${suffix}`;
}

/**
 * Generate a user code like #USR-8829-KNT
 */
export function generateUserCode(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  const suffix = generateRandomLetters(3);
  return `#USR-${num}-${suffix}`;
}

/**
 * Get a 3-letter category suffix
 */
function getCategorySuffix(category: string): string {
  const map: Record<string, string> = {
    "elektronik": "ELK",
    "fashion": "FSH",
    "games": "GMS",
    "digital goods & software": "DGS",
    "physical collectibles": "PHC",
    "domain names": "DMN",
    "freelance services": "FLS",
    "game accounts": "GAC",
    "kendaraan": "KDR",
    "properti": "PRP",
    "lainnya": "LNY",
  };

  const key = category.toLowerCase();
  return map[key] || key.substring(0, 3).toUpperCase();
}

/**
 * Generate random uppercase letters
 */
function generateRandomLetters(length: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // Removed I, O to avoid confusion
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
