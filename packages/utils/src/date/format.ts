import {
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
  isThisYear,
} from 'date-fns';
import { ja } from 'date-fns/locale';

/**
 * 日付フォーマット関連のユーティリティ
 */

/**
 * 日付を日本語でフォーマットする
 */
export function formatDate(
  date: Date | string,
  pattern: string = 'yyyy年MM月dd日'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, pattern, { locale: ja });
}

/**
 * 相対的な時間をフォーマットする（例: 2時間前、3日前）
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: ja });
}

/**
 * 日付を適切なフォーマットで表示する
 * - 今日: 時刻のみ
 * - 昨日: 昨日 HH:mm
 * - 今年: MM月dd日
 * - それ以外: yyyy年MM月dd日
 */
export function formatSmartDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isToday(dateObj)) {
    return format(dateObj, 'HH:mm', { locale: ja });
  }

  if (isYesterday(dateObj)) {
    return `昨日 ${format(dateObj, 'HH:mm', { locale: ja })}`;
  }

  if (isThisYear(dateObj)) {
    return format(dateObj, 'MM月dd日', { locale: ja });
  }

  return format(dateObj, 'yyyy年MM月dd日', { locale: ja });
}

/**
 * 期間をフォーマットする（開始日〜終了日）
 */
export function formatDateRange(
  startDate: Date | string,
  endDate?: Date | string | null,
  isCurrent: boolean = false
): string {
  const start = formatDate(startDate, 'yyyy年MM月');

  if (isCurrent || !endDate) {
    return `${start} 〜 現在`;
  }

  const end = formatDate(endDate, 'yyyy年MM月');
  return `${start} 〜 ${end}`;
}

/**
 * 年月のみをフォーマットする
 */
export function formatYearMonth(date: Date | string): string {
  return formatDate(date, 'yyyy年MM月');
}

/**
 * 年のみをフォーマットする
 */
export function formatYear(date: Date | string): string {
  return formatDate(date, 'yyyy年');
}

/**
 * 時刻を含む日時をフォーマットする
 */
export function formatDateTime(date: Date | string): string {
  return formatDate(date, 'yyyy年MM月dd日 HH:mm');
}

/**
 * ISO日付文字列から Date オブジェクトを安全に作成
 */
export function parseDate(dateString: string): Date | null {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

/**
 * 日付を YYYY-MM-DD 形式でフォーマット（HTMLのdate input用）
 */
export function formatDateForInput(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'yyyy-MM-dd');
}

/**
 * 経験年数を計算する
 */
export function calculateExperienceYears(
  startDate: Date | string,
  endDate?: Date | string | null
): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = endDate
    ? typeof endDate === 'string'
      ? new Date(endDate)
      : endDate
    : new Date();

  const diffInMs = end.getTime() - start.getTime();
  const diffInYears = diffInMs / (1000 * 60 * 60 * 24 * 365.25);

  return Math.floor(diffInYears * 10) / 10; // 小数点第1位まで
}

/**
 * 年齢を計算する
 */
export function calculateAge(birthDate: Date | string): number {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}
