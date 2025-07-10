output "api_url" {
  description = "The URL of the API service"
  value       = google_cloud_run_service.api.status[0].url
}

output "jobseeker_web_url" {
  description = "The URL of the jobseeker web application"
  value       = google_cloud_run_service.jobseeker_web.status[0].url
}

output "company_web_url" {
  description = "The URL of the company web application"
  value       = google_cloud_run_service.company_web.status[0].url
}

output "agent_web_url" {
  description = "The URL of the agent web application"
  value       = google_cloud_run_service.agent_web.status[0].url
}

output "database_connection_name" {
  description = "The connection name of the Cloud SQL instance"
  value       = google_sql_database_instance.postgres.connection_name
}

output "database_private_ip" {
  description = "The private IP address of the Cloud SQL instance"
  value       = google_sql_database_instance.postgres.private_ip_address
  sensitive   = true
}

output "storage_bucket_name" {
  description = "The name of the Cloud Storage bucket"
  value       = google_storage_bucket.uploads.name
}

output "vpc_network_name" {
  description = "The name of the VPC network"
  value       = google_compute_network.main.name
}

output "vpc_connector_name" {
  description = "The name of the VPC access connector"
  value       = google_vpc_access_connector.connector.name
}