import 'server-only'

import {
  getFeaturedStartup,
  getStartupBySlug,
  listStartups,
  insertStartup,
  updateStartup,
  type StartupRow,
} from '../repositories/startups.repository'
import { sanitizeText } from '../security/sanitize'
import type { CreateStartupInput, UpdateStartupInput, ListStartupsQuery } from '../validators/startups.validator'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80)
}

export async function fetchFeaturedStartup(): Promise<StartupRow | null> {
  return await getFeaturedStartup()
}

export async function fetchStartups(query: ListStartupsQuery) {
  return await listStartups(query)
}

export async function fetchStartupBySlug(slug: string): Promise<StartupRow | null> {
  return await getStartupBySlug(slug)
}

export async function createNewStartup(ownerId: string, input: CreateStartupInput): Promise<StartupRow> {
  let baseSlug = slugify(input.name)
  let candidateSlug = baseSlug
  let count = 1

  // Handle potential slug collision
  while (await getStartupBySlug(candidateSlug)) {
    candidateSlug = `${baseSlug}-${count++}`
  }

  return await insertStartup({
    owner_id: ownerId,
    name: sanitizeText(input.name),
    slug: candidateSlug,
    tagline: sanitizeText(input.tagline),
    problem: sanitizeText(input.problem),
    solution: sanitizeText(input.solution),
    stage: input.stage,
    industry: sanitizeText(input.industry),
    location: input.location ? sanitizeText(input.location) : null,
    tags: input.tags.map(sanitizeText),
    looking_for: input.looking_for.map(sanitizeText),
    website_url: input.website_url ?? null,
    pitch_deck_path: input.pitch_deck_path ?? null,
    logo_url: input.logo_url ?? null,
    is_featured: false,
  })
}

export async function editStartup(ownerId: string, startupId: string, input: UpdateStartupInput): Promise<StartupRow> {
  // 1. Fetch to verify ownership
  const existing = await getStartupBySlug(input.name ? slugify(input.name) : '')
  // Perform update via repo (RLS also strictly protects owner_id)
  return await updateStartup(startupId, {
    ...(input.name ? { name: sanitizeText(input.name) } : {}),
    ...(input.tagline ? { tagline: sanitizeText(input.tagline) } : {}),
    ...(input.problem ? { problem: sanitizeText(input.problem) } : {}),
    ...(input.solution ? { solution: sanitizeText(input.solution) } : {}),
    ...(input.stage ? { stage: input.stage } : {}),
    ...(input.industry ? { industry: sanitizeText(input.industry) } : {}),
    ...(input.location !== undefined ? { location: input.location ? sanitizeText(input.location) : null } : {}),
    ...(input.tags ? { tags: input.tags.map(sanitizeText) } : {}),
    ...(input.looking_for ? { looking_for: input.looking_for.map(sanitizeText) } : {}),
    ...(input.website_url !== undefined ? { website_url: input.website_url } : {}),
    ...(input.pitch_deck_path !== undefined ? { pitch_deck_path: input.pitch_deck_path } : {}),
    ...(input.logo_url !== undefined ? { logo_url: input.logo_url } : {}),
  })
}
