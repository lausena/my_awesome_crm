import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { contactService } from '../../services/contactService';
import { leadService } from '../../services/leadService';
import LoadingSpinner from '../common/LoadingSpinner';
import Badge from '../common/Badge';
import {
  UserIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="card">
      <div className="card-body">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {change && (
              <div className="flex items-center mt-1">
                {change.type === 'increase' ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span
                  className={`text-sm font-medium ${
                    change.type === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {change.value}%
                </span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { data: contactsData, isLoading: contactsLoading } = useQuery({
    queryKey: ['contacts', 'dashboard'],
    queryFn: () => contactService.getContacts({ page: 1, limit: 1 })
  });

  const { data: leadsData, isLoading: leadsLoading } = useQuery({
    queryKey: ['leads', 'dashboard'],
    queryFn: () => leadService.getLeads({ page: 1, limit: 100 })
  });

  const { data: recentContactsData } = useQuery({
    queryKey: ['contacts', 'recent'],
    queryFn: () => contactService.getRecentContacts(5)
  });

  const isLoading = contactsLoading || leadsLoading;
  const contacts = contactsData?.data || [];
  const leads = leadsData?.data || [];
  const recentContacts = recentContactsData || [];

  if (isLoading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  const totalRevenue = leads.reduce((sum, lead) => sum + (lead.estimated_value || 0), 0);
  const qualifiedLeads = leads.filter(lead => lead.status === 'qualified').length;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here's what's happening with your CRM today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Contacts"
          value={contactsData?.total || 0}
          change={{ value: 12, type: 'increase' }}
          icon={UserIcon}
          color="blue"
        />
        <StatCard
          title="Active Leads"
          value={leads.length}
          change={{ value: 8, type: 'increase' }}
          icon={UserGroupIcon}
          color="green"
        />
        <StatCard
          title="Pipeline Value"
          value={`$${totalRevenue.toLocaleString()}`}
          change={{ value: 23, type: 'increase' }}
          icon={CurrencyDollarIcon}
          color="yellow"
        />
        <StatCard
          title="Qualified Leads"
          value={qualifiedLeads}
          change={{ value: 5, type: 'decrease' }}
          icon={ClipboardDocumentListIcon}
          color="purple"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Contacts */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Recent Contacts</h3>
          </div>
          <div className="card-body">
            {recentContacts.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No contacts available
              </div>
            ) : (
              <div className="space-y-3">
                {recentContacts.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-600">
                            {contact.first_name.charAt(0)}{contact.last_name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {contact.full_name}
                        </p>
                        <p className="text-xs text-gray-500">{contact.company}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={contact.is_active ? 'success' : 'gray'} size="sm">
                        {contact.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(contact.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Lead Pipeline Summary */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Lead Pipeline</h3>
          </div>
          <div className="card-body">
            {leads.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No leads available
              </div>
            ) : (
              <div className="space-y-4">
                {['new', 'contacted', 'qualified', 'converted'].map((status) => {
                  const statusLeads = leads.filter(lead => lead.status === status);
                  const percentage = leads.length > 0 ? (statusLeads.length / leads.length) * 100 : 0;
                  
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <span className="text-sm font-medium text-gray-700 capitalize w-20">
                          {status}
                        </span>
                        <div className="flex-1 mx-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {statusLeads.length}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
              <UserIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Add Contact</p>
              <p className="text-xs text-gray-500">Create a new contact</p>
            </button>
            
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
              <UserGroupIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Add Lead</p>
              <p className="text-xs text-gray-500">Create a new lead</p>
            </button>
            
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
              <CurrencyDollarIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Add Opportunity</p>
              <p className="text-xs text-gray-500">Create new opportunity</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;