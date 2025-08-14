import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import { contactService } from '../../services/contactService';
import { Contact, ContactFormData } from '../../types';
import { toast } from 'react-hot-toast';

const schema = yup.object({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email format').optional(),
  phone: yup.string().optional(),
  mobile: yup.string().optional(),
  company: yup.string().optional(),
  title: yup.string().optional(),
  department: yup.string().optional(),
  address_line1: yup.string().optional(),
  address_line2: yup.string().optional(),
  city: yup.string().optional(),
  state: yup.string().optional(),
  postal_code: yup.string().optional(),
  country: yup.string().optional(),
  linkedin_url: yup.string().url('Invalid LinkedIn URL').optional(),
  website: yup.string().url('Invalid website URL').optional(),
  lead_source: yup.string().optional(),
  notes: yup.string().optional(),
});

interface ContactFormProps {
  contact?: Contact | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const leadSources = [
  'Website',
  'Email Marketing',
  'Social Media',
  'Referral',
  'Cold Call',
  'Trade Show',
  'Webinar',
  'Content Download',
  'Other'
];

const ContactForm: React.FC<ContactFormProps> = ({ contact, onSuccess, onCancel }) => {
  const isEditing = !!contact;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: yupResolver(schema),
    defaultValues: contact ? {
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email || '',
      phone: contact.phone || '',
      mobile: contact.mobile || '',
      company: contact.company || '',
      title: contact.title || '',
      department: contact.department || '',
      address_line1: contact.address_line1 || '',
      address_line2: contact.address_line2 || '',
      city: contact.city || '',
      state: contact.state || '',
      postal_code: contact.postal_code || '',
      country: contact.country || '',
      linkedin_url: contact.linkedin_url || '',
      website: contact.website || '',
      lead_source: contact.lead_source || '',
      notes: contact.notes || '',
    } : {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      mobile: '',
      company: '',
      title: '',
      department: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      linkedin_url: '',
      website: '',
      lead_source: '',
      notes: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: contactService.createContact,
    onSuccess: () => {
      toast.success('Contact created successfully');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create contact');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ContactFormData) => 
      contactService.updateContact(contact!.id, data),
    onSuccess: () => {
      toast.success('Contact updated successfully');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update contact');
    },
  });

  const onSubmit: SubmitHandler<ContactFormData> = (data) => {
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
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Email</label>
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

          <div>
            <label className="form-label">Mobile</label>
            <input
              {...register('mobile')}
              type="tel"
              className="form-input"
              placeholder="Enter mobile number"
            />
            {errors.mobile && (
              <p className="form-error">{errors.mobile.message}</p>
            )}
          </div>

          <div>
            <label className="form-label">Lead Source</label>
            <select {...register('lead_source')} className="form-select">
              <option value="">Select lead source</option>
              {leadSources.map((source) => (
                <option key={source} value={source.toLowerCase().replace(/\s+/g, '_')}>
                  {source}
                </option>
              ))}
            </select>
            {errors.lead_source && (
              <p className="form-error">{errors.lead_source.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Company</label>
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
            <label className="form-label">Department</label>
            <input
              {...register('department')}
              type="text"
              className="form-input"
              placeholder="Enter department"
            />
            {errors.department && (
              <p className="form-error">{errors.department.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
        <div className="space-y-4">
          <div>
            <label className="form-label">Address Line 1</label>
            <input
              {...register('address_line1')}
              type="text"
              className="form-input"
              placeholder="Enter street address"
            />
            {errors.address_line1 && (
              <p className="form-error">{errors.address_line1.message}</p>
            )}
          </div>

          <div>
            <label className="form-label">Address Line 2</label>
            <input
              {...register('address_line2')}
              type="text"
              className="form-input"
              placeholder="Apartment, suite, etc. (optional)"
            />
            {errors.address_line2 && (
              <p className="form-error">{errors.address_line2.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="form-label">City</label>
              <input
                {...register('city')}
                type="text"
                className="form-input"
                placeholder="Enter city"
              />
              {errors.city && (
                <p className="form-error">{errors.city.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">State</label>
              <input
                {...register('state')}
                type="text"
                className="form-input"
                placeholder="Enter state"
              />
              {errors.state && (
                <p className="form-error">{errors.state.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Postal Code</label>
              <input
                {...register('postal_code')}
                type="text"
                className="form-input"
                placeholder="Enter postal code"
              />
              {errors.postal_code && (
                <p className="form-error">{errors.postal_code.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Country</label>
              <input
                {...register('country')}
                type="text"
                className="form-input"
                placeholder="Enter country"
              />
              {errors.country && (
                <p className="form-error">{errors.country.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Social & Web */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Social & Web</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">LinkedIn URL</label>
            <input
              {...register('linkedin_url')}
              type="url"
              className="form-input"
              placeholder="https://linkedin.com/in/username"
            />
            {errors.linkedin_url && (
              <p className="form-error">{errors.linkedin_url.message}</p>
            )}
          </div>

          <div>
            <label className="form-label">Website</label>
            <input
              {...register('website')}
              type="url"
              className="form-input"
              placeholder="https://example.com"
            />
            {errors.website && (
              <p className="form-error">{errors.website.message}</p>
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
          placeholder="Enter any additional notes about this contact"
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
            isEditing ? 'Update Contact' : 'Create Contact'
          )}
        </button>
      </div>
    </form>
  );
};

export default ContactForm;