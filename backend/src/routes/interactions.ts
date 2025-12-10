import { Hono, Context } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from '../db/schema.js';
import { type AuthVariables } from '../middleware/auth.js';
import { parseIdParam, checkSellerAccess, buildUpdateValues } from './helpers.js';
import { ERROR_MESSAGES, ROLES } from '../constants.js';

const createInteractionSchema = z.object({
  type: z.enum(['call', 'meeting', 'email']),
  dateTime: z.string().datetime(),
  notes: z.string().optional().nullable(),
  followUpNeeded: z.boolean().optional().default(false),
});

const updateInteractionSchema = z.object({
  type: z.enum(['call', 'meeting', 'email']).optional(),
  dateTime: z.string().datetime().optional(),
  notes: z.string().optional().nullable(),
  followUpNeeded: z.boolean().optional(),
});

// Helper to check contact access and return contact if accessible
function checkContactAccess(
  c: Context<{ Variables: AuthVariables }>,
  db: BetterSQLite3Database<typeof schema>,
  contactId: number
): { success: true; contact: schema.Contact } | { success: false; response: Response } {
  const user = c.get('user');
  const contact = db.select().from(schema.contacts).where(eq(schema.contacts.id, contactId)).get();

  if (!contact) {
    return { success: false, response: c.json({ error: ERROR_MESSAGES.CONTACT_NOT_FOUND }, 404) };
  }

  const accessDenied = checkSellerAccess(user, contact.sellerId);
  if (accessDenied) {
    return { success: false, response: c.json({ error: accessDenied.error }, 403) };
  }

  return { success: true, contact };
}

export function createInteractionRoutes(db: BetterSQLite3Database<typeof schema>) {
  const app = new Hono<{ Variables: AuthVariables }>();

  // GET /contacts/:contactId/interactions - List interactions for a contact
  app.get('/:contactId/interactions', (c) => {
    const parsed = parseIdParam(c, 'contactId', 'Contact');
    if (!parsed.success) return parsed.response;

    const contactCheck = checkContactAccess(c, db, parsed.id);
    if (!contactCheck.success) return contactCheck.response;

    const interactions = db
      .select()
      .from(schema.interactions)
      .where(eq(schema.interactions.contactId, parsed.id))
      .orderBy(desc(schema.interactions.dateTime))
      .all();

    return c.json({ interactions });
  });

  // GET /contacts/:contactId/interactions/:id - Get interaction details
  app.get('/:contactId/interactions/:id', (c) => {
    const contactParsed = parseIdParam(c, 'contactId', 'Contact');
    if (!contactParsed.success) return contactParsed.response;

    const contactCheck = checkContactAccess(c, db, contactParsed.id);
    if (!contactCheck.success) return contactCheck.response;

    const interactionParsed = parseIdParam(c, 'id', 'Interaction');
    if (!interactionParsed.success) return interactionParsed.response;

    const interaction = db
      .select()
      .from(schema.interactions)
      .where(eq(schema.interactions.id, interactionParsed.id))
      .get();

    if (!interaction) {
      return c.json({ error: ERROR_MESSAGES.notFound('Interaction') }, 404);
    }

    if (interaction.contactId !== contactParsed.id) {
      return c.json({ error: ERROR_MESSAGES.notFound('Interaction') }, 404);
    }

    return c.json({ interaction });
  });

  // POST /contacts/:contactId/interactions - Create new interaction
  app.post('/:contactId/interactions', zValidator('json', createInteractionSchema), (c) => {
    const parsed = parseIdParam(c, 'contactId', 'Contact');
    if (!parsed.success) return parsed.response;

    const contactCheck = checkContactAccess(c, db, parsed.id);
    if (!contactCheck.success) return contactCheck.response;

    const data = c.req.valid('json');
    const now = new Date().toISOString();

    const interaction = db
      .insert(schema.interactions)
      .values({
        contactId: parsed.id,
        type: data.type,
        dateTime: data.dateTime,
        notes: data.notes ?? null,
        followUpNeeded: data.followUpNeeded ?? false,
        createdAt: now,
        updatedAt: now,
      })
      .returning()
      .get();

    return c.json({ interaction }, 201);
  });

  // PUT /contacts/:contactId/interactions/:id - Update interaction
  app.put('/:contactId/interactions/:id', zValidator('json', updateInteractionSchema), (c) => {
    const contactParsed = parseIdParam(c, 'contactId', 'Contact');
    if (!contactParsed.success) return contactParsed.response;

    const contactCheck = checkContactAccess(c, db, contactParsed.id);
    if (!contactCheck.success) return contactCheck.response;

    const interactionParsed = parseIdParam(c, 'id', 'Interaction');
    if (!interactionParsed.success) return interactionParsed.response;

    const existing = db
      .select()
      .from(schema.interactions)
      .where(eq(schema.interactions.id, interactionParsed.id))
      .get();

    if (!existing) {
      return c.json({ error: ERROR_MESSAGES.notFound('Interaction') }, 404);
    }

    if (existing.contactId !== contactParsed.id) {
      return c.json({ error: ERROR_MESSAGES.notFound('Interaction') }, 404);
    }

    const updates = c.req.valid('json');
    const updateValues = buildUpdateValues(updates, ['type', 'dateTime', 'notes', 'followUpNeeded']);

    const interaction = db
      .update(schema.interactions)
      .set(updateValues)
      .where(eq(schema.interactions.id, interactionParsed.id))
      .returning()
      .get();

    return c.json({ interaction });
  });

  // DELETE /contacts/:contactId/interactions/:id - Delete interaction
  app.delete('/:contactId/interactions/:id', (c) => {
    const contactParsed = parseIdParam(c, 'contactId', 'Contact');
    if (!contactParsed.success) return contactParsed.response;

    const contactCheck = checkContactAccess(c, db, contactParsed.id);
    if (!contactCheck.success) return contactCheck.response;

    const interactionParsed = parseIdParam(c, 'id', 'Interaction');
    if (!interactionParsed.success) return interactionParsed.response;

    const existing = db
      .select()
      .from(schema.interactions)
      .where(eq(schema.interactions.id, interactionParsed.id))
      .get();

    if (!existing) {
      return c.json({ error: ERROR_MESSAGES.notFound('Interaction') }, 404);
    }

    if (existing.contactId !== contactParsed.id) {
      return c.json({ error: ERROR_MESSAGES.notFound('Interaction') }, 404);
    }

    db.delete(schema.interactions).where(eq(schema.interactions.id, interactionParsed.id)).run();

    return c.json({ message: ERROR_MESSAGES.deletedSuccessfully('Interaction') });
  });

  return app;
}
