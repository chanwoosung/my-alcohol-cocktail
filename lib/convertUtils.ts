/**
 * Converts cl or dl to oz, rounds to the nearest predefined value, and displays ml in parentheses.
 * @param value - The original value in cl or dl.
 * @param unit - The unit of the value ('cl' or 'dl').
 * @returns A string showing the oz value and the equivalent ml in parentheses.
 */
export const convertToOzWithMl = (measure: string): string => {
    const clToOz = 0.33814;
    const dlToOz = 3.3814;
  
    // Extract value and unit from measure
    const match = measure.match(/([\d.]+)\s*(cl|dl)/i);
    if (!match) return measure; // Return as-is if no match
  
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, value, unit] = match;
    const numericValue = parseFloat(value);
  
    // Perform conversion
    let oz = 0;
    let ml = 0;
    if (unit.toLowerCase() === "cl") {
      oz = numericValue * clToOz;
      ml = numericValue * 10;
    } else if (unit.toLowerCase() === "dl") {
      oz = numericValue * dlToOz;
      ml = numericValue * 100;
    }
  
    // Round oz to nearest predefined value
    if (oz >= 0 && oz <= 0.2) {
      oz = 0;
    } else if (oz > 0.2 && oz <= 0.7) {
      oz = 0.5;
    } else if (oz > 0.7 && oz <= 1.0) {
      oz = 1;
    } else {
      oz = Math.round(oz);
    }
  
    // Return formatted string
    return `${oz} oz (${Math.floor(ml)} ml)`;
};