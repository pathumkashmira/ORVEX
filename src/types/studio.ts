export type AppRole = 'SUPER_ADMIN' | 'ADMIN' | 'PROJECT_LEAD' | 'TEAM_COLLABORATOR' | 'CLIENT'
export type TeamStatus = 'APPLICANT' | 'SHORTLISTED' | 'TRIAL' | 'VERIFIED' | 'CORE' | 'LEAD' | 'SUSPENDED' | 'ARCHIVED'
export type AvailabilityStatus = 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE'
export type ProjectStatus = 'LEAD' | 'DISCOVERY' | 'QUOTATION' | 'APPROVED' | 'PLANNING' | 'IN_PRODUCTION' | 'INTERNAL_REVIEW' | 'CLIENT_REVIEW' | 'REVISION' | 'FINAL_DELIVERY' | 'COMPLETED' | 'ARCHIVED'
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'INTERNAL_REVIEW' | 'REVISION_REQUIRED' | 'APPROVED' | 'COMPLETED'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type PaymentStatus = 'PENDING' | 'APPROVED_FOR_PAYMENT' | 'PAID' | 'DISPUTED' | 'CANCELLED'
export type MessageVisibility = 'INTERNAL' | 'CLIENT'

export interface StudioProfile {
  id: string
  full_name: string
  avatar_url: string | null
  bio: string | null
  role: AppRole
  timezone: string
  phone: string | null
  social_links: Record<string, string>
}

export interface TeamMember {
  user_id: string
  status: TeamStatus
  experience: string | null
  software: string[]
  preferred_project_types: string[]
  rate: number | null
  portfolio_url: string | null
  rating: number | null
  completed_projects: number
  current_workload: number
}

export interface StudioProject {
  id: string
  project_code: string
  client_id: string | null
  name: string
  description: string | null
  category: string | null
  status: ProjectStatus
  priority: TaskPriority
  budget: number | null
  deadline: string | null
  creative_director: string | null
  project_lead: string | null
}

export interface StudioTask {
  id: string
  project_id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  budget: number | null
  deadline: string | null
  deliverables: string[]
}
