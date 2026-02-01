import { z } from 'zod'

// Base timestamp schema
const timestampSchema = z.number().int().positive()

// User schema
export const userSchema = z.object({
  id: z.string(),
  uid: z.string().optional(),
  email: z.string().email(),
  name: z.string().optional(),
  displayName: z.string().optional(),
  fName: z.string().optional(),
  lName: z.string().optional(),
  photoURL: z.string().optional(),
  avatarUrl: z.string().optional(),
  role: z.enum(['owner', 'admin', 'member', 'viewer']).optional(),
  status: z.enum(['registered', 'unregistered', 'pending']).optional(),
})

export type User = z.infer<typeof userSchema>

// Issue/Item schema
export const issueSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().optional(),
  status: z.string(),
  priority: z.string().optional(),
  type: z.string(),
  projectId: z.string(),
  displayKey: z.string().optional(),

  // Assignments
  userIds: z.array(z.string()).optional(),
  users: z.array(z.object({
    id: z.string(),
    name: z.string().optional(),
    email: z.string().optional(),
    avatarUrl: z.string().optional(),
  })).optional(),
  reporterId: z.string().optional(),

  // Hierarchy
  parent: z.number().optional(),
  goalLink: z.number().optional(),

  // Sprint & Planning
  sprintId: z.string().optional(),
  storyPoints: z.number().optional(),
  storypoint: z.number().optional(), // Legacy field name
  listPosition: z.number().optional(),

  // Timestamps
  createdAt: timestampSchema.optional(),
  updatedAt: timestampSchema.optional(),
  dueDate: timestampSchema.optional(),
  startDate: timestampSchema.optional(),

  // Custom fields
  customFields: z.record(z.unknown()).optional(),

  // Comments
  comments: z.array(z.object({
    id: z.number(),
    body: z.string(),
    issueId: z.string(),
    createdAt: timestampSchema,
    editedAt: timestampSchema.optional(),
    user: z.object({
      name: z.string().optional(),
      email: z.string().optional(),
      avatarUrl: z.string().optional(),
    }),
  })).optional(),

  // Checklist
  checklist: z.array(z.object({
    id: z.string(),
    title: z.string(),
    completed: z.boolean(),
  })).optional(),
})

export type Issue = z.infer<typeof issueSchema>

// Sprint schema
export const sprintSchema = z.object({
  id: z.string(),
  name: z.string(),
  goal: z.string().optional(),
  startDate: timestampSchema.optional(),
  endDate: timestampSchema.optional(),
  status: z.enum(['planning', 'active', 'completed']).optional(),
  projectId: z.string(),
  createdAt: timestampSchema.optional(),
  updatedAt: timestampSchema.optional(),
})

export type Sprint = z.infer<typeof sprintSchema>

// Workspace/Space schema
export const workspaceSchema = z.object({
  spaceId: z.string(),
  title: z.string(),
  acronym: z.string().optional(),
  org: z.string(),
  created: timestampSchema.optional(),
  issueCounter: z.number().optional(),
  users: z.array(z.object({
    id: z.string(),
    email: z.string().optional(),
    name: z.string().optional(),
    avatarUrl: z.string().optional(),
    role: z.string().optional(),
  })).optional(),
  config: z.object({
    issueStatus: z.array(z.object({
      id: z.string(),
      name: z.string(),
      color: z.string().optional(),
    })).optional(),
    issueType: z.array(z.object({
      id: z.string(),
      name: z.string(),
      icon: z.string().optional(),
    })).optional(),
  }).optional(),
})

export type Workspace = z.infer<typeof workspaceSchema>

// Goal/OKR schema
export const goalSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().optional(),
  owner: z.string().optional(),
  status: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
  startDate: timestampSchema.optional(),
  endDate: timestampSchema.optional(),
  createdAt: timestampSchema.optional(),
  updatedAt: timestampSchema.optional(),
  parentId: z.number().optional(),
  keyResults: z.array(z.object({
    id: z.string(),
    title: z.string(),
    target: z.number().optional(),
    current: z.number().optional(),
    unit: z.string().optional(),
  })).optional(),
})

export type Goal = z.infer<typeof goalSchema>

// Work Package schema
export const workPackageSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  status: z.string().optional(),
  projectId: z.string(),
  createdAt: timestampSchema.optional(),
  updatedAt: timestampSchema.optional(),
})

export type WorkPackage = z.infer<typeof workPackageSchema>

// Dependency schema
export const dependencySchema = z.object({
  id: z.number(),
  A: z.number(), // Source issue ID
  B: z.number(), // Target issue ID
  type: z.enum(['blocks', 'blocked-by', 'relates-to']).optional(),
  createdAt: timestampSchema.optional(),
  updatedAt: timestampSchema.optional(),
})

export type Dependency = z.infer<typeof dependencySchema>

// Helper function to safely parse data
export function parseWithSchema<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
  const result = schema.safeParse(data)
  if (result.success) {
    return result.data
  }
  console.warn('Schema validation failed:', result.error.issues)
  return null
}

// Helper to parse arrays
export function parseArrayWithSchema<T>(schema: z.ZodSchema<T>, data: unknown[]): T[] {
  return data
    .map(item => parseWithSchema(schema, item))
    .filter((item): item is T => item !== null)
}
