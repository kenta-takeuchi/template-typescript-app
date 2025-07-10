/**
 * 文字列フォーマット関連のユーティリティ
 */

/**
 * 文字列を指定した長さで切り詰める
 */
export function truncate(
  text: string,
  length: number,
  suffix: string = '...'
): string {
  if (text.length <= length) {
    return text;
  }
  return text.slice(0, length - suffix.length) + suffix;
}

/**
 * 文字列をケバブケースに変換
 */
export function toKebabCase(text: string): string {
  return text
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * 文字列をキャメルケースに変換
 */
export function toCamelCase(text: string): string {
  return text
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/^[A-Z]/, char => char.toLowerCase());
}

/**
 * 文字列をパスカルケースに変換
 */
export function toPascalCase(text: string): string {
  const camelCase = toCamelCase(text);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
}

/**
 * 文字列をスネークケースに変換
 */
export function toSnakeCase(text: string): string {
  return text
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toLowerCase();
}

/**
 * 文字列から数字のみを抽出
 */
export function extractNumbers(text: string): string {
  return text.replace(/[^\d]/g, '');
}

/**
 * 電話番号をフォーマット
 */
export function formatPhoneNumber(phone: string): string {
  const numbers = extractNumbers(phone);

  // 携帯電話番号の場合 (090, 080, 070)
  if (numbers.match(/^(090|080|070)/)) {
    return numbers.replace(/^(\d{3})(\d{4})(\d{4})$/, '$1-$2-$3');
  }

  // 固定電話番号の場合
  if (numbers.length === 10) {
    return numbers.replace(/^(\d{2,4})(\d{2,4})(\d{4})$/, '$1-$2-$3');
  }

  if (numbers.length === 11) {
    return numbers.replace(/^(\d{3,5})(\d{2,4})(\d{4})$/, '$1-$2-$3');
  }

  return phone; // フォーマットできない場合はそのまま返す
}

/**
 * 郵便番号をフォーマット
 */
export function formatPostalCode(postalCode: string): string {
  const numbers = extractNumbers(postalCode);
  if (numbers.length === 7) {
    return numbers.replace(/^(\d{3})(\d{4})$/, '$1-$2');
  }
  return postalCode;
}

/**
 * ひらがなをカタカナに変換
 */
export function hiraganaToKatakana(text: string): string {
  return text.replace(/[\u3041-\u3096]/g, char =>
    String.fromCharCode(char.charCodeAt(0) + 0x60)
  );
}

/**
 * カタカナをひらがなに変換
 */
export function katakanaToHiragana(text: string): string {
  return text.replace(/[\u30A1-\u30F6]/g, char =>
    String.fromCharCode(char.charCodeAt(0) - 0x60)
  );
}

/**
 * 全角英数字を半角に変換
 */
export function toHalfWidth(text: string): string {
  return text.replace(/[Ａ-Ｚａ-ｚ０-９]/g, char =>
    String.fromCharCode(char.charCodeAt(0) - 0xfee0)
  );
}

/**
 * 半角英数字を全角に変換
 */
export function toFullWidth(text: string): string {
  return text.replace(/[A-Za-z0-9]/g, char =>
    String.fromCharCode(char.charCodeAt(0) + 0xfee0)
  );
}

/**
 * 文字列をSlugに変換（URL用）
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // 特殊文字を削除
    .replace(/[\s_-]+/g, '-') // スペース、アンダースコア、ハイフンをハイフンに統一
    .replace(/^-+|-+$/g, ''); // 先頭と末尾のハイフンを削除
}

/**
 * 初期値を取得（名前から）
 */
export function getInitials(name: string, maxLength: number = 2): string {
  return name
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, maxLength);
}

/**
 * メールアドレスをマスク
 */
export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`;
  }
  const maskedLocal =
    localPart[0] +
    '*'.repeat(localPart.length - 2) +
    localPart[localPart.length - 1];
  return `${maskedLocal}@${domain}`;
}

/**
 * 電話番号をマスク
 */
export function maskPhoneNumber(phone: string): string {
  const formatted = formatPhoneNumber(phone);
  const parts = formatted.split('-');
  if (parts.length === 3) {
    return `${parts[0]}-****-${parts[2]}`;
  }
  return phone;
}

/**
 * 文字数をカウント（全角文字は2文字として計算）
 */
export function countChars(text: string): number {
  let count = 0;
  for (const char of text) {
    // 全角文字の判定
    // eslint-disable-next-line no-control-regex
    if (char.match(/[^\x01-\x7E]/)) {
      count += 2;
    } else {
      count += 1;
    }
  }
  return count;
}

/**
 * バイト数制限で文字列を切り詰める
 */
export function truncateByBytes(
  text: string,
  maxBytes: number,
  suffix: string = '...'
): string {
  let byteCount = 0;
  let truncatedText = '';

  for (const char of text) {
    // eslint-disable-next-line no-control-regex
    const charBytes = char.match(/[^\x01-\x7E]/) ? 2 : 1;

    if (byteCount + charBytes + suffix.length > maxBytes) {
      break;
    }

    byteCount += charBytes;
    truncatedText += char;
  }

  return truncatedText.length < text.length ? truncatedText + suffix : text;
}
