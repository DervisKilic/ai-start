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
} from './setup.js';

describe('Contact Routes', () => {
  let ctx: TestContext;

  beforeEach(async () => {
    ctx = await setupTest();
  });

  describe('GET /api/contacts', () => {
    it('should list own contacts as seller', async () => {
      const data = await expectOk<{ contacts: { name: string }[] }>(
        await get(ctx.app, '/api/contacts', ctx.sellerToken)
      );
      expect(data.contacts).toHaveLength(1);
      expect(data.contacts[0].name).toBe('Test Contact');
    });

    it('should list all contacts as admin', async () => {
      const data = await expectOk<{ contacts: unknown[] }>(
        await get(ctx.app, '/api/contacts', ctx.adminToken)
      );
      expect(data.contacts).toHaveLength(2);
    });

    it('should not see other sellers contacts', async () => {
      const data = await expectOk<{ contacts: { name: string }[] }>(
        await get(ctx.app, '/api/contacts', ctx.seller2Token)
      );
      expect(data.contacts).toHaveLength(1);
      expect(data.contacts[0].name).toBe('Other Contact');
    });
  });

  describe('GET /api/contacts/:id', () => {
    it('should get own contact details', async () => {
      const data = await expectOk<{ contact: { name: string; email: string } }>(
        await get(ctx.app, `/api/contacts/${ctx.contactId}`, ctx.sellerToken)
      );
      expect(data.contact.name).toBe('Test Contact');
      expect(data.contact.email).toBe('contact@test.com');
    });

    it('should get any contact as admin', async () => {
      const data = await expectOk<{ contact: { name: string } }>(
        await get(ctx.app, `/api/contacts/${ctx.contactId}`, ctx.adminToken)
      );
      expect(data.contact.name).toBe('Test Contact');
    });

    it('should deny access to other sellers contact', async () => {
      await expectForbidden(await get(ctx.app, `/api/contacts/${ctx.contactId}`, ctx.seller2Token));
    });

    it('should return 404 for non-existent contact', async () => {
      await expectNotFound(await get(ctx.app, '/api/contacts/9999', ctx.sellerToken));
    });
  });

  describe('POST /api/contacts', () => {
    it('should create contact as seller', async () => {
      const data = await expectCreated<{ contact: { name: string; sellerId: number; id: number } }>(
        await post(ctx.app, '/api/contacts', ctx.sellerToken, {
          name: 'New Contact',
          email: 'new@contact.com',
          phone: '070-123 45 67',
          company: 'New Corp',
        })
      );

      const retrieved = await expectOk<{ contact: { name: string; sellerId: number } }>(
        await get(ctx.app, `/api/contacts/${data.contact.id}`, ctx.sellerToken)
      );
      expect(retrieved.contact.name).toBe('New Contact');
      expect(retrieved.contact.sellerId).toBe(ctx.sellerId);
    });

    it('should create contact with minimal data (name and phone)', async () => {
      const data = await expectCreated<{ contact: { name: string; email: string | null; phone: string; id: number } }>(
        await post(ctx.app, '/api/contacts', ctx.sellerToken, {
          name: 'Minimal Contact',
          phone: '070-111 22 33',
        })
      );

      const retrieved = await expectOk<{ contact: { name: string; email: string | null; phone: string } }>(
        await get(ctx.app, `/api/contacts/${data.contact.id}`, ctx.sellerToken)
      );
      expect(retrieved.contact.name).toBe('Minimal Contact');
      expect(retrieved.contact.email).toBeNull();
      expect(retrieved.contact.phone).toBe('070-111 22 33');
    });

    it('should reject missing phone number', async () => {
      await expectBadRequest(
        await post(ctx.app, '/api/contacts', ctx.sellerToken, {
          name: 'Contact Without Phone',
        })
      );
    });

    it('should reject empty phone number', async () => {
      await expectBadRequest(
        await post(ctx.app, '/api/contacts', ctx.sellerToken, {
          name: 'Contact With Empty Phone',
          phone: '',
        })
      );
    });

    it('should reject missing name', async () => {
      await expectBadRequest(
        await post(ctx.app, '/api/contacts', ctx.sellerToken, {
          email: 'no-name@test.com',
        })
      );
    });

    it('should reject invalid email format', async () => {
      await expectBadRequest(
        await post(ctx.app, '/api/contacts', ctx.sellerToken, {
          name: 'Bad Email Contact',
          email: 'not-an-email',
        })
      );
    });

    it('should create contact with phone number', async () => {
      const data = await expectCreated<{ contact: { name: string; phone: string | null; id: number } }>(
        await post(ctx.app, '/api/contacts', ctx.sellerToken, {
          name: 'Contact With Phone',
          phone: '070-123 45 67',
        })
      );

      const retrieved = await expectOk<{ contact: { name: string; phone: string | null } }>(
        await get(ctx.app, `/api/contacts/${data.contact.id}`, ctx.sellerToken)
      );
      expect(retrieved.contact.name).toBe('Contact With Phone');
      expect(retrieved.contact.phone).toBe('070-123 45 67');
    });


    it('should return phone number in contact list', async () => {
      // Create a contact with phone
      await post(ctx.app, '/api/contacts', ctx.sellerToken, {
        name: 'Listed Contact',
        phone: '+46 70 123 45 67',
      });

      const data = await expectOk<{ contacts: Array<{ name: string; phone: string }> }>(
        await get(ctx.app, '/api/contacts', ctx.sellerToken)
      );
      
      const contactWithPhone = data.contacts.find(c => c.name === 'Listed Contact');
      expect(contactWithPhone).toBeDefined();
      expect(contactWithPhone?.phone).toBe('+46 70 123 45 67');
    });

    it('should accept various phone number formats', async () => {
      const formats = [
        '070-123 45 67',
        '+46 70 123 45 67',
        '0701234567',
        '070 123 45 67',
      ];

      for (const phoneFormat of formats) {
        const data = await expectCreated<{ contact: { phone: string } }>(
          await post(ctx.app, '/api/contacts', ctx.sellerToken, {
            name: `Contact ${phoneFormat}`,
            phone: phoneFormat,
          })
        );
        expect(data.contact.phone).toBe(phoneFormat);
      }
    });
  });

  describe('PUT /api/contacts/:id', () => {
    it('should update own contact as seller', async () => {
      const data = await expectOk<{ contact: { name: string } }>(
        await put(ctx.app, `/api/contacts/${ctx.contactId}`, ctx.sellerToken, {
          name: 'Updated Contact Name',
        })
      );

      const retrieved = await expectOk<{ contact: { name: string } }>(
        await get(ctx.app, `/api/contacts/${ctx.contactId}`, ctx.sellerToken)
      );
      expect(retrieved.contact.name).toBe('Updated Contact Name');
    });

    it('should update contact email', async () => {
      const data = await expectOk<{ contact: { email: string | null } }>(
        await put(ctx.app, `/api/contacts/${ctx.contactId}`, ctx.sellerToken, {
          email: 'updated@contact.com',
        })
      );

      const retrieved = await expectOk<{ contact: { email: string | null } }>(
        await get(ctx.app, `/api/contacts/${ctx.contactId}`, ctx.sellerToken)
      );
      expect(retrieved.contact.email).toBe('updated@contact.com');
    });

    it('should update contact phone', async () => {
      const data = await expectOk<{ contact: { phone: string } }>(
        await put(ctx.app, `/api/contacts/${ctx.contactId}`, ctx.sellerToken, {
          phone: '070-123 45 67',
        })
      );

      const retrieved = await expectOk<{ contact: { phone: string } }>(
        await get(ctx.app, `/api/contacts/${ctx.contactId}`, ctx.sellerToken)
      );
      expect(retrieved.contact.phone).toBe('070-123 45 67');
    });

    it('should reject setting phone to empty string', async () => {
      await expectBadRequest(
        await put(ctx.app, `/api/contacts/${ctx.contactId}`, ctx.sellerToken, {
          phone: '',
        })
      );
    });

    it('should reject setting phone to null', async () => {
      await expectBadRequest(
        await put(ctx.app, `/api/contacts/${ctx.contactId}`, ctx.sellerToken, {
          phone: null,
        })
      );
    });

    it('should update contact company', async () => {
      const data = await expectOk<{ contact: { company: string | null } }>(
        await put(ctx.app, `/api/contacts/${ctx.contactId}`, ctx.sellerToken, {
          company: 'Updated Corp',
        })
      );

      const retrieved = await expectOk<{ contact: { company: string | null } }>(
        await get(ctx.app, `/api/contacts/${ctx.contactId}`, ctx.sellerToken)
      );
      expect(retrieved.contact.company).toBe('Updated Corp');
    });

    it('should update multiple fields at once', async () => {
      const data = await expectOk<{ contact: { name: string; email: string | null; phone: string; company: string | null } }>(
        await put(ctx.app, `/api/contacts/${ctx.contactId}`, ctx.sellerToken, {
          name: 'Fully Updated Contact',
          email: 'full@update.com',
          phone: '+46 70 123 45 67',
          company: 'Updated Company',
        })
      );

      const retrieved = await expectOk<{ contact: { name: string; email: string | null; phone: string; company: string | null } }>(
        await get(ctx.app, `/api/contacts/${ctx.contactId}`, ctx.sellerToken)
      );
      expect(retrieved.contact.name).toBe('Fully Updated Contact');
      expect(retrieved.contact.email).toBe('full@update.com');
      expect(retrieved.contact.phone).toBe('+46 70 123 45 67');
      expect(retrieved.contact.company).toBe('Updated Company');
    });

    it('should update any contact as admin', async () => {
      const data = await expectOk<{ contact: { name: string } }>(
        await put(ctx.app, `/api/contacts/${ctx.contact2Id}`, ctx.adminToken, {
          name: 'Admin Updated Contact',
        })
      );

      const retrieved = await expectOk<{ contact: { name: string } }>(
        await get(ctx.app, `/api/contacts/${ctx.contact2Id}`, ctx.adminToken)
      );
      expect(retrieved.contact.name).toBe('Admin Updated Contact');
    });

    it('should deny update of other sellers contact', async () => {
      await expectForbidden(
        await put(ctx.app, `/api/contacts/${ctx.contactId}`, ctx.seller2Token, {
          name: 'Unauthorized Update',
        })
      );
    });

    it('should return 404 for non-existent contact', async () => {
      await expectNotFound(
        await put(ctx.app, '/api/contacts/9999', ctx.sellerToken, {
          name: 'Updated',
        })
      );
    });

    it('should reject invalid email format', async () => {
      await expectBadRequest(
        await put(ctx.app, `/api/contacts/${ctx.contactId}`, ctx.sellerToken, {
          email: 'not-an-email',
        })
      );
    });

    it('should allow setting optional fields to null', async () => {
      const data = await expectOk<{ contact: { email: string | null; company: string | null; phone: string } }>(
        await put(ctx.app, `/api/contacts/${ctx.contactId}`, ctx.sellerToken, {
          email: null,
          company: null,
        })
      );

      const retrieved = await expectOk<{ contact: { email: string | null; company: string | null; phone: string } }>(
        await get(ctx.app, `/api/contacts/${ctx.contactId}`, ctx.sellerToken)
      );
      expect(retrieved.contact.email).toBeNull();
      expect(retrieved.contact.company).toBeNull();
      // Phone should still be present (not null)
      expect(retrieved.contact.phone).toBeTruthy();
    });

    it('should update updatedAt timestamp', async () => {
      const before = await expectOk<{ contact: { updatedAt: string } }>(
        await get(ctx.app, `/api/contacts/${ctx.contactId}`, ctx.sellerToken)
      );

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      await expectOk(
        await put(ctx.app, `/api/contacts/${ctx.contactId}`, ctx.sellerToken, {
          name: 'Timestamp Test',
        })
      );

      const after = await expectOk<{ contact: { updatedAt: string } }>(
        await get(ctx.app, `/api/contacts/${ctx.contactId}`, ctx.sellerToken)
      );

      expect(new Date(after.contact.updatedAt).getTime()).toBeGreaterThan(new Date(before.contact.updatedAt).getTime());
    });
  });

  describe('DELETE /api/contacts/:id', () => {
    it('should delete own contact', async () => {
      await expectOk(await del(ctx.app, `/api/contacts/${ctx.contactId}`, ctx.sellerToken));

      // Verify deleted
      await expectNotFound(await get(ctx.app, `/api/contacts/${ctx.contactId}`, ctx.sellerToken));
    });

    it('should delete any contact as admin', async () => {
      await expectOk(await del(ctx.app, `/api/contacts/${ctx.contact2Id}`, ctx.adminToken));
    });

    it('should deny delete of other sellers contact', async () => {
      await expectForbidden(await del(ctx.app, `/api/contacts/${ctx.contactId}`, ctx.seller2Token));
    });

    it('should return 404 for non-existent contact', async () => {
      await expectNotFound(await del(ctx.app, '/api/contacts/9999', ctx.sellerToken));
    });
  });
});

