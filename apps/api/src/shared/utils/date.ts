/**
 * Date utility functions for Japanese market
 */

/**
 * Date utility class
 */
export class DateUtils {
  /**
   * Get current date in Japan timezone
   */
  static getCurrentJapanDate(): Date {
    return new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' })
    );
  }

  /**
   * Format date for Japanese display
   */
  static formatForJapaneseDisplay(date: Date): string {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  }

  /**
   * Format date with Japanese era
   */
  static formatWithJapaneseEra(date: Date): string {
    return date.toLocaleDateString('ja-JP', {
      era: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      calendar: 'japanese',
    });
  }

  /**
   * Format date for business use (YYYY/MM/DD)
   */
  static formatForBusiness(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  }

  /**
   * Format date and time for business use
   */
  static formatDateTimeForBusiness(date: Date): string {
    const dateStr = this.formatForBusiness(date);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${dateStr} ${hours}:${minutes}`;
  }

  /**
   * Check if date is a Japanese holiday (basic implementation)
   */
  static isJapaneseHoliday(date: Date): boolean {
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // Basic national holidays (fixed dates only)
    const fixedHolidays = [
      { month: 1, day: 1 }, // New Year's Day
      { month: 2, day: 11 }, // National Foundation Day
      { month: 4, day: 29 }, // Showa Day
      { month: 5, day: 3 }, // Constitution Memorial Day
      { month: 5, day: 4 }, // Greenery Day
      { month: 5, day: 5 }, // Children's Day
      { month: 8, day: 11 }, // Mountain Day
      { month: 11, day: 3 }, // Culture Day
      { month: 11, day: 23 }, // Labor Thanksgiving Day
      { month: 12, day: 23 }, // Emperor's Birthday
    ];

    return fixedHolidays.some(
      holiday => holiday.month === month && holiday.day === day
    );
  }

  /**
   * Check if date is a weekend (Saturday or Sunday)
   */
  static isWeekend(date: Date): boolean {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
  }

  /**
   * Check if date is a business day (not weekend or holiday)
   */
  static isBusinessDay(date: Date): boolean {
    return !this.isWeekend(date) && !this.isJapaneseHoliday(date);
  }

  /**
   * Get next business day
   */
  static getNextBusinessDay(date: Date): Date {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    while (!this.isBusinessDay(nextDay)) {
      nextDay.setDate(nextDay.getDate() + 1);
    }

    return nextDay;
  }

  /**
   * Get previous business day
   */
  static getPreviousBusinessDay(date: Date): Date {
    const prevDay = new Date(date);
    prevDay.setDate(prevDay.getDate() - 1);

    while (!this.isBusinessDay(prevDay)) {
      prevDay.setDate(prevDay.getDate() - 1);
    }

    return prevDay;
  }

  /**
   * Calculate age from birth date
   */
  static calculateAge(birthDate: Date): number {
    const today = this.getCurrentJapanDate();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  /**
   * Calculate years of experience from start date
   */
  static calculateExperience(startDate: Date, endDate?: Date): number {
    const end = endDate || this.getCurrentJapanDate();
    let years = end.getFullYear() - startDate.getFullYear();
    const monthDiff = end.getMonth() - startDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && end.getDate() < startDate.getDate())
    ) {
      years--;
    }

    return Math.max(0, years);
  }

  /**
   * Get start of Japanese fiscal year (April 1st)
   */
  static getJapaneseFiscalYearStart(year?: number): Date {
    const targetYear = year || this.getCurrentJapanDate().getFullYear();
    return new Date(targetYear, 3, 1); // April 1st (month index 3)
  }

  /**
   * Get end of Japanese fiscal year (March 31st)
   */
  static getJapaneseFiscalYearEnd(year?: number): Date {
    const targetYear = year || this.getCurrentJapanDate().getFullYear();
    return new Date(targetYear + 1, 2, 31); // March 31st of next year
  }

  /**
   * Check if date is within current Japanese fiscal year
   */
  static isInCurrentFiscalYear(date: Date): boolean {
    const currentYear = this.getCurrentJapanDate().getFullYear();
    const fiscalStart = this.getJapaneseFiscalYearStart(currentYear);
    const fiscalEnd = this.getJapaneseFiscalYearEnd(currentYear);

    return date >= fiscalStart && date <= fiscalEnd;
  }

  /**
   * Parse Japanese date string (YYYY/MM/DD or YYYY年MM月DD日)
   */
  static parseJapaneseDate(dateString: string): Date {
    // Handle YYYY年MM月DD日 format
    let cleaned = dateString
      .replace(/年/g, '/')
      .replace(/月/g, '/')
      .replace(/日/g, '');

    // Handle YYYY/MM/DD format
    const parts = cleaned.split('/');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      const day = parseInt(parts[2], 10);

      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    throw new Error(`Invalid Japanese date format: ${dateString}`);
  }

  /**
   * Get relative time string in Japanese
   */
  static getRelativeTimeJapanese(date: Date): string {
    const now = this.getCurrentJapanDate();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'たった今';
    if (diffMinutes < 60) return `${diffMinutes}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}ヶ月前`;

    return `${Math.floor(diffDays / 365)}年前`;
  }
}
