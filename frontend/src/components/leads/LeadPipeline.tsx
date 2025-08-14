import React from 'react';
import { Lead, LeadStatus } from '../../types';
import Badge from '../common/Badge';
import LoadingSpinner from '../common/LoadingSpinner';
import { 
  PencilIcon, 
  TrashIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

interface LeadPipelineProps {
  leads: Lead[];
  loading: boolean;
  onStatusChange: (leadId: number, status: LeadStatus) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

const statusConfig = {
  [LeadStatus.NEW]: {
    title: 'New Leads',
    color: 'bg-blue-50 border-blue-200',
    headerColor: 'bg-blue-100 text-blue-800'
  },
  [LeadStatus.CONTACTED]: {
    title: 'Contacted',
    color: 'bg-yellow-50 border-yellow-200',
    headerColor: 'bg-yellow-100 text-yellow-800'
  },
  [LeadStatus.QUALIFIED]: {
    title: 'Qualified',
    color: 'bg-green-50 border-green-200',
    headerColor: 'bg-green-100 text-green-800'
  },
  [LeadStatus.UNQUALIFIED]: {
    title: 'Unqualified',
    color: 'bg-red-50 border-red-200',
    headerColor: 'bg-red-100 text-red-800'
  },
  [LeadStatus.CONVERTED]: {
    title: 'Converted',
    color: 'bg-purple-50 border-purple-200',
    headerColor: 'bg-purple-100 text-purple-800'
  },
  [LeadStatus.LOST]: {
    title: 'Lost',
    color: 'bg-gray-50 border-gray-200',
    headerColor: 'bg-gray-100 text-gray-800'
  }
};

const LeadPipeline: React.FC<LeadPipelineProps> = ({ 
  leads, 
  loading, 
  onStatusChange,
  onEdit,
  onDelete 
}) => {
  if (loading) {
    return <LoadingSpinner message="Loading pipeline..." />;
  }

  // Group leads by status
  const leadsByStatus = leads.reduce((acc, lead) => {
    if (!acc[lead.status]) {
      acc[lead.status] = [];
    }
    acc[lead.status].push(lead);
    return acc;
  }, {} as Record<LeadStatus, Lead[]>);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-blue-500';
      default:
        return 'border-l-gray-300';
    }
  };

  const renderLeadCard = (lead: Lead) => (
    <div
      key={lead.id}
      className={`bg-white rounded-lg border-2 border-l-4 p-4 shadow-sm hover:shadow-md transition-shadow ${getPriorityColor(lead.priority)}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-medium text-gray-900">{lead.full_name}</h4>
          <p className="text-sm text-gray-600">{lead.company}</p>
          {lead.title && (
            <p className="text-xs text-gray-500">{lead.title}</p>
          )}
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => onEdit(lead)}
            className="p-1 text-gray-400 hover:text-primary-600"
            title="Edit lead"
          >
            <PencilIcon className="h-3 w-3" />
          </button>
          <button
            onClick={() => onDelete(lead)}
            className="p-1 text-gray-400 hover:text-red-600"
            title="Delete lead"
          >
            <TrashIcon className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {/* Contact Info */}
        <div className="space-y-1">
          {lead.email && (
            <div className="flex items-center text-xs text-gray-600">
              <EnvelopeIcon className="h-3 w-3 mr-1" />
              <a href={`mailto:${lead.email}`} className="hover:text-primary-600">
                {lead.email}
              </a>
            </div>
          )}
          {lead.phone && (
            <div className="flex items-center text-xs text-gray-600">
              <PhoneIcon className="h-3 w-3 mr-1" />
              <a href={`tel:${lead.phone}`} className="hover:text-primary-600">
                {lead.phone}
              </a>
            </div>
          )}
        </div>

        {/* Score and Priority */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Score:</span>
            <div className="flex items-center">
              <div className="w-12 bg-gray-200 rounded-full h-1 mr-1">
                <div
                  className="bg-primary-600 h-1 rounded-full"
                  style={{ width: `${lead.score}%` }}
                ></div>
              </div>
              <span className="text-xs font-medium">{Math.round(lead.score)}</span>
            </div>
          </div>
          <Badge 
            variant={
              lead.priority === 'high' ? 'danger' :
              lead.priority === 'medium' ? 'warning' : 'info'
            } 
            size="sm"
          >
            {lead.priority.toUpperCase()}
          </Badge>
        </div>

        {/* Value */}
        {lead.estimated_value && (
          <div className="text-xs text-gray-600">
            Value: <span className="font-medium">${lead.estimated_value.toLocaleString()}</span>
          </div>
        )}

        {/* Source */}
        <div className="flex justify-between items-center">
          <Badge variant="info" size="sm">
            {lead.source.replace('_', ' ').toUpperCase()}
          </Badge>
          
          {/* Status Change Dropdown */}
          <select
            value={lead.status}
            onChange={(e) => onStatusChange(lead.id, e.target.value as LeadStatus)}
            className="text-xs border-0 bg-transparent text-gray-600 focus:ring-1 focus:ring-primary-500"
          >
            {Object.values(LeadStatus).map(status => (
              <option key={status} value={status}>
                {status.replace('_', ' ').toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="overflow-x-auto">
      <div className="flex space-x-6 pb-4" style={{ minWidth: '1200px' }}>
        {Object.entries(statusConfig).map(([status, config]) => {
          const statusLeads = leadsByStatus[status as LeadStatus] || [];
          
          return (
            <div key={status} className="flex-1 min-w-64">
              <div className={`rounded-t-lg p-3 ${config.headerColor}`}>
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{config.title}</h3>
                  <span className="text-sm font-bold">{statusLeads.length}</span>
                </div>
                <div className="text-xs mt-1">
                  Total: ${statusLeads.reduce((sum, lead) => sum + (lead.estimated_value || 0), 0).toLocaleString()}
                </div>
              </div>
              
              <div className={`rounded-b-lg border-2 border-t-0 p-3 space-y-3 min-h-96 ${config.color}`}>
                {statusLeads.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm py-8">
                    No leads in this stage
                  </div>
                ) : (
                  statusLeads.map(renderLeadCard)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeadPipeline;