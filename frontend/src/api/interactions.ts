import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { Interaction, CreateInteractionData, UpdateInteractionData } from './types';

// API functions
export async function getInteractions(contactId: number): Promise<Interaction[]> {
  const response = await apiClient.get<{ interactions: Interaction[] }>(
    `/api/contacts/${contactId}/interactions`
  );
  return response.interactions;
}

export async function getInteraction(contactId: number, id: number): Promise<Interaction> {
  const response = await apiClient.get<{ interaction: Interaction }>(
    `/api/contacts/${contactId}/interactions/${id}`
  );
  return response.interaction;
}

export async function createInteraction(
  contactId: number,
  data: CreateInteractionData
): Promise<Interaction> {
  const response = await apiClient.post<{ interaction: Interaction }>(
    `/api/contacts/${contactId}/interactions`,
    data
  );
  return response.interaction;
}

export async function updateInteraction(
  contactId: number,
  id: number,
  data: UpdateInteractionData
): Promise<Interaction> {
  const response = await apiClient.put<{ interaction: Interaction }>(
    `/api/contacts/${contactId}/interactions/${id}`,
    data
  );
  return response.interaction;
}

export async function deleteInteraction(contactId: number, id: number): Promise<void> {
  await apiClient.delete(`/api/contacts/${contactId}/interactions/${id}`);
}

// React Query hooks
export function useInteractions(contactId: number) {
  return useQuery({
    queryKey: ['contacts', contactId, 'interactions'],
    queryFn: () => getInteractions(contactId),
    enabled: !!contactId,
  });
}

export function useInteraction(contactId: number, id: number) {
  return useQuery({
    queryKey: ['contacts', contactId, 'interactions', id],
    queryFn: () => getInteraction(contactId, id),
    enabled: !!contactId && !!id,
  });
}

export function useCreateInteraction(contactId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInteractionData) => createInteraction(contactId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', contactId, 'interactions'] });
      queryClient.invalidateQueries({ queryKey: ['contacts', contactId] });
    },
  });
}

export function useUpdateInteraction(contactId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateInteractionData }) =>
      updateInteraction(contactId, id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['contacts', contactId, 'interactions'] });
      queryClient.invalidateQueries({ queryKey: ['contacts', contactId, 'interactions', id] });
      queryClient.invalidateQueries({ queryKey: ['contacts', contactId] });
    },
  });
}

export function useDeleteInteraction(contactId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteInteraction(contactId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', contactId, 'interactions'] });
      queryClient.invalidateQueries({ queryKey: ['contacts', contactId] });
    },
  });
}
