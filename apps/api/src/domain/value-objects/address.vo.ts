/**
 * 住所 Value Object
 * 国、地域、都市、詳細住所を含む汎用的な住所を表現
 */
export class Address {
  private readonly _postalCode: string;
  private readonly _country: string;
  private readonly _region: string;
  private readonly _city: string;
  private readonly _addressLine: string;
  private readonly _building?: string;

  constructor(
    postalCode: string,
    country: string,
    region: string,
    city: string,
    addressLine: string,
    building?: string
  ) {
    this._postalCode = this.validatePostalCode(postalCode);
    this._country = this.validateCountry(country);
    this._region = this.validateRegion(region);
    this._city = this.validateCity(city);
    this._addressLine = this.validateAddressLine(addressLine);
    this._building = building?.trim() || undefined;
  }

  private validatePostalCode(postalCode: string): string {
    if (!postalCode || typeof postalCode !== 'string') {
      throw new Error('郵便番号は必須です');
    }

    const trimmed = postalCode.trim();
    if (trimmed.length === 0) {
      throw new Error('郵便番号は空にできません');
    }

    // 基本的な郵便番号検証（国ごとにカスタマイズ可能）
    if (trimmed.length > 20) {
      throw new Error('郵便番号が長すぎます');
    }

    return trimmed;
  }

  private validateCountry(country: string): string {
    if (!country || typeof country !== 'string') {
      throw new Error('国名は必須です');
    }

    const trimmed = country.trim();
    if (trimmed.length === 0) {
      throw new Error('国名は空にできません');
    }

    if (trimmed.length > 100) {
      throw new Error('国名が長すぎます');
    }

    return trimmed;
  }

  private validateRegion(region: string): string {
    if (!region || typeof region !== 'string') {
      throw new Error('地域は必須です');
    }

    const trimmed = region.trim();
    if (trimmed.length === 0) {
      throw new Error('地域は空にできません');
    }

    if (trimmed.length > 100) {
      throw new Error('地域名が長すぎます');
    }

    return trimmed;
  }

  private validateCity(city: string): string {
    if (!city || typeof city !== 'string') {
      throw new Error('都市は必須です');
    }

    const trimmed = city.trim();
    if (trimmed.length === 0) {
      throw new Error('都市は空にできません');
    }

    if (trimmed.length > 100) {
      throw new Error('都市名が長すぎます');
    }

    return trimmed;
  }

  private validateAddressLine(addressLine: string): string {
    if (!addressLine || typeof addressLine !== 'string') {
      throw new Error('住所は必須です');
    }

    const trimmed = addressLine.trim();
    if (trimmed.length === 0) {
      throw new Error('住所は空にできません');
    }

    if (trimmed.length > 200) {
      throw new Error('住所が長すぎます');
    }

    return trimmed;
  }

  get postalCode(): string {
    return this._postalCode;
  }

  get country(): string {
    return this._country;
  }

  get region(): string {
    return this._region;
  }

  get city(): string {
    return this._city;
  }

  get addressLine(): string {
    return this._addressLine;
  }

  get building(): string | undefined {
    return this._building;
  }

  /**
   * 完全な住所を一つの文字列として取得
   */
  getFullAddress(): string {
    const parts = [
      this._addressLine,
      this._building,
      this._city,
      this._region,
      this._postalCode,
      this._country,
    ].filter(Boolean);

    return parts.join(', ');
  }

  /**
   * 表示用の住所を取得（カスタマイズ可能なフォーマット）
   */
  getDisplayAddress(): string {
    const parts = [];

    if (this._building) {
      parts.push(this._building);
    }
    parts.push(this._addressLine);
    parts.push(`${this._city}, ${this._region} ${this._postalCode}`);
    parts.push(this._country);

    return parts.join('\n');
  }

  equals(other: Address): boolean {
    return (
      this._postalCode === other._postalCode &&
      this._country === other._country &&
      this._region === other._region &&
      this._city === other._city &&
      this._addressLine === other._addressLine &&
      this._building === other._building
    );
  }

  toString(): string {
    return this.getFullAddress();
  }

  toJSON(): object {
    return {
      postalCode: this._postalCode,
      country: this._country,
      region: this._region,
      city: this._city,
      addressLine: this._addressLine,
      building: this._building,
      fullAddress: this.getFullAddress(),
    };
  }

  static create(
    postalCode: string,
    country: string,
    region: string,
    city: string,
    addressLine: string,
    building?: string
  ): Address {
    return new Address(
      postalCode,
      country,
      region,
      city,
      addressLine,
      building
    );
  }
}
