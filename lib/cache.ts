import { revalidateTag, updateTag } from "next/cache"
import { logger } from "@/lib/logger"

/**
 * Cache tags for revalidation
 */
export const CACHE_TAGS = {
  // Contacts
  CONTACTS: "contacts",
  CONTACTS_BY_PROJECT: (projectId: string) => `contacts_${projectId}`,
  CONTACT: (id: string) => `contact_${id}`,

  // Messages
  MESSAGES: "messages",
  MESSAGES_BY_PROJECT: (projectId: string) => `messages_${projectId}`,
  MESSAGES_BY_CONTACT: (contactId: string) => `messages_contact_${contactId}`,

  // Numbers
  NUMBERS: "numbers",
  NUMBERS_BY_PROJECT: (projectId: string) => `numbers_${projectId}`,

  // Stats
  STATS: "stats",
  STATS_BY_PROJECT: (projectId: string) => `stats_${projectId}`,

  // Workflows
  WORKFLOWS: "workflows",
  WORKFLOWS_BY_PROJECT: (projectId: string) => `workflows_${projectId}`,

  // Templates
  TEMPLATES: "templates",
  TEMPLATES_BY_PROJECT: (projectId: string) => `templates_${projectId}`,
}

/**
 * Revalidate cache for updated resources
 */
export async function invalidateCache(tags: string | string[]) {
  const tagList = Array.isArray(tags) ? tags : [tags]
  
  try {
    for (const tag of tagList) {
      revalidateTag(tag)
    }
    logger.debug("Cache invalidated", { tags: tagList })
  } catch (error) {
    logger.error("Failed to invalidate cache", { tags: tagList, error })
  }
}

/**
 * Update cache with new data (SWR behavior)
 */
export async function updateCache(tag: string) {
  try {
    updateTag(tag)
    logger.debug("Cache updated", { tag })
  } catch (error) {
    logger.error("Failed to update cache", { tag, error })
  }
}

/**
 * Invalidate project-related caches
 */
export async function invalidateProjectCache(projectId: string) {
  const tags = [
    CACHE_TAGS.STATS_BY_PROJECT(projectId),
    CACHE_TAGS.CONTACTS_BY_PROJECT(projectId),
    CACHE_TAGS.MESSAGES_BY_PROJECT(projectId),
    CACHE_TAGS.NUMBERS_BY_PROJECT(projectId),
    CACHE_TAGS.WORKFLOWS_BY_PROJECT(projectId),
    CACHE_TAGS.TEMPLATES_BY_PROJECT(projectId),
  ]
  
  await invalidateCache(tags)
}
