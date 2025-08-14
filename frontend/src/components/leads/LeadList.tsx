import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { leadService } from '../../services/leadService';
import { Lead, LeadStatus, TableColumn } from '../../types';
import Table from '../common/Table';
import Badge from '../common/Badge';
import Modal from '../common/Modal';
import LeadForm from './LeadForm';
import LeadPipeline from './LeadPipeline';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ViewColumnsIcon,
  ListBulletIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

type ViewMode = 'table' | 'pipeline';

const LeadList: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const { 
    data: leadsData, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['leads'],
    queryFn: () => leadService.getLeads({ page: 1, limit: 100 })
  });

  const leads = leadsData?.data || [];

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (lead: Lead) => {
    if (window.confirm(`Are you sure you want to delete ${lead.full_name}?`)) {
      try {
        await leadService.deleteLead(lead.id);
        toast.success('Lead deleted successfully');
        refetch();
      } catch (error) {
        toast.error('Failed to delete lead');
      }
    }
  };

  const handleStatusChange = async (leadId: number, newStatus: LeadStatus) => {
    try {
      await leadService.updateLeadStatus(leadId, newStatus);
      toast.success('Lead status updated');
      refetch();
    } catch (error) {
      toast.error('Failed to update lead status');
    }
  };

  const handleFormSuccess = () => {
    refetch();
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedLead(null);
  };

  const getStatusBadgeVariant = (status: LeadStatus) => {
    switch (status) {
      case LeadStatus.NEW:
        return 'info';
      case LeadStatus.CONTACTED:
        return 'warning';
      case LeadStatus.QUALIFIED:
        return 'success';
      case LeadStatus.CONVERTED:
        return 'success';
      case LeadStatus.UNQUALIFIED:
      case LeadStatus.LOST:
        return 'danger';
      default:
        return 'gray';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'gray';
    }
  };

  const columns: TableColumn<Lead>[] = [
    {
      key: 'full_name',
      label: 'Name',
      sortable: true,
      render: (value, lead) => (
        <div className="flex flex-col">
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{lead.company}</div>
        </div>
      ),
    },
    {
      key: 'title',
      label: 'Title',
      render: (value) => value || '-',
    },
    {
      key: 'email',
      label: 'Contact',
      render: (_, lead) => (
        <div className="space-y-1">
          {lead.email && (
            <div className="flex items-center text-sm">
              <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-1" />
              <a 
                href={`mailto:${lead.email}`}
                className="text-primary-600 hover:text-primary-800"
              >
                {lead.email}
              </a>
            </div>
          )}
          {lead.phone && (
            <div className="flex items-center text-sm">
              <PhoneIcon className="h-4 w-4 text-gray-400 mr-1" />
              <a 
                href={`tel:${lead.phone}`}
                className="text-primary-600 hover:text-primary-800"
              >
                {lead.phone}
              </a>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <Badge variant={getStatusBadgeVariant(value)} size="sm">
          {value.toUpperCase().replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'score',
      label: 'Score',
      sortable: true,
      render: (value) => (
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
            <div
              className="bg-primary-600 h-2 rounded-full"
              style={{ width: `${value}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium">{Math.round(value)}</span>
        </div>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (value) => (
        <Badge variant={getPriorityBadgeVariant(value)} size="sm">
          {value.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'source',
      label: 'Source',
      render: (value) => (
        <Badge variant="info" size="sm">
          {value.toUpperCase().replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'estimated_value',
      label: 'Value',
      sortable: true,
      render: (value) => value ? `$${value.toLocaleString()}` : '-',
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_, lead) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(lead);
            }}
            className="p-1 text-gray-400 hover:text-primary-600"
            title="Edit lead"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(lead);
            }}
            className="p-1 text-gray-400 hover:text-red-600"
            title="Delete lead"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your leads and convert them to opportunities
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-gray-300">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 text-sm font-medium rounded-l-lg ${
                viewMode === 'table'
                  ? 'bg-primary-50 text-primary-700 border-primary-200'
                  : 'bg-white text-gray-500 hover:text-gray-700'
              }`}
            >
              <ListBulletIcon className="h-4 w-4 mr-1 inline" />
              Table
            </button>
            <button
              onClick={() => setViewMode('pipeline')}
              className={`px-3 py-2 text-sm font-medium rounded-r-lg border-l ${
                viewMode === 'pipeline'
                  ? 'bg-primary-50 text-primary-700 border-primary-200'
                  : 'bg-white text-gray-500 hover:text-gray-700'
              }`}
            >
              <ViewColumnsIcon className="h-4 w-4 mr-1 inline" />
              Pipeline
            </button>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Lead
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="text-2xl font-bold text-gray-900">
              {leads.length}
            </div>
            <div className="text-sm text-gray-600">Total Leads</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="text-2xl font-bold text-gray-900">
              {leads.filter(l => l.status === LeadStatus.QUALIFIED).length}
            </div>
            <div className="text-sm text-gray-600">Qualified</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length || 0)}
            </div>
            <div className="text-sm text-gray-600">Avg Score</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="text-2xl font-bold text-gray-900">
              ${leads.reduce((sum, l) => sum + (l.estimated_value || 0), 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Value</div>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        <Table
          data={leads}
          columns={columns}
          loading={isLoading}
        />
      ) : (
        <LeadPipeline
          leads={leads}
          loading={isLoading}
          onStatusChange={handleStatusChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Lead"
        size="lg"
      >
        <LeadForm
          onSuccess={handleFormSuccess}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedLead(null);
        }}
        title="Edit Lead"
        size="lg"
      >
        <LeadForm
          lead={selectedLead}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedLead(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default LeadList;