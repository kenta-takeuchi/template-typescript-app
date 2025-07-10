/**
 * Common validation utilities
 */

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validation utility class
 */
export class ValidationUtils {
  /**
   * Create a successful validation result
   */
  static success(): ValidationResult {
    return { isValid: true, errors: [] };
  }

  /**
   * Create a failed validation result
   */
  static failure(errors: string[]): ValidationResult {
    return { isValid: false, errors };
  }

  /**
   * Create a failed validation result with single error
   */
  static failureWithMessage(message: string): ValidationResult {
    return { isValid: false, errors: [message] };
  }

  /**
   * Combine multiple validation results
   */
  static combine(...results: ValidationResult[]): ValidationResult {
    const allErrors = results.flatMap(result => result.errors);
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
    };
  }

  /**
   * Validate required string field
   */
  static validateRequired(
    value: string | null | undefined,
    fieldName: string
  ): ValidationResult {
    if (!value || value.trim().length === 0) {
      return this.failureWithMessage(`${fieldName}は必須です`);
    }
    return this.success();
  }

  /**
   * Validate string length
   */
  static validateLength(
    value: string,
    fieldName: string,
    min?: number,
    max?: number
  ): ValidationResult {
    const errors: string[] = [];

    if (min !== undefined && value.length < min) {
      errors.push(`${fieldName}は${min}文字以上である必要があります`);
    }

    if (max !== undefined && value.length > max) {
      errors.push(`${fieldName}は${max}文字以下である必要があります`);
    }

    return errors.length > 0 ? this.failure(errors) : this.success();
  }

  /**
   * Validate numeric range
   */
  static validateNumericRange(
    value: number,
    fieldName: string,
    min?: number,
    max?: number
  ): ValidationResult {
    const errors: string[] = [];

    if (min !== undefined && value < min) {
      errors.push(`${fieldName}は${min}以上である必要があります`);
    }

    if (max !== undefined && value > max) {
      errors.push(`${fieldName}は${max}以下である必要があります`);
    }

    return errors.length > 0 ? this.failure(errors) : this.success();
  }

  /**
   * Validate array length
   */
  static validateArrayLength<T>(
    array: T[],
    fieldName: string,
    min?: number,
    max?: number
  ): ValidationResult {
    const errors: string[] = [];

    if (min !== undefined && array.length < min) {
      errors.push(`${fieldName}は${min}個以上である必要があります`);
    }

    if (max !== undefined && array.length > max) {
      errors.push(`${fieldName}は${max}個以下である必要があります`);
    }

    return errors.length > 0 ? this.failure(errors) : this.success();
  }

  /**
   * Validate date is not in the past
   */
  static validateFutureDate(date: Date, fieldName: string): ValidationResult {
    const now = new Date();
    if (date <= now) {
      return this.failureWithMessage(
        `${fieldName}は現在より未来の日時である必要があります`
      );
    }
    return this.success();
  }

  /**
   * Validate date is not in the future
   */
  static validatePastDate(date: Date, fieldName: string): ValidationResult {
    const now = new Date();
    if (date >= now) {
      return this.failureWithMessage(
        `${fieldName}は現在より過去の日時である必要があります`
      );
    }
    return this.success();
  }

  /**
   * Validate enum value
   */
  static validateEnum<T>(
    value: T,
    enumObject: Record<string, T>,
    fieldName: string
  ): ValidationResult {
    const validValues = Object.values(enumObject);
    if (!validValues.includes(value)) {
      const validValuesStr = validValues.join(', ');
      return this.failureWithMessage(
        `${fieldName}は次のいずれかである必要があります: ${validValuesStr}`
      );
    }
    return this.success();
  }

  /**
   * Validate URL format
   */
  static validateUrl(url: string, fieldName: string): ValidationResult {
    try {
      new URL(url);
      return this.success();
    } catch {
      return this.failureWithMessage(
        `${fieldName}は有効なURLである必要があります`
      );
    }
  }

  /**
   * Validate Japanese text (hiragana, katakana, kanji)
   */
  static validateJapaneseText(
    text: string,
    fieldName: string
  ): ValidationResult {
    const japaneseRegex =
      /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF\s\w\d\-_.,!?()（）「」『』【】〜～・]+$/;

    if (!japaneseRegex.test(text)) {
      return this.failureWithMessage(
        `${fieldName}に無効な文字が含まれています`
      );
    }

    return this.success();
  }

  /**
   * Validate skills array (common for job seekers and job postings)
   */
  static validateSkills(skills: string[], fieldName: string): ValidationResult {
    const errors: string[] = [];

    // Check array length
    if (skills.length === 0) {
      errors.push(`${fieldName}は少なくとも1つ必要です`);
    }

    if (skills.length > 20) {
      errors.push(`${fieldName}は20個以下である必要があります`);
    }

    // Check individual skill validity
    for (const skill of skills) {
      if (!skill || skill.trim().length === 0) {
        errors.push(`${fieldName}に空の項目が含まれています`);
        continue;
      }

      if (skill.length > 50) {
        errors.push(`${fieldName}の各項目は50文字以下である必要があります`);
      }
    }

    // Check for duplicates
    const uniqueSkills = new Set(skills.map(s => s.trim().toLowerCase()));
    if (uniqueSkills.size !== skills.length) {
      errors.push(`${fieldName}に重複した項目があります`);
    }

    return errors.length > 0 ? this.failure(errors) : this.success();
  }
}
