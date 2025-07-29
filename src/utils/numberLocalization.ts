/**
 * Number localization utility for Hindi and Marathi
 */

// Hindi numerals (Devanagari)
const hindiNumerals = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

// Marathi numerals (same as Hindi - Devanagari script)
const marathiNumerals = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

// English numerals
const englishNumerals = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * Convert English numbers to localized numbers
 */
export const localizeNumber = (number: string | number, language: string): string => {
  // Handle null, undefined, or empty values
  if (number === null || number === undefined || number === '') {
    return '0';
  }

  const numStr = number.toString();

  switch (language) {
    case 'hi': // Hindi
      return numStr.replace(/[0-9]/g, (digit) => hindiNumerals[parseInt(digit)]);

    case 'mr': // Marathi
      return numStr.replace(/[0-9]/g, (digit) => marathiNumerals[parseInt(digit)]);

    default: // English
      return numStr;
  }
};

/**
 * Convert localized numbers back to English numbers
 */
export const delocalizeNumber = (localizedNumber: string, language: string): string => {
  let result = localizedNumber;
  
  switch (language) {
    case 'hi': // Hindi
      hindiNumerals.forEach((hindiDigit, index) => {
        result = result.replace(new RegExp(hindiDigit, 'g'), englishNumerals[index]);
      });
      break;
    
    case 'mr': // Marathi
      marathiNumerals.forEach((marathiDigit, index) => {
        result = result.replace(new RegExp(marathiDigit, 'g'), englishNumerals[index]);
      });
      break;
  }
  
  return result;
};

/**
 * Format currency with localized numbers
 */
export const localizeCurrency = (amount: number, language: string, currency: string = '₹'): string => {
  const formattedAmount = amount.toLocaleString('en-IN');
  const localizedAmount = localizeNumber(formattedAmount, language);
  return `${currency}${localizedAmount}`;
};

/**
 * Format phone number with localized numbers
 */
export const localizePhoneNumber = (phoneNumber: string, language: string): string => {
  if (!phoneNumber) return '';
  return localizeNumber(phoneNumber, language);
};

/**
 * Format age with localized numbers
 */
export const localizeAge = (age: number, language: string): string => {
  return localizeNumber(age, language);
};

/**
 * Format pincode with localized numbers
 */
export const localizePincode = (pincode: string, language: string): string => {
  if (!pincode) return '';
  return localizeNumber(pincode, language);
};
