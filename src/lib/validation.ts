/**
 * Utility functions for real-time form validation (email, phone numbers)
 */

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Validates an email address format.
 * @param email Email string to validate
 * @param required Whether the field is mandatory (default: false)
 */
export function validateEmail(email: string, required = false): ValidationResult {
  const trimmed = email.trim();
  
  if (!trimmed) {
    if (required) {
      return { isValid: false, errorMessage: "L'adresse email est obligatoire." };
    }
    return { isValid: true };
  }

  // Standard RFC 5322 regex pattern for valid email format
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, errorMessage: "Format d'email invalide (ex: nom@domaine.fr)" };
  }

  return { isValid: true };
}

/**
 * Validates a telephone number (French standard or International E.164 format).
 * @param phone Phone string to validate
 * @param required Whether the field is mandatory (default: false)
 */
export function validatePhone(phone: string, required = false): ValidationResult {
  const trimmed = phone.trim();

  if (!trimmed) {
    if (required) {
      return { isValid: false, errorMessage: "Le numéro de téléphone est obligatoire." };
    }
    return { isValid: true };
  }

  // Check for forbidden non-phone characters (letters, special symbols)
  if (/[^\d\s\-\.\+\(\)]/.test(trimmed)) {
    return { isValid: false, errorMessage: "Seuls les chiffres, espaces, +, - et . sont autorisés." };
  }

  // Extract digits only to check length
  const digitsOnly = trimmed.replace(/\D/g, "");

  if (digitsOnly.length < 8 || digitsOnly.length > 15) {
    return { 
      isValid: false, 
      errorMessage: "Numéro invalide (doit comporter entre 8 et 15 chiffres, ex: 06 12 34 56 78)" 
    };
  }

  return { isValid: true };
}
