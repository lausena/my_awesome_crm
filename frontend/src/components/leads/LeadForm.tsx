import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import { leadService } from '../../services/leadService';
import { Lead, LeadFormData, LeadSource } from '../../types';
import { toast } from 'react-hot-toast';

const schema = yup.object({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  phone: yup.string().optional(),
  company: yup.string().required('Company is required'),
  title: yup.string().optional(),
  industry: yup.string().optional(),
  company_size: yup.string().optional(),
  annual_revenue: yup.string().optional(),
  source: yup.mixed<LeadSource>().oneOf(Object.values(LeadSource)).required('Lead source is required'),
  estimated_value: yup.number().positive('Value must be positive').optional(),
  expected_close_date: yup.string().optional(),
  assigned_to: yup.number().optional(),
  notes: yup.string().optional(),
  campaign: yup.string().optional(),
}).required();

interface LeadFormProps {
  lead?: Lead | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const companySizes = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-1000', label: '201-1000 employees' },
  { value: '1000+', label: '1000+ employees' },
];

const industries = [
  'Technology',
  'Healthcare',
  'Financial Services',
  'Manufacturing',
  'Retail',
  'Education',
  'Real Estate',
  'Consulting',
  'Other'
];

const annualRevenues = [
  { value: '<1M', label: 'Less than $1M' },
  { value: '1M-10M', label: '$1M - $10M' },
  { value: '10M-50M', label: '$10M - $50M' },
  { value: '50M-100M', label: '$50M - $100M' },
  { value: '100M+', label: '$100M+' },
];

const LeadForm: React.FC<LeadFormProps> = ({ lead, onSuccess, onCancel }) => {
  const isEditing = !!lead;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: lead ? {
      first_name: lead.first_name,
      last_name: lead.last_name,
      email: lead.email,
      phone: lead.phone || '',
      company: lead.company,
      title: lead.title || '',
      industry: lead.industry || '',
      company_size: lead.company_size || '',
      annual_revenue: lead.annual_revenue || '',
      source: lead.source,
      estimated_value: lead.estimated_value || undefined,
      expected_close_date: lead.expected_close_date || '',
      assigned_to: lead.assigned_to || undefined,
      notes: lead.notes || '',
      campaign: lead.campaign || '',
    } : {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      company: '',
      title: '',
      industry: '',
      company_size: '',
      annual_revenue: '',
      source: LeadSource.OTHER,
      estimated_value: undefined,
      expected_close_date: '',
      assigned_to: undefined,
      notes: '',
      campaign: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: leadService.createLead,
    onSuccess: () => {
      toast.success('Lead created successfully');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create lead');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: LeadFormData) => 
      leadService.updateLead(lead!.id, data),
    onSuccess: () => {
      toast.success('Lead updated successfully');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update lead');
    },
  });

  const onSubmit: SubmitHandler<LeadFormData> = (data) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('first_name')}
              type="text"
              className="form-input"
              placeholder="Enter first name"
            />
            {errors.first_name && (
              <p className="form-error">{errors.first_name.message}</p>
            )}
          </div>

          <div>
            <label className="form-label">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('last_name')}
              type="text"
              className="form-input"
              placeholder="Enter last name"
            />
            {errors.last_name && (
              <p className="form-error">{errors.last_name.message}</p>
            )}
          </div>

          <div>
            <label className="form-label">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              {...register('email')}
              type="email"
              className="form-input"
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="form-error">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="form-label">Phone</label>
            <input
              {...register('phone')}
              type="tel"
              className="form-input"
              placeholder="Enter phone number"
            />
            {errors.phone && (
              <p className="form-error">{errors.phone.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Company Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">
              Company <span className="text-red-500">*</span>
            </label>
            <input
              {...register('company')}
              type="text"
              className="form-input"
              placeholder="Enter company name"
            />
            {errors.company && (
              <p className="form-error">{errors.company.message}</p>
            )}
          </div>

          <div>
            <label className="form-label">Job Title</label>
            <input
              {...register('title')}
              type="text"
              className="form-input"
              placeholder="Enter job title"
            />
            {errors.title && (
              <p className="form-error">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="form-label">Industry</label>
            <select {...register('industry')} className="form-select">
              <option value="">Select industry</option>
              {industries.map((industry) => (
                <option key={industry} value={industry.toLowerCase()}>
                  {industry}
                </option>
              ))}
            </select>
            {errors.industry && (
              <p className="form-error">{errors.industry.message}</p>
            )}
          </div>

          <div>
            <label className="form-label">Company Size</label>
            <select {...register('company_size')} className="form-select">
              <option value="">Select company size</option>
              {companySizes.map((size) => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </select>
            {errors.company_size && (
              <p className="form-error">{errors.company_size.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="form-label">Annual Revenue</label>
            <select {...register('annual_revenue')} className="form-select">
              <option value="">Select annual revenue</option>
              {annualRevenues.map((revenue) => (
                <option key={revenue.value} value={revenue.value}>
                  {revenue.label}
                </option>
              ))}
            </select>
            {errors.annual_revenue && (
              <p className="form-error">{errors.annual_revenue.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Lead Details */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">
              Lead Source <span className="text-red-500">*</span>
            </label>
            <select {...register('source')} className="form-select">
              <option value="">Select lead source</option>
              {Object.values(LeadSource).map((source) => (
                <option key={source} value={source}>
                  {source.toUpperCase().replace('_', ' ')}
                </option>
              ))}
            </select>
            {errors.source && (
              <p className="form-error">{errors.source.message}</p>
            )}
          </div>

          <div>
            <label className="form-label">Campaign</label>
            <input
              {...register('campaign')}
              type="text"
              className="form-input"
              placeholder="Enter campaign name"
            />
            {errors.campaign && (
              <p className="form-error">{errors.campaign.message}</p>
            )}
          </div>

          <div>
            <label className="form-label">Estimated Value ($)</label>
            <input
              {...register('estimated_value')}
              type="number"
              min="0"
              step="0.01"
              className="form-input"
              placeholder="0.00"
            />
            {errors.estimated_value && (
              <p className="form-error">{errors.estimated_value.message}</p>
            )}
          </div>

          <div>
            <label className="form-label">Expected Close Date</label>
            <input
              {...register('expected_close_date')}
              type="date"
              className="form-input"
            />
            {errors.expected_close_date && (
              <p className="form-error">{errors.expected_close_date.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="form-label">Notes</label>
        <textarea
          {...register('notes')}
          rows={4}
          className="form-textarea"
          placeholder="Enter any additional notes about this lead"
        />
        {errors.notes && (
          <p className="form-error">{errors.notes.message}</p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="spinner h-4 w-4 mr-2" />
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            isEditing ? 'Update Lead' : 'Create Lead'
          )}
        </button>
      </div>
    </form>
  );
};

export default LeadForm;