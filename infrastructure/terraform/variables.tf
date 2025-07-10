variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "project_name" {
  description = "The project name used for resource naming"
  type        = string
  default     = "template"
}

variable "region" {
  description = "The GCP region"
  type        = string
  default     = "asia-northeast1"
}

variable "zone" {
  description = "The GCP zone"
  type        = string
  default     = "asia-northeast1-a"
}

variable "database_name" {
  description = "The name of the PostgreSQL database"
  type        = string
  default     = "template"
}

variable "database_user" {
  description = "The database user name"
  type        = string
  default     = "ryckan_user"
}

variable "database_password" {
  description = "The database password"
  type        = string
  sensitive   = true
}

variable "environment" {
  description = "The environment (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "firebase_project_id" {
  description = "Firebase project ID for authentication"
  type        = string
}

variable "firebase_api_key" {
  description = "Firebase API key"
  type        = string
  sensitive   = true
}

variable "firebase_auth_domain" {
  description = "Firebase auth domain"
  type        = string
}