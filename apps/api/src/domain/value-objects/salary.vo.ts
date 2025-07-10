/**
 * Salary Value Object
 * Represents salary information in Japanese Yen (JPY) for the Japanese market
 */
export class Salary {
  private readonly _amount: number;
  private readonly _period: SalaryPeriod;

  constructor(amount: number, period: SalaryPeriod = SalaryPeriod.YEARLY) {
    this._amount = this.validateAmount(amount);
    this._period = period;
  }

  private validateAmount(amount: number): number {
    if (typeof amount !== 'number' || isNaN(amount)) {
      throw new Error('給与額は有効な数値である必要があります');
    }

    if (amount < 0) {
      throw new Error('給与額は負の値にできません');
    }

    if (amount > 100_000_000) {
      throw new Error('給与額が非現実的に高額です');
    }

    // Round to nearest yen
    return Math.round(amount);
  }

  get amount(): number {
    return this._amount;
  }

  get period(): SalaryPeriod {
    return this._period;
  }

  /**
   * Convert to yearly amount
   */
  toYearly(): number {
    switch (this._period) {
      case SalaryPeriod.HOURLY:
        return this._amount * 8 * 5 * 52; // 8時間/日, 5日/週, 52週/年
      case SalaryPeriod.DAILY:
        return this._amount * 5 * 52; // 5日/週, 52週/年
      case SalaryPeriod.MONTHLY:
        return this._amount * 12;
      case SalaryPeriod.YEARLY:
        return this._amount;
      default:
        throw new Error(`サポートされていない給与期間: ${this._period}`);
    }
  }

  /**
   * Convert to monthly amount
   */
  toMonthly(): number {
    return Math.round(this.toYearly() / 12);
  }

  /**
   * Convert to daily amount (assuming 22 working days per month)
   */
  toDaily(): number {
    return Math.round(this.toMonthly() / 22);
  }

  /**
   * Convert to hourly amount (assuming 8 hours per day)
   */
  toHourly(): number {
    return Math.round(this.toDaily() / 8);
  }

  /**
   * Format salary for display in Japanese style
   */
  formatForDisplay(): string {
    const formattedAmount = this.formatAmount(this._amount);
    const periodSuffix = this.getPeriodSuffix();

    return `${formattedAmount}円${periodSuffix}`;
  }

  /**
   * Format yearly salary for display
   */
  formatYearlyForDisplay(): string {
    const yearlyAmount = this.toYearly();
    const formattedAmount = this.formatAmount(yearlyAmount);

    return `年収${formattedAmount}円`;
  }

  private formatAmount(amount: number): string {
    // Format with Japanese number grouping (万単位)
    if (amount >= 10_000) {
      const man = Math.floor(amount / 10_000);
      const remainder = amount % 10_000;
      if (remainder === 0) {
        return `${man}万`;
      } else {
        return `${man}万${remainder.toLocaleString('ja-JP')}`;
      }
    }

    return amount.toLocaleString('ja-JP');
  }

  private getPeriodSuffix(): string {
    switch (this._period) {
      case SalaryPeriod.HOURLY:
        return '/時間';
      case SalaryPeriod.DAILY:
        return '/日';
      case SalaryPeriod.MONTHLY:
        return '/月';
      case SalaryPeriod.YEARLY:
        return '/年';
      default:
        return '';
    }
  }

  /**
   * Get salary level category based on amount
   */
  getSalaryLevel(): string {
    const yearlyAmount = this.toYearly();

    if (yearlyAmount < 3_000_000) return '低年収';
    if (yearlyAmount < 5_000_000) return '平均的';
    if (yearlyAmount < 8_000_000) return '高年収';
    if (yearlyAmount < 12_000_000) return 'エグゼクティブ';
    return '最高年収';
  }

  /**
   * Compare with another salary (converts both to yearly for comparison)
   */
  compareTo(other: Salary): number {
    const thisYearly = this.toYearly();
    const otherYearly = other.toYearly();

    if (thisYearly < otherYearly) return -1;
    if (thisYearly > otherYearly) return 1;
    return 0;
  }

  /**
   * Check if salary is above market average for Japan
   */
  isAboveMarketAverage(): boolean {
    // Average salary in Japan is around 4.3M yen
    return this.toYearly() > 4_300_000;
  }

  equals(other: Salary): boolean {
    return this._amount === other._amount && this._period === other._period;
  }

  toString(): string {
    return this.formatForDisplay();
  }

  toJSON(): object {
    return {
      amount: this._amount,
      period: this._period,
      yearly: this.toYearly(),
      monthly: this.toMonthly(),
      formatted: this.formatForDisplay(),
      yearlyFormatted: this.formatYearlyForDisplay(),
      salaryLevel: this.getSalaryLevel(),
      isAboveMarketAverage: this.isAboveMarketAverage(),
    };
  }

  static fromYearly(amount: number): Salary {
    return new Salary(amount, SalaryPeriod.YEARLY);
  }

  static fromMonthly(amount: number): Salary {
    return new Salary(amount, SalaryPeriod.MONTHLY);
  }

  static fromDaily(amount: number): Salary {
    return new Salary(amount, SalaryPeriod.DAILY);
  }

  static fromHourly(amount: number): Salary {
    return new Salary(amount, SalaryPeriod.HOURLY);
  }
}

export enum SalaryPeriod {
  HOURLY = 'hourly',
  DAILY = 'daily',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}
