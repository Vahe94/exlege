import { z } from 'zod';

// ---------- i18n ----------
export const LOCALES = ['hy'] as const; // add 'ru', 'en' later — data change, not schema change
export const DEFAULT_LOCALE = 'hy';
export type Locale = (typeof LOCALES)[number];

/** Translatable content field: { hy: "...", en?: "..." } stored as jsonb */
export const localizedString = z.record(z.string(), z.string());
export type LocalizedString = z.infer<typeof localizedString>;

// ---------- enums (mirror prisma enums) ----------
export const Role = z.enum(['OWNER', 'ADMIN', 'ATTORNEY', 'ASSISTANT']);
export type Role = z.infer<typeof Role>;

export const TaskStatus = z.enum(['TODO', 'IN_PROGRESS', 'DONE']);
export type TaskStatus = z.infer<typeof TaskStatus>;

export const TaskPriority = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export type TaskPriority = z.infer<typeof TaskPriority>;

export const PostType = z.enum(['NEWS', 'CASE_WIN', 'VIDEO']);
export type PostType = z.infer<typeof PostType>;

export const PostStatus = z.enum(['DRAFT', 'PUBLISHED']);
export type PostStatus = z.infer<typeof PostStatus>;

// ---------- auth ----------
export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});
export type LoginInput = z.infer<typeof loginSchema>;

// ---------- tasks ----------
export const createTaskSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(5000).optional(),
  caseId: z.string().optional(),
  assigneeId: z.string().optional(),
  priority: TaskPriority.default('MEDIUM'),
  dueAt: z.coerce.date().optional(),
  /** reminder offsets in minutes before dueAt, e.g. [60, 1440] */
  reminderOffsets: z.array(z.number().int().positive()).max(5).default([]),
});
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = createTaskSchema.partial().extend({
  status: TaskStatus.optional(),
});
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const listTasksQuerySchema = z.object({
  status: TaskStatus.optional(),
  assigneeId: z.string().optional(),
  caseId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;

// ---------- cases ----------
export const CaseStatus = z.enum(['OPEN', 'ON_HOLD', 'CLOSED']);
export type CaseStatus = z.infer<typeof CaseStatus>;

export const createCaseSchema = z.object({
  title: z.string().min(1).max(300),
  number: z.string().max(100).optional(),
  clientName: z.string().max(200).optional(),
  description: z.string().max(10000).optional(),
});
export type CreateCaseInput = z.infer<typeof createCaseSchema>;

export const updateCaseSchema = createCaseSchema.partial().extend({
  status: CaseStatus.optional(),
});
export type UpdateCaseInput = z.infer<typeof updateCaseSchema>;

// ---------- leads status ----------
export const LeadStatus = z.enum(['NEW', 'CONTACTED', 'CLOSED']);
export type LeadStatus = z.infer<typeof LeadStatus>;

// ---------- posts (news / case wins / videos) ----------
export const upsertPostSchema = z.object({
  type: PostType,
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/),
  title: localizedString,
  excerpt: localizedString.optional(),
  /** Tiptap JSON per locale */
  content: z.record(z.string(), z.unknown()).optional(),
  videoUrl: z.url().optional(),
  coverImageKey: z.string().optional(),
  status: PostStatus.default('DRAFT'),
});
export type UpsertPostInput = z.infer<typeof upsertPostSchema>;

// ---------- leads (public contact/intake form) ----------
export const createLeadSchema = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().min(5).max(30),
  email: z.email().optional(),
  message: z.string().max(3000).optional(),
});
export type CreateLeadInput = z.infer<typeof createLeadSchema>;

// ---------- public post wire contracts (consumed by apps/web) ----------
// Plain shapes mirroring GET /api/public/posts*. The API keeps Prisma-payload
// aliases internally; these are the over-the-wire contract (dates are ISO strings).
export interface PublicPostListItem {
  id: string;
  type: PostType;
  slug: string;
  title: LocalizedString;
  excerpt: LocalizedString | null;
  coverImageKey: string | null;
  videoUrl: string | null;
  publishedAt: string | null;
}
export interface PublicPostDetail extends PublicPostListItem {
  /** Tiptap JSON per locale */
  content: unknown | null;
}
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
