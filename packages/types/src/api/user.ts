import {
  BaseEntity,
  UserRole,
  ContactInfo,
  Location,
  FileType,
} from '../common';

// ユーザー基本型
export interface User extends BaseEntity {
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date;
  profileData: UserProfileData;
}

// ユーザープロファイルデータ (JSONフィールド)
export interface UserProfileData {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  location?: Location;
  contactInfo?: ContactInfo;
  preferences?: UserPreferences;
}

// ユーザー設定
export interface UserPreferences {
  language: 'ja' | 'en';
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  theme?: 'light' | 'dark' | 'system';
}

// ユーザープロファイル
export interface UserProfile extends BaseEntity {
  userId: string;
  bio?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  socialLinks?: SocialLinks;
  metadata?: Record<string, any>;
}

// ソーシャルリンク
export interface SocialLinks {
  twitter?: string;
  github?: string;
  linkedin?: string;
  website?: string;
  [key: string]: string | undefined;
}

// ユーザー作成/更新DTO
export interface CreateUserRequest {
  email: string;
  role: UserRole;
  profileData: UserProfileData;
}

export interface UpdateUserRequest {
  profileData?: Partial<UserProfileData>;
  isActive?: boolean;
}

export interface CreateUserProfileRequest {
  bio?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  socialLinks?: SocialLinks;
  metadata?: Record<string, any>;
}

export interface UpdateUserProfileRequest
  extends Partial<CreateUserProfileRequest> {}

// ユーザー一覧とフィルター
export interface UserListParams {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'email' | 'lastLoginAt';
  sortOrder?: 'asc' | 'desc';
}

// ユーザーセッション
export interface UserSession {
  userId: string;
  email: string;
  role: UserRole;
  issuedAt: Date;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

// ユーザーアクティビティ
export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  resource?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

// ユーザー統計
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisMonth: number;
  usersByRole: Record<UserRole, number>;
}
