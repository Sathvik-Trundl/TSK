import { DateTime } from "luxon";

export const getDateIsoMilliSeconds = (date: string) => {
  const millis = DateTime.fromISO(date).toMillis();
  return Number.isNaN(millis) ? 0 : millis;
};

export const formatDateToLuxon = (date: string | DateTime) => {
  if (typeof date === "string") {
    return DateTime.fromISO(date);
  }
  return date;
};

export function decrypt(encrypted: string, encryptionKey: string): string {
  if (typeof encrypted !== "string") {
    throw new Error("Input must be a string");
  }

  // Bitwise XOR decryption
  const encryptedArray: number[] = encrypted
    .split("-")
    .map((code) => parseInt(code, 10));

  let decryptedString = "";

  for (let i = 0; i < encryptedArray.length; i++) {
    const keyCharCode = encryptionKey.charCodeAt(i % encryptionKey.length); // ✅ Use key characters cyclically
    const charCode = encryptedArray[i] ^ keyCharCode; // ✅ XOR with key char code
    decryptedString += String.fromCharCode(charCode);
  }

  // Reverse rotation
  const rotationAmount = 3; // Same rotation used for encryption
  let rotatedString = "";

  for (let i = 0; i < decryptedString.length; i++) {
    const charCode = decryptedString.charCodeAt(i);
    const rotatedCharCode = charCode - rotationAmount;
    rotatedString += String.fromCharCode(rotatedCharCode);
  }

  // Character substitution (reverse)
  const substitutionMap: Record<string, string> = {
    // X: "a",
    // Y: "b",
    // Z: "c",
    // Reverse the substitutions
  };

  let decryptedText = "";

  for (let i = 0; i < rotatedString.length; i++) {
    const char = rotatedString[i];
    decryptedText += substitutionMap[char] ?? char;
  }

  return decryptedText;
}
