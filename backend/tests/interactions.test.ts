import { describe, it, expect, beforeEach } from 'vitest';
import {
  setupTest,
  get,
  post,
  put,
  del,
  expectOk,
  expectCreated,
  expectNotFound,
  expectForbidden,
  expectBadRequest,
  type TestContext,
  createTestContact,
} from './setup.js';

describe('Interaction Routes', () => {
  let ctx: TestContext;

  beforeEach(async () => {
    ctx = await setupTest();
  });

  describe('GET /api/contacts/:contactId/interactions', () => {
    it('should list interactions for own contact as seller', async () => {
      const data = await expectOk<{ interactions: unknown[] }>(
        await get(ctx.app, `/api/contacts/${ctx.contactId}/interactions`, ctx.sellerToken)
      );
      expect(data.interactions).toHaveLength(0);
    });

    it('should list interactions for any contact as admin', async () => {
      const data = await expectOk<{ interactions: unknown[] }>(
        await get(ctx.app, `/api/contacts/${ctx.contactId}/interactions`, ctx.adminToken)
      );
      expect(data.interactions).toHaveLength(0);
    });

    it('should deny access to other sellers contact interactions', async () => {
      await expectForbidden(
        await get(ctx.app, `/api/contacts/${ctx.contactId}/interactions`, ctx.seller2Token)
      );
    });

    it('should return 404 for non-existent contact', async () => {
      await expectNotFound(
        await get(ctx.app, '/api/contacts/9999/interactions', ctx.sellerToken)
      );
    });

    it('should return interactions ordered by date descending', async () => {
      // Create interactions with different dates
      const now = new Date().toISOString();
      const earlier = new Date(Date.now() - 86400000).toISOString(); // 1 day ago
      const later = new Date(Date.now() + 86400000).toISOString(); // 1 day from now

      // Create interactions (will fail until implemented, but test structure is correct)
      await post(ctx.app, `/api/contacts/${ctx.contactId}/interactions`, ctx.sellerToken, {
        type: 'call',
        dateTime: earlier,
        notes: 'First call',
        followUpNeeded: false,
      });

      await post(ctx.app, `/api/contacts/${ctx.contactId}/interactions`, ctx.sellerToken, {
        type: 'meeting',
        dateTime: later,
        notes: 'Later meeting',
        followUpNeeded: true,
      });

      const data = await expectOk<{ interactions: Array<{ notes: string; dateTime: string }> }>(
        await get(ctx.app, `/api/contacts/${ctx.contactId}/interactions`, ctx.sellerToken)
      );

      expect(data.interactions).toHaveLength(2);
      expect(data.interactions[0].dateTime).toBe(later);
      expect(data.interactions[1].dateTime).toBe(earlier);
    });
  });

  describe('GET /api/contacts/:contactId/interactions/:id', () => {
    it('should get interaction details for own contact', async () => {
      // Create interaction first
      const created = await expectCreated<{ interaction: { id: number } }>(
        await post(ctx.app, `/api/contacts/${ctx.contactId}/interactions`, ctx.sellerToken, {
          type: 'call',
          dateTime: new Date().toISOString(),
          notes: 'Test call',
          followUpNeeded: false,
        })
      );

      const data = await expectOk<{ interaction: { notes: string; type: string } }>(
        await get(
          ctx.app,
          `/api/contacts/${ctx.contactId}/interactions/${created.interaction.id}`,
          ctx.sellerToken
        )
      );

      expect(data.interaction.notes).toBe('Test call');
      expect(data.interaction.type).toBe('call');
    });

    it('should get interaction as admin for any contact', async () => {
      const created = await expectCreated<{ interaction: { id: number } }>(
        await post(ctx.app, `/api/contacts/${ctx.contactId}/interactions`, ctx.sellerToken, {
          type: 'email',
          dateTime: new Date().toISOString(),
          notes: 'Admin view',
        })
      );

      const data = await expectOk<{ interaction: { notes: string } }>(
        await get(
          ctx.app,
          `/api/contacts/${ctx.contactId}/interactions/${created.interaction.id}`,
          ctx.adminToken
        )
      );

      expect(data.interaction.notes).toBe('Admin view');
    });

    it('should deny access to other sellers contact interaction', async () => {
      const created = await expectCreated<{ interaction: { id: number } }>(
        await post(ctx.app, `/api/contacts/${ctx.contactId}/interactions`, ctx.sellerToken, {
          type: 'call',
          dateTime: new Date().toISOString(),
        })
      );

      await expectForbidden(
        await get(
          ctx.app,
          `/api/contacts/${ctx.contactId}/interactions/${created.interaction.id}`,
          ctx.seller2Token
        )
      );
    });

    it('should return 404 for non-existent interaction', async () => {
      await expectNotFound(
        await get(ctx.app, `/api/contacts/${ctx.contactId}/interactions/9999`, ctx.sellerToken)
      );
    });

    it('should return 404 for interaction of non-existent contact', async () => {
      await expectNotFound(
        await get(ctx.app, '/api/contacts/9999/interactions/1', ctx.sellerToken)
      );
    });
  });

  describe('POST /api/contacts/:contactId/interactions', () => {
    it('should create interaction for own contact', async () => {
      const dateTime = new Date().toISOString();
      const data = await expectCreated<{
        interaction: { id: number; type: string; dateTime: string; notes: string | null; followUpNeeded: boolean };
      }>(
        await post(ctx.app, `/api/contacts/${ctx.contactId}/interactions`, ctx.sellerToken, {
          type: 'call',
          dateTime,
          notes: 'Had a great call',
          followUpNeeded: true,
        })
      );

      expect(data.interaction.type).toBe('call');
      expect(data.interaction.dateTime).toBe(dateTime);
      expect(data.interaction.notes).toBe('Had a great call');
      expect(data.interaction.followUpNeeded).toBe(true);
    });

    it('should create interaction with minimal data', async () => {
      const dateTime = new Date().toISOString();
      const data = await expectCreated<{
        interaction: { type: string; dateTime: string; notes: string | null; followUpNeeded: boolean };
      }>(
        await post(ctx.app, `/api/contacts/${ctx.contactId}/interactions`, ctx.sellerToken, {
          type: 'email',
          dateTime,
        })
      );

      expect(data.interaction.type).toBe('email');
      expect(data.interaction.notes).toBeNull();
      expect(data.interaction.followUpNeeded).toBe(false);
    });

    it('should create interaction as admin for any contact', async () => {
      const dateTime = new Date().toISOString();
      const data = await expectCreated<{ interaction: { type: string } }>(
        await post(ctx.app, `/api/contacts/${ctx.contact2Id}/interactions`, ctx.adminToken, {
          type: 'meeting',
          dateTime,
          notes: 'Admin created meeting',
        })
      );

      expect(data.interaction.type).toBe('meeting');
    });

    it('should deny creation for other sellers contact', async () => {
      await expectForbidden(
        await post(ctx.app, `/api/contacts/${ctx.contactId}/interactions`, ctx.seller2Token, {
          type: 'call',
          dateTime: new Date().toISOString(),
        })
      );
    });

    it('should reject invalid interaction type', async () => {
      await expectBadRequest(
        await post(ctx.app, `/api/contacts/${ctx.contactId}/interactions`, ctx.sellerToken, {
          type: 'invalid',
          dateTime: new Date().toISOString(),
        })
      );
    });

    it('should reject missing dateTime', async () => {
      await expectBadRequest(
        await post(ctx.app, `/api/contacts/${ctx.contactId}/interactions`, ctx.sellerToken, {
          type: 'call',
        })
      );
    });

    it('should reject invalid dateTime format', async () => {
      await expectBadRequest(
        await post(ctx.app, `/api/contacts/${ctx.contactId}/interactions`, ctx.sellerToken, {
          type: 'call',
          dateTime: 'not-a-date',
        })
      );
    });

    it('should accept all interaction types', async () => {
      const dateTime = new Date().toISOString();
      const types = ['call', 'meeting', 'email'] as const;

      for (const type of types) {
        const data = await expectCreated<{ interaction: { type: string } }>(
          await post(ctx.app, `/api/contacts/${ctx.contactId}/interactions`, ctx.sellerToken, {
            type,
            dateTime,
          })
        );
        expect(data.interaction.type).toBe(type);
      }
    });

    it('should return 404 for non-existent contact', async () => {
      await expectNotFound(
        await post(ctx.app, '/api/contacts/9999/interactions', ctx.sellerToken, {
          type: 'call',
          dateTime: new Date().toISOString(),
        })
      );
    });
  });

  describe('PUT /api/contacts/:contactId/interactions/:id', () => {
    it('should update interaction for own contact', async () => {
      const dateTime = new Date().toISOString();
      const created = await expectCreated<{ interaction: { id: number } }>(
        await post(ctx.app, `/api/contacts/${ctx.contactId}/interactions`, ctx.sellerToken, {
          type: 'call',
          dateTime,
          notes: 'Original notes',
          followUpNeeded: false,
        })
      );

      const updated = await expectOk<{ interaction: { notes: string; followUpNeeded: boolean } }>(
        await put(
          ctx.app,
          `/api/contacts/${ctx.contactId}/interactions/${created.interaction.id}`,
          ctx.sellerToken,
          {
            notes: 'Updated notes',
            followUpNeeded: true,
          }
        )
      );

      expect(updated.interaction.notes).toBe('Updated notes');
      expect(updated.interaction.followUpNeeded).toBe(true);
    });

    it('should update interaction type', async () => {
      const dateTime = new Date().toISOString();
      const created = await expectCreated<{ interaction: { id: number } }>(
        await post(ctx.app, `/api/contacts/${ctx.contactId}/interactions`, ctx.sellerToken, {
          type: 'call',
          dateTime,
        })
      );

      const updated = await expectOk<{ interaction: { type: string } }>(
        await put(
          ctx.app,
          `/api/contacts/${ctx.contactId}/interactions/${created.interaction.id}`,
          ctx.sellerToken,
          {
            type: 'meeting',
          }
        )
      );

      expect(updated.interaction.type).toBe('meeting');
    });

    it('should update interaction dateTime', async () => {
      const originalDateTime = new Date().toISOString();
      const newDateTime = new Date(Date.now() + 86400000).toISOString();

      const created = await expectCreated<{ interaction: { id: number } }>(
        await post(ctx.app, `/api/contacts/${ctx.contactId}/interactions`, ctx.sellerToken, {
          type: 'call',
          dateTime: originalDateTime,
        })
      );

      const updated = await expectOk<{ interaction: { dateTime: string } }>(
        await put(
          ctx.app,
          `/api/contacts/${ctx.contactId}/interactions/${created.interaction.id}`,
          ctx.sellerToken,
          {
            dateTime: newDateTime,
          }
        )
      );

      expect(updated.interaction.dateTime).toBe(newDateTime);
    });

    it('should update interaction as admin for any contact', async () => {
      const dateTime = new Date().toISOString();
      const created = await expectCreated<{ interaction: { id: number } }>(
        await post(ctx.app, `/api/contacts/${ctx.contactId}/interactions`, ctx.sellerToken, {
          type: 'call',
          dateTime,
        })
      );

      const updated = await expectOk<{ interaction: { notes: string } }>(
        await put(
          ctx.app,
          `/api/contacts/${ctx.contactId}/interactions/${created.interaction.id}`,
          ctx.adminToken,
          {
            notes: 'Admin updated',
          }
        )
      );

      expect(updated.interaction.notes).toBe('Admin updated');
    });

    it('should deny update of other sellers contact interaction', async () => {
      const dateTime = new Date().toISOString();
      const created = await expectCreated<{ interaction: { id: number } }>(
        await post(ctx.app, `/api/contacts/${ctx.contactId}/interactions`, ctx.sellerToken, {
          type: 'call',
          dateTime,
        })
      );

      await expectForbidden(
        await put(
          ctx.app,
          `/api/contacts/${ctx.contactId}/interactions/${created.interaction.id}`,
          ctx.seller2Token,
          {
            notes: 'Unauthorized update',
          }
        )
      );
    });

    it('should reject invalid interaction type', async () => {
      const dateTime = new Date().toISOString();
      const created = await expectCreated<{ interaction: { id: number } }>(
        await post(ctx.app, `/api/contacts/${ctx.contactId}/interactions`, ctx.sellerToken, {
          type: 'call',
          dateTime,
        })
      );

      await expectBadRequest(
        await put(
          ctx.app,
          `/api/contacts/${ctx.contactId}/interactions/${created.interaction.id}`,
          ctx.sellerToken,
          {
            type: 'invalid',
          }
        )
      );
    });

    it('should reject invalid dateTime format', async () => {
      const dateTime = new Date().toISOString();
      const created = await expectCreated<{ interaction: { id: number } }>(
        await post(ctx.app, `/api/contacts/${ctx.contactId}/interactions`, ctx.sellerToken, {
          type: 'call',
          dateTime,
        })
      );

      await expectBadRequest(
        await put(
          ctx.app,
          `/api/contacts/${ctx.contactId}/interactions/${created.interaction.id}`,
          ctx.sellerToken,
          {
            dateTime: 'not-a-date',
          }
        )
      );
    });

    it('should return 404 for non-existent interaction', async () => {
      await expectNotFound(
        await put(
          ctx.app,
          `/api/contacts/${ctx.contactId}/interactions/9999`,
          ctx.sellerToken,
          {
            notes: 'Update',
          }
        )
      );
    });

    it('should update updatedAt timestamp', async () => {
      const dateTime = new Date().toISOString();
      const created = await expectCreated<{ interaction: { id: number } }>(
        await post(ctx.app, `/api/contacts/${ctx.contactId}/interactions`, ctx.sellerToken, {
          type: 'call',
          dateTime,
        })
      );

      const before = await expectOk<{ interaction: { updatedAt: string } }>(
        await get(
          ctx.app,
          `/api/contacts/${ctx.contactId}/interactions/${created.interaction.id}`,
          ctx.sellerToken
        )
      );

      await new Promise((resolve) => setTimeout(resolve, 10));

      await expectOk(
        await put(
          ctx.app,
          `/api/contacts/${ctx.contactId}/interactions/${created.interaction.id}`,
          ctx.sellerToken,
          {
            notes: 'Updated',
          }
        )
      );

      const after = await expectOk<{ interaction: { updatedAt: string } }>(
        await get(
          ctx.app,
          `/api/contacts/${ctx.contactId}/interactions/${created.interaction.id}`,
          ctx.sellerToken
        )
      );

      expect(new Date(after.interaction.updatedAt).getTime()).toBeGreaterThan(
        new Date(before.interaction.updatedAt).getTime()
      );
    });
  });

  describe('DELETE /api/contacts/:contactId/interactions/:id', () => {
    it('should delete interaction for own contact', async () => {
      const dateTime = new Date().toISOString();
      const created = await expectCreated<{ interaction: { id: number } }>(
        await post(ctx.app, `/api/contacts/${ctx.contactId}/interactions`, ctx.sellerToken, {
          type: 'call',
          dateTime,
        })
      );

      await expectOk(
        await del(
          ctx.app,
          `/api/contacts/${ctx.contactId}/interactions/${created.interaction.id}`,
          ctx.sellerToken
        )
      );

      // Verify deleted
      await expectNotFound(
        await get(
          ctx.app,
          `/api/contacts/${ctx.contactId}/interactions/${created.interaction.id}`,
          ctx.sellerToken
        )
      );
    });

    it('should delete interaction as admin for any contact', async () => {
      const dateTime = new Date().toISOString();
      const created = await expectCreated<{ interaction: { id: number } }>(
        await post(ctx.app, `/api/contacts/${ctx.contactId}/interactions`, ctx.sellerToken, {
          type: 'call',
          dateTime,
        })
      );

      await expectOk(
        await del(
          ctx.app,
          `/api/contacts/${ctx.contactId}/interactions/${created.interaction.id}`,
          ctx.adminToken
        )
      );
    });

    it('should deny delete of other sellers contact interaction', async () => {
      const dateTime = new Date().toISOString();
      const created = await expectCreated<{ interaction: { id: number } }>(
        await post(ctx.app, `/api/contacts/${ctx.contactId}/interactions`, ctx.sellerToken, {
          type: 'call',
          dateTime,
        })
      );

      await expectForbidden(
        await del(
          ctx.app,
          `/api/contacts/${ctx.contactId}/interactions/${created.interaction.id}`,
          ctx.seller2Token
        )
      );
    });

    it('should return 404 for non-existent interaction', async () => {
      await expectNotFound(
        await del(ctx.app, `/api/contacts/${ctx.contactId}/interactions/9999`, ctx.sellerToken)
      );
    });

    it('should cascade delete interactions when contact is deleted', async () => {
      // Create a new contact
      const newContact = createTestContact(ctx.db, ctx.sellerId, { name: 'Temp Contact' });

      // Create interactions for this contact
      const dateTime = new Date().toISOString();
      const interaction1 = await expectCreated<{ interaction: { id: number } }>(
        await post(
          ctx.app,
          `/api/contacts/${newContact.id}/interactions`,
          ctx.sellerToken,
          {
            type: 'call',
            dateTime,
          }
        )
      );

      const interaction2 = await expectCreated<{ interaction: { id: number } }>(
        await post(
          ctx.app,
          `/api/contacts/${newContact.id}/interactions`,
          ctx.sellerToken,
          {
            type: 'email',
            dateTime,
          }
        )
      );

      // Delete the contact
      await expectOk(await del(ctx.app, `/api/contacts/${newContact.id}`, ctx.sellerToken));

      // Verify interactions are also deleted
      await expectNotFound(
        await get(
          ctx.app,
          `/api/contacts/${newContact.id}/interactions/${interaction1.interaction.id}`,
          ctx.sellerToken
        )
      );

      await expectNotFound(
        await get(
          ctx.app,
          `/api/contacts/${newContact.id}/interactions/${interaction2.interaction.id}`,
          ctx.sellerToken
        )
      );
    });
  });
});
