/**
 * Date Range Value Object
 * Represents a period between two dates with validation
 */
export class DateRange {
  private readonly _startDate: Date;
  private readonly _endDate: Date;

  constructor(startDate: Date, endDate: Date) {
    this._startDate = this.validateDate(startDate, 'Start date');
    this._endDate = this.validateDate(endDate, 'End date');
    this.validateRange();
  }

  private validateDate(date: Date, fieldName: string): Date {
    if (!(date instanceof Date)) {
      throw new Error(`${fieldName} must be a valid Date object`);
    }

    if (isNaN(date.getTime())) {
      throw new Error(`${fieldName} is invalid`);
    }

    return new Date(date.getTime());
  }

  private validateRange(): void {
    if (this._startDate >= this._endDate) {
      throw new Error('Start date must be before end date');
    }

    // Check for reasonable range (not more than 100 years)
    const maxRange = 100 * 365 * 24 * 60 * 60 * 1000; // 100 years in milliseconds
    if (this._endDate.getTime() - this._startDate.getTime() > maxRange) {
      throw new Error('Date range is too large (maximum 100 years)');
    }
  }

  get startDate(): Date {
    return new Date(this._startDate.getTime());
  }

  get endDate(): Date {
    return new Date(this._endDate.getTime());
  }

  /**
   * Get duration in days
   */
  getDurationInDays(): number {
    const diffTime = this._endDate.getTime() - this._startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get duration in months (approximate)
   */
  getDurationInMonths(): number {
    const startYear = this._startDate.getFullYear();
    const startMonth = this._startDate.getMonth();
    const endYear = this._endDate.getFullYear();
    const endMonth = this._endDate.getMonth();

    return (endYear - startYear) * 12 + (endMonth - startMonth);
  }

  /**
   * Get duration in years (approximate)
   */
  getDurationInYears(): number {
    return Math.floor(this.getDurationInMonths() / 12);
  }

  /**
   * Check if a date falls within this range
   */
  contains(date: Date): boolean {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return false;
    }

    return date >= this._startDate && date <= this._endDate;
  }

  /**
   * Check if this range overlaps with another range
   */
  overlaps(other: DateRange): boolean {
    return (
      this._startDate <= other._endDate && this._endDate >= other._startDate
    );
  }

  /**
   * Check if this range is completely before another range
   */
  isBefore(other: DateRange): boolean {
    return this._endDate < other._startDate;
  }

  /**
   * Check if this range is completely after another range
   */
  isAfter(other: DateRange): boolean {
    return this._startDate > other._endDate;
  }

  /**
   * Check if this range is in the past
   */
  isInPast(): boolean {
    return this._endDate < new Date();
  }

  /**
   * Check if this range is in the future
   */
  isInFuture(): boolean {
    return this._startDate > new Date();
  }

  /**
   * Check if this range includes the current date
   */
  includesCurrentDate(): boolean {
    return this.contains(new Date());
  }

  /**
   * Format date range for display
   */
  formatForDisplay(): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    const startFormatted = this._startDate.toLocaleDateString('ja-JP', options);
    const endFormatted = this._endDate.toLocaleDateString('ja-JP', options);

    return `${startFormatted} 〜 ${endFormatted}`;
  }

  /**
   * Format date range for Japanese display with era names
   */
  formatForJapaneseDisplay(): string {
    const options: Intl.DateTimeFormatOptions = {
      era: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      calendar: 'japanese',
    };

    const startFormatted = this._startDate.toLocaleDateString('ja-JP', options);
    const endFormatted = this._endDate.toLocaleDateString('ja-JP', options);

    return `${startFormatted} 〜 ${endFormatted}`;
  }

  equals(other: DateRange): boolean {
    return (
      this._startDate.getTime() === other._startDate.getTime() &&
      this._endDate.getTime() === other._endDate.getTime()
    );
  }

  toString(): string {
    return this.formatForDisplay();
  }

  toJSON(): object {
    return {
      startDate: this._startDate.toISOString(),
      endDate: this._endDate.toISOString(),
      durationInDays: this.getDurationInDays(),
      durationInMonths: this.getDurationInMonths(),
      durationInYears: this.getDurationInYears(),
      formatted: this.formatForDisplay(),
      includesCurrentDate: this.includesCurrentDate(),
      isInPast: this.isInPast(),
      isInFuture: this.isInFuture(),
    };
  }

  static create(startDate: Date, endDate: Date): DateRange {
    return new DateRange(startDate, endDate);
  }

  static fromStrings(
    startDateString: string,
    endDateString: string
  ): DateRange {
    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);
    return new DateRange(startDate, endDate);
  }

  static createFromDuration(
    startDate: Date,
    durationInDays: number
  ): DateRange {
    const endDate = new Date(
      startDate.getTime() + durationInDays * 24 * 60 * 60 * 1000
    );
    return new DateRange(startDate, endDate);
  }
}
