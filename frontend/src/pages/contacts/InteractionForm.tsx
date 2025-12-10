import { useState, useEffect, type FormEvent } from 'react';
import { Button, Input, Card } from '../../components/ui';

interface InteractionFormProps {
  onSubmit: (data: {
    type: 'call' | 'meeting' | 'email';
    dateTime: string;
    notes?: string | null;
    followUpNeeded?: boolean;
  }) => void | Promise<void>;
  onCancel?: () => void;
  initialData?: {
    type: 'call' | 'meeting' | 'email';
    dateTime: string;
    notes?: string | null;
    followUpNeeded?: boolean;
  };
  isSubmitting?: boolean;
}

export default function InteractionForm({
  onSubmit,
  onCancel,
  initialData,
  isSubmitting = false,
}: InteractionFormProps) {
  const [formData, setFormData] = useState({
    type: 'call' as 'call' | 'meeting' | 'email',
    dateTime: '',
    notes: '',
    followUpNeeded: false,
  });

  useEffect(() => {
    if (initialData) {
      // Convert ISO datetime to local datetime-local format
      const date = new Date(initialData.dateTime);
      const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      
      setFormData({
        type: initialData.type,
        dateTime: localDateTime,
        notes: initialData.notes || '',
        followUpNeeded: initialData.followUpNeeded || false,
      });
    } else {
      // Set default dateTime to now
      const now = new Date();
      const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setFormData({
        type: 'call',
        dateTime: localDateTime,
        notes: '',
        followUpNeeded: false,
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.dateTime) {
      return;
    }

    try {
      // Convert local datetime to ISO string
      const dateTimeISO = new Date(formData.dateTime).toISOString();
      
      await onSubmit({
        type: formData.type,
        dateTime: dateTimeISO,
        notes: formData.notes.trim() || null,
        followUpNeeded: formData.followUpNeeded,
      });
      
      if (!initialData) {
        // Reset form after successful creation
        const now = new Date();
        const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setFormData({
          type: 'call',
          dateTime: localDateTime,
          notes: '',
          followUpNeeded: false,
        });
      }
    } catch (error) {
      // Error handling is done in parent component
      console.error('Form submission error:', error);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Interaction Type */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'call' | 'meeting' | 'email' })}
              className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-warm-500"
              required
            >
              <option value="call">Call</option>
              <option value="meeting">Meeting</option>
              <option value="email">Email</option>
            </select>
          </div>

          {/* Date/Time */}
          <Input
            label="Date & Time"
            type="datetime-local"
            value={formData.dateTime}
            onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
            required
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-warm-500 resize-none"
            placeholder="Add notes about this interaction..."
          />
        </div>

        {/* Follow-up Needed */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="followUpNeeded"
            checked={formData.followUpNeeded}
            onChange={(e) => setFormData({ ...formData, followUpNeeded: e.target.checked })}
            className="w-4 h-4 text-warm-500 bg-dark-800 border-dark-600 rounded focus:ring-warm-500"
          />
          <label htmlFor="followUpNeeded" className="text-sm text-dark-300">
            Follow-up needed
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : initialData ? 'Update Interaction' : 'Add Interaction'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
