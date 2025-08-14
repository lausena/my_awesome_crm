import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { contactService } from '../../services/contactService';
import { Contact, TableColumn } from '../../types';
import Table from '../common/Table';
import Badge from '../common/Badge';
import Modal from '../common/Modal';
import ContactForm from './ContactForm';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  EnvelopeIcon,
  PhoneIcon 
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const ContactList: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const { 
    data: contactsData, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => contactService.getContacts({ page: 1, limit: 50 })
  });

  const contacts = contactsData?.data || [];

  const handleEdit = (contact: Contact) => {
    setSelectedContact(contact);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (contact: Contact) => {
    if (window.confirm(`Are you sure you want to delete ${contact.full_name}?`)) {
      try {
        await contactService.deleteContact(contact.id);
        toast.success('Contact deleted successfully');
        refetch();
      } catch (error) {
        toast.error('Failed to delete contact');
      }
    }
  };

  const handleFormSuccess = () => {
    refetch();
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedContact(null);
  };

  const columns: TableColumn<Contact>[] = [
    {
      key: 'full_name',
      label: 'Name',
      sortable: true,
      render: (value, contact) => (
        <div className="flex flex-col">
          <div className="font-medium text-gray-900">{value}</div>
          {contact.title && (
            <div className="text-sm text-gray-500">{contact.title}</div>
          )}
        </div>
      ),
    },
    {
      key: 'company',
      label: 'Company',
      sortable: true,
      render: (value) => value || '-',
    },
    {
      key: 'email',
      label: 'Email',
      render: (value) => value ? (
        <div className="flex items-center">
          <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-1" />
          <a 
            href={`mailto:${value}`}
            className="text-primary-600 hover:text-primary-800"
          >
            {value}
          </a>
        </div>
      ) : '-',
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (value) => value ? (
        <div className="flex items-center">
          <PhoneIcon className="h-4 w-4 text-gray-400 mr-1" />
          <a 
            href={`tel:${value}`}
            className="text-primary-600 hover:text-primary-800"
          >
            {value}
          </a>
        </div>
      ) : '-',
    },
    {
      key: 'lead_source',
      label: 'Source',
      render: (value) => value ? (
        <Badge variant="info" size="sm">
          {value}
        </Badge>
      ) : '-',
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (value) => (
        <Badge variant={value ? 'success' : 'gray'} size="sm">
          {value ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_, contact) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(contact);
            }}
            className="p-1 text-gray-400 hover:text-primary-600"
            title="Edit contact"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(contact);
            }}
            className="p-1 text-gray-400 hover:text-red-600"
            title="Delete contact"
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
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your contacts and customer relationships
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Contact
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="text-2xl font-bold text-gray-900">
              {contacts.length}
            </div>
            <div className="text-sm text-gray-600">Total Contacts</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="text-2xl font-bold text-gray-900">
              {contacts.filter(c => c.is_active).length}
            </div>
            <div className="text-sm text-gray-600">Active Contacts</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="text-2xl font-bold text-gray-900">
              {contacts.filter(c => c.company).length}
            </div>
            <div className="text-sm text-gray-600">With Companies</div>
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      <Table
        data={contacts}
        columns={columns}
        loading={isLoading}
      />

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Contact"
        size="lg"
      >
        <ContactForm
          onSuccess={handleFormSuccess}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedContact(null);
        }}
        title="Edit Contact"
        size="lg"
      >
        <ContactForm
          contact={selectedContact}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedContact(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default ContactList;