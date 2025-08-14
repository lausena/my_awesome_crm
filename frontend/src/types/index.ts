// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Authentication Types
export interface AuthTokens {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  username: string;
  email?: string;
  tenant_id: number;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Contact Types
export interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  company?: string;
  title?: string;
  department?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  linkedin_url?: string;
  website?: string;
  is_active: boolean;
  lead_source?: string;
  notes?: string;
  tenant_id: number;
  created_at: string;
  updated_at: string;
}

export interface ContactFormData {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  company?: string;
  title?: string;
  department?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  linkedin_url?: string;
  website?: string;
  lead_source?: string;
  notes?: string;
}

// Lead Types
export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  UNQUALIFIED = 'unqualified',
  CONVERTED = 'converted',
  LOST = 'lost'
}

export enum LeadSource {
  WEBSITE = 'website',
  EMAIL_MARKETING = 'email_marketing',
  SOCIAL_MEDIA = 'social_media',
  REFERRAL = 'referral',
  COLD_CALL = 'cold_call',
  TRADE_SHOW = 'trade_show',
  WEBINAR = 'webinar',
  CONTENT_DOWNLOAD = 'content_download',
  OTHER = 'other'
}

export interface Lead {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone?: string;
  company: string;
  title?: string;
  industry?: string;
  company_size?: string;
  annual_revenue?: string;
  status: LeadStatus;
  source: LeadSource;
  score: number;
  priority: 'low' | 'medium' | 'high';
  estimated_value?: number;
  expected_close_date?: string;
  assigned_to?: number;
  budget_qualified: boolean;
  authority_qualified: boolean;
  need_qualified: boolean;
  timeline_qualified: boolean;
  is_qualified: boolean;
  notes?: string;
  campaign?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  is_active: boolean;
  converted_to_contact_id?: number;
  converted_to_opportunity_id?: number;
  tenant_id: number;
  created_at: string;
  updated_at: string;
}

export interface LeadFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company: string;
  title?: string;
  industry?: string;
  company_size?: string;
  annual_revenue?: string;
  source: LeadSource;
  estimated_value?: number;
  expected_close_date?: string;
  assigned_to?: number;
  notes?: string;
  campaign?: string;
}

// Opportunity Types
export enum OpportunityStage {
  PROSPECTING = 'prospecting',
  QUALIFICATION = 'qualification',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost'
}

export interface Opportunity {
  id: number;
  name: string;
  description?: string;
  stage: OpportunityStage;
  amount: number;
  probability: number;
  expected_close_date?: string;
  actual_close_date?: string;
  contact_id?: number;
  company: string;
  assigned_to?: number;
  notes?: string;
  tenant_id: number;
  created_at: string;
  updated_at: string;
  contact?: Contact;
}

export interface OpportunityFormData {
  name: string;
  description?: string;
  stage: OpportunityStage;
  amount: number;
  probability: number;
  expected_close_date?: string;
  contact_id?: number;
  company: string;
  assigned_to?: number;
  notes?: string;
}

// Activity Types
export enum ActivityType {
  CALL = 'call',
  EMAIL = 'email',
  MEETING = 'meeting',
  TASK = 'task',
  NOTE = 'note'
}

export enum ActivityStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface Activity {
  id: number;
  title: string;
  description?: string;
  type: ActivityType;
  status: ActivityStatus;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  due_time?: string;
  duration_minutes?: number;
  contact_id?: number;
  opportunity_id?: number;
  assigned_to?: number;
  completed_at?: string;
  notes?: string;
  tenant_id: number;
  created_at: string;
  updated_at: string;
  contact?: Contact;
  opportunity?: Opportunity;
}

export interface ActivityFormData {
  title: string;
  description?: string;
  type: ActivityType;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  due_time?: string;
  duration_minutes?: number;
  contact_id?: number;
  opportunity_id?: number;
  assigned_to?: number;
  notes?: string;
}

// Dashboard Types
export interface DashboardSummary {
  contacts: {
    status: string;
    recent: Contact[];
  };
  leads: {
    status: string;
    count: number;
  };
  opportunities: {
    status: string;
    count: number;
    total_value: number;
  };
  activities: {
    status: string;
    overdue: number;
    due_today: number;
  };
  timestamp: number;
}

// Table and UI Types
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea' | 'date' | 'number';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: any;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Error Types
export interface ApiError {
  message: string;
  status: number;
  detail?: string;
}

// Form validation schemas
export interface ValidationSchema {
  [key: string]: any;
}