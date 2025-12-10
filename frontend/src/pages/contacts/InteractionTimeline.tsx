import { Button, Badge, Card, EmptyState } from '../../components/ui';
import type { Interaction } from '../../api/types';

interface InteractionTimelineProps {
  interactions: Interaction[];
  onEdit: (interaction: Interaction) => void;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
}

const getInteractionIcon = (type: Interaction['type']) => {
  switch (type) {
    case 'call':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      );
    case 'meeting':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case 'email':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
  }
};

const getInteractionTypeColor = (type: Interaction['type']) => {
  switch (type) {
    case 'call':
      return 'text-blue-400';
    case 'meeting':
      return 'text-purple-400';
    case 'email':
      return 'text-green-400';
  }
};

const formatDateTime = (dateTime: string) => {
  const date = new Date(dateTime);
  return {
    date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  };
};

export default function InteractionTimeline({
  interactions,
  onEdit,
  onDelete,
  isDeleting = false,
}: InteractionTimelineProps) {
  if (interactions.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-8 h-8 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        }
        title="No interactions yet"
        message="Start logging interactions with this contact"
      />
    );
  }

  return (
    <div className="space-y-4">
      {interactions.map((interaction) => {
        const { date, time } = formatDateTime(interaction.dateTime);
        const typeColor = getInteractionTypeColor(interaction.type);

        return (
          <Card key={interaction.id} className="relative">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={`flex-shrink-0 ${typeColor}`}>
                {getInteractionIcon(interaction.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-white capitalize">
                        {interaction.type}
                      </span>
                      {interaction.followUpNeeded && (
                        <Badge variant="warm">Follow-up</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-dark-400">
                      <span>{date}</span>
                      <span>•</span>
                      <span>{time}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(interaction)}
                      className="text-warm-400 hover:text-warm-300"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(interaction.id)}
                      disabled={isDeleting}
                      className="text-red-400 hover:text-red-300"
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Notes Preview */}
                {interaction.notes && (
                  <p className="text-sm text-dark-300 mt-2 line-clamp-2">
                    {interaction.notes}
                  </p>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
