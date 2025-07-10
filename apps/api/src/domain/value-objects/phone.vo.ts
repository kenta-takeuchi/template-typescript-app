/**
 * Phone Number Value Object
 * Represents a valid phone number with Japanese market specific rules
 */
export class PhoneNumber {
  private readonly _value: string;
  private readonly _countryCode: string;
  private readonly _nationalNumber: string;

  constructor(value: string, countryCode = '+81') {
    const { normalizedValue, extractedCountryCode, nationalNumber } =
      this.parse(value, countryCode);
    this._value = normalizedValue;
    this._countryCode = extractedCountryCode;
    this._nationalNumber = nationalNumber;
    this.validate();
  }

  private parse(
    value: string,
    defaultCountryCode: string
  ): {
    normalizedValue: string;
    extractedCountryCode: string;
    nationalNumber: string;
  } {
    if (!value || typeof value !== 'string') {
      throw new Error('Phone number cannot be empty');
    }

    // Remove all non-digit characters except +
    let cleaned = value.replace(/[^\d+]/g, '');

    // Handle Japanese phone number formats
    if (cleaned.startsWith('0')) {
      // Domestic format (starts with 0)
      cleaned = '+81' + cleaned.substring(1);
    } else if (cleaned.startsWith('81') && !cleaned.startsWith('+')) {
      // International format without +
      cleaned = '+' + cleaned;
    } else if (!cleaned.startsWith('+')) {
      // No country code, assume default
      cleaned = defaultCountryCode + cleaned;
    }

    // Extract country code and national number
    const match = cleaned.match(/^\+(\d{1,3})(\d+)$/);
    if (!match) {
      throw new Error('Invalid phone number format');
    }

    const [, countryCode, nationalNumber] = match;
    return {
      normalizedValue: cleaned,
      extractedCountryCode: '+' + countryCode,
      nationalNumber,
    };
  }

  private validate(): void {
    // Validate Japanese phone numbers specifically
    if (this._countryCode === '+81') {
      this.validateJapaneseNumber();
    } else {
      this.validateInternationalNumber();
    }
  }

  private validateJapaneseNumber(): void {
    const nationalNumber = this._nationalNumber;

    // Mobile numbers: 70, 80, 90 (11 digits total with area code)
    const mobilePattern = /^[789]0\d{8}$/;

    // Landline numbers: Various patterns
    const landlinePatterns = [
      /^[1-6]\d{8,9}$/, // Regional numbers
      /^50\d{8}$/, // IP phone
    ];

    const isMobile = mobilePattern.test(nationalNumber);
    const isLandline = landlinePatterns.some(pattern =>
      pattern.test(nationalNumber)
    );

    if (!isMobile && !isLandline) {
      throw new Error('Invalid Japanese phone number format');
    }

    // Length validation
    if (nationalNumber.length < 9 || nationalNumber.length > 10) {
      throw new Error('Japanese phone number must be 9-10 digits');
    }
  }

  private validateInternationalNumber(): void {
    // Basic international number validation
    if (this._nationalNumber.length < 7 || this._nationalNumber.length > 15) {
      throw new Error('International phone number must be 7-15 digits');
    }
  }

  get value(): string {
    return this._value;
  }

  get countryCode(): string {
    return this._countryCode;
  }

  get nationalNumber(): string {
    return this._nationalNumber;
  }

  /**
   * Check if this is a Japanese mobile number
   */
  isJapaneseMobile(): boolean {
    if (this._countryCode !== '+81') return false;
    return /^[789]0\d{8}$/.test(this._nationalNumber);
  }

  /**
   * Check if this is a Japanese landline number
   */
  isJapaneseLandline(): boolean {
    if (this._countryCode !== '+81') return false;
    return !this.isJapaneseMobile() && this._nationalNumber.length >= 9;
  }

  /**
   * Format for display (Japanese style)
   */
  formatForDisplay(): string {
    if (this._countryCode === '+81') {
      const national = this._nationalNumber;
      if (this.isJapaneseMobile()) {
        // Mobile: 090-1234-5678
        return `0${national.substring(0, 2)}-${national.substring(2, 6)}-${national.substring(6)}`;
      } else {
        // Landline: varies by region
        if (national.length === 9) {
          return `0${national.substring(0, 1)}-${national.substring(1, 5)}-${national.substring(5)}`;
        } else {
          return `0${national.substring(0, 2)}-${national.substring(2, 6)}-${national.substring(6)}`;
        }
      }
    }
    return this._value;
  }

  /**
   * Format for international display
   */
  formatInternational(): string {
    return this._value;
  }

  equals(other: PhoneNumber): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  toJSON(): string {
    return this._value;
  }

  static fromString(value: string, countryCode?: string): PhoneNumber {
    return new PhoneNumber(value, countryCode);
  }

  static isValid(value: string, countryCode = '+81'): boolean {
    try {
      new PhoneNumber(value, countryCode);
      return true;
    } catch {
      return false;
    }
  }
}
