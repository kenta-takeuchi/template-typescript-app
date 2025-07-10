/**
 * Email Value Object
 * Represents a valid email address with business rules
 */
export class Email {
  private readonly _value: string;

  constructor(value: string) {
    this._value = this.validate(value);
  }

  private validate(value: string): string {
    if (!value || typeof value !== 'string') {
      throw new Error('Email cannot be empty');
    }

    const trimmedValue = value.trim().toLowerCase();

    if (!this.isValidFormat(trimmedValue)) {
      throw new Error('Invalid email format');
    }

    if (trimmedValue.length > 254) {
      throw new Error('Email address is too long (max 254 characters)');
    }

    return trimmedValue;
  }

  private isValidFormat(email: string): boolean {
    // RFC 5322 compliant email validation
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  }

  get value(): string {
    return this._value;
  }

  get domain(): string {
    return this._value.split('@')[1];
  }

  get localPart(): string {
    return this._value.split('@')[0];
  }

  /**
   * Check if email belongs to a corporate domain
   */
  isCorporateEmail(): boolean {
    const personalDomains = [
      'gmail.com',
      'yahoo.com',
      'hotmail.com',
      'outlook.com',
      'icloud.com',
      'live.com',
      'aol.com',
    ];
    return !personalDomains.includes(this.domain);
  }

  /**
   * Check if email is from a Japanese domain
   */
  isJapaneseDomain(): boolean {
    const japaneseDomains = [
      '.jp',
      '.co.jp',
      '.ne.jp',
      '.or.jp',
      '.ac.jp',
      '.go.jp',
    ];
    return japaneseDomains.some(domain => this.domain.endsWith(domain));
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  toJSON(): string {
    return this._value;
  }

  static fromString(value: string): Email {
    return new Email(value);
  }

  static isValid(value: string): boolean {
    try {
      new Email(value);
      return true;
    } catch {
      return false;
    }
  }
}
