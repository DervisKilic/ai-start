import { useState, useEffect } from 'react';
import { useContact } from '../../api/contacts';
import { useInteractions, useCreateInteraction, useUpdateInteraction, useDeleteInteraction } from '../../api/interactions';
import { Drawer, LoadingSpinner, Avatar, Card, ErrorMessage } from '../../components/ui';
import InteractionForm from './InteractionForm';
import InteractionTimeline from './InteractionTimeline';
import type { Interaction } from '../../api/types';

interface ContactDetailDrawerProps {
  contactId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactDetailDrawer({ contactId, isOpen, onClose }: ContactDetailDrawerProps) {
  const [editingInteraction, setEditingInteraction] = useState<Interaction | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { data: contact, isLoading: contactLoading } = useContact(contactId || 0);
  const { data: interactions = [], isLoading: interactionsLoading } = useInteractions(contactId || 0);
  const createInteraction = useCreateInteraction(contactId || 0);
  const updateInteraction = useUpdateInteraction(contactId || 0);
  const deleteInteraction = useDeleteInteraction(contactId || 0);

  // Reset editing state when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setEditingInteraction(null);
      setError(null);
    }
  }, [isOpen]);

  const handleCreateInteraction = async (data: {
    type: 'call' | 'meeting' | 'email';
    dateTime: string;
    notes?: string | null;
    followUpNeeded?: boolean;
  }) => {
    try {
      setError(null);
      await createInteraction.mutateAsync(data);
      // Form will reset itself after successful submission
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create interaction');
    }
  };

  const handleUpdateInteraction = async (
    id: number,
    data: {
      type?: 'call' | 'meeting' | 'email';
      dateTime?: string;
      notes?: string | null;
      followUpNeeded?: boolean;
    }
  ) => {
    try {
      setError(null);
      await updateInteraction.mutateAsync({ id, data });
      setEditingInteraction(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update interaction');
    }
  };

  const handleDeleteInteraction = async (id: number) => {
    if (!confirm('Are you sure you want to delete this interaction?')) {
      return;
    }

    try {
      setError(null);
      await deleteInteraction.mutateAsync(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete interaction');
    }
  };

  const handleEditInteraction = (interaction: Interaction) => {
    setEditingInteraction(interaction);
    setError(null);
    // Scroll to form
    setTimeout(() => {
      const formElement = document.querySelector('[data-interaction-form]');
      formElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCancelEdit = () => {
    setEditingInteraction(null);
    setError(null);
  };

  if (!contactId) return null;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={contact?.name || 'Contact Details'}>
      {contactLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="md" />
        </div>
      ) : contact ? (
        <div className="space-y-8">
          {/* Contact Info Section */}
          <Card>
            <div className="flex items-start gap-5">
              <Avatar name={contact.name} size="lg" />
              <div className="flex-1">
                <h3 className="text-2xl font-extrabold text-white mb-3 bg-gradient-to-r from-white to-dark-200 bg-clip-text text-transparent">{contact.name}</h3>
                <div className="space-y-2 text-sm text-dark-200">
                  {contact.company && <p className="font-medium">Company: <span className="text-dark-300">{contact.company}</span></p>}
                  {contact.email && <p className="font-medium">Email: <span className="text-dark-300">{contact.email}</span></p>}
                  <p className="font-medium">Phone: <span className="text-dark-300">{contact.phone}</span></p>
                </div>
              </div>
            </div>
          </Card>

          {/* Interactions Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-xl font-bold text-white">Interactions</h4>
            </div>

            {/* Error Message */}
            {error && <ErrorMessage error={error} />}

            {/* Interaction Form */}
            <div data-interaction-form>
              <InteractionForm
                onSubmit={
                  editingInteraction
                    ? (data) => handleUpdateInteraction(editingInteraction.id, data)
                    : handleCreateInteraction
                }
                onCancel={editingInteraction ? handleCancelEdit : undefined}
                initialData={
                  editingInteraction
                    ? {
                        type: editingInteraction.type,
                        dateTime: editingInteraction.dateTime,
                        notes: editingInteraction.notes || '',
                        followUpNeeded: editingInteraction.followUpNeeded,
                      }
                    : undefined
                }
                isSubmitting={createInteraction.isPending || updateInteraction.isPending}
              />
            </div>

            {/* Interactions Timeline */}
            {interactionsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              <InteractionTimeline
                interactions={interactions}
                onEdit={handleEditInteraction}
                onDelete={handleDeleteInteraction}
                isDeleting={deleteInteraction.isPending}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-dark-400">Contact not found</div>
      )}
    </Drawer>
  );
}
