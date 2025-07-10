/**
 * 通貨フォーマット関連のユーティリティ
 */

/**
 * 日本円をフォーマットする
 */
export function formatJPY(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * 給与範囲をフォーマットする
 */
export function formatSalaryRange(
  min: number,
  max: number,
  period: 'hour' | 'day' | 'month' | 'year' = 'year'
): string {
  const formattedMin = formatJPY(min);
  const formattedMax = formatJPY(max);

  const periodText = {
    hour: '時給',
    day: '日給',
    month: '月給',
    year: '年収',
  }[period];

  if (min === max) {
    return `${periodText} ${formattedMin}`;
  }

  return `${periodText} ${formattedMin} 〜 ${formattedMax}`;
}

/**
 * 数値を万円単位でフォーマットする
 */
export function formatManYen(amount: number): string {
  if (amount >= 10000) {
    const manAmount = amount / 10000;
    if (manAmount % 1 === 0) {
      return `${manAmount}万円`;
    } else {
      return `${manAmount.toFixed(1)}万円`;
    }
  }
  return formatJPY(amount);
}

/**
 * 給与を期間別に変換する
 */
export function convertSalaryPeriod(
  amount: number,
  fromPeriod: 'hour' | 'day' | 'month' | 'year',
  toPeriod: 'hour' | 'day' | 'month' | 'year'
): number {
  // まず年収に統一する
  let yearlyAmount: number;

  switch (fromPeriod) {
    case 'hour':
      yearlyAmount = amount * 8 * 22 * 12; // 8時間/日 × 22日/月 × 12ヶ月
      break;
    case 'day':
      yearlyAmount = amount * 22 * 12; // 22日/月 × 12ヶ月
      break;
    case 'month':
      yearlyAmount = amount * 12; // 12ヶ月
      break;
    case 'year':
      yearlyAmount = amount;
      break;
  }

  // 目標の期間に変換
  switch (toPeriod) {
    case 'hour':
      return Math.round(yearlyAmount / (8 * 22 * 12));
    case 'day':
      return Math.round(yearlyAmount / (22 * 12));
    case 'month':
      return Math.round(yearlyAmount / 12);
    case 'year':
      return Math.round(yearlyAmount);
  }
}
