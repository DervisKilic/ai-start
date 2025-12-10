import { useState, useEffect, type FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';

import { useContact, useCreateContact, useUpdateContact } from '../../api/contacts';
import { Button, Card, Input, LoadingSpinner, BackButton, ErrorMessage } from '../../components/ui';
import { config } from '../../config';
import { useFormSubmission } from '../../hooks/useFormSubmission';

import type { Contact, CreateContactData, UpdateContactData } from '../../api/types';

export default function ContactForm() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const contactId = id ? parseInt(id, 10) : 0;

  const { data: existingContact, isLoading } = useContact(contactId);
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
  });

  useEffect(() => {
    if (existingContact) {
      setFormData({
        name: existingContact.name,
        email: existingContact.email || '',
        phone: existingContact.phone || '',
        company: existingContact.company || '',
      });
    }
  }, [existingContact]);

  const { error, isSubmitting, handleSubmit } = useFormSubmission<
    CreateContactData | UpdateContactData,
    Contact
  >({
    onSubmit: async (data) => {
      if (isEditing) {
        return await updateContact.mutateAsync({ id: contactId, data: data as UpdateContactData });
      } else {
        return await createContact.mutateAsync(data as CreateContactData);
      }
    },
    onSuccess: () => {
      return '/contacts';
    },
    validate: (data) => {
      if (!data.name?.trim()) {
        return 'Name is required';
      }
      if (!data.phone?.trim()) {
        return 'Phone number is required';
      }
      return null;
    },
  });

  const onSubmit = (e: FormEvent) => {
    const data: CreateContactData | UpdateContactData = isEditing
      ? {
          name: formData.name.trim(),
          email: formData.email.trim() || null,
          phone: formData.phone.trim(), // Required - validation ensures it's present
          company: formData.company.trim() || null,
        }
      : {
          name: formData.name.trim(),
          email: formData.email.trim() || null,
          phone: formData.phone.trim(), // Required - validation ensures it's present
          company: formData.company.trim() || null,
        };
    handleSubmit(e, data);
  };

  const fillSampleData = () => {
    setFormData({
      name: 'Mikael Pettersson',
      email: 'mikael.petterson@volvo.com',
      phone: '070-123 45 67',
      company: 'Volvo AB',
    });
  };

  if (isEditing && isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <BackButton to="/contacts" />
        <div>
          <h1 className="text-3xl font-extrabold text-white bg-gradient-to-r from-white to-dark-200 bg-clip-text text-transparent">
            {isEditing ? 'Edit Contact' : 'New Contact'}
          </h1>
          <p className="text-dark-300 mt-2 font-medium">
            {isEditing ? 'Update contact information' : 'Add a new contact to your CRM'}
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={onSubmit} className="space-y-6">
          <ErrorMessage error={error} />

          {/* Developer Tools: Fill Sample Data */}
          {config.developerTools && !isEditing && (
            <div className="mb-6 pb-6 border-b border-dark-700/60">
              <button
                type="button"
                onClick={fillSampleData}
                className="text-xs text-dark-300 hover:text-warm-400 font-medium transition-colors duration-200"
              >
                Fill sample data
              </button>
            </div>
          )}

          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
            required
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="john@company.com"
          />

          <Input
            label="Phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="070-123 45 67"
            required
          />

          <Input
            label="Company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            placeholder="Acme Inc."
          />

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-dark-700/60">
            <Link to="/contacts">
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Saving...
                </span>
              ) : isEditing ? (
                'Save Changes'
              ) : (
                'Create Contact'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

