import { createSupabaseServerClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"

/**
 * Batch fetch operations for better performance
 */
export async function batchFetch<T>(
  table: string,
  ids: string[],
  filters?: Record<string, any>
): Promise<T[]> {
  if (ids.length === 0) return []

  const supabase = await createSupabaseServerClient()
  
  let query = supabase.from(table).select("*")

  // Add ID filter
  query = query.in("id", ids)

  // Add additional filters
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value)
    }
  }

  const { data, error } = await query

  if (error) {
    logger.error(`Batch fetch error for table ${table}`, { error: error.message })
    return []
  }

  return (data as T[]) || []
}

/**
 * Paginated fetch with count
 */
export async function paginatedFetch<T>(
  table: string,
  page: number = 1,
  limit: number = 20,
  filters?: Record<string, any>,
  orderBy?: { column: string; ascending?: boolean }
) {
  const supabase = await createSupabaseServerClient()

  let query = supabase.from(table).select("*", { count: "exact" })

  // Add filters
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (value === null) {
        query = query.is(key, null)
      } else if (typeof value === "object" && value.operator) {
        // Support operators like { operator: "gt", value: 5 }
        query = query[value.operator as any](key, value.value)
      } else {
        query = query.eq(key, value)
      }
    }
  }

  // Add ordering
  if (orderBy) {
    query = query.order(orderBy.column, {
      ascending: orderBy.ascending !== false,
    })
  }

  // Add pagination
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await query.range(from, to)

  if (error) {
    logger.error(`Paginated fetch error for table ${table}`, { error: error.message })
    return { data: [], count: 0, page, limit, totalPages: 0 }
  }

  return {
    data: (data as T[]) || [],
    count: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  }
}

/**
 * Search with full text
 */
export async function searchTable<T>(
  table: string,
  columns: string[],
  query: string,
  filters?: Record<string, any>
) {
  const supabase = await createSupabaseServerClient()

  let dbQuery = supabase.from(table).select("*")

  // Add text search filters (OR condition)
  const searchConditions = columns.map((col) => `${col}.ilike.%${query}%`).join(",")
  dbQuery = dbQuery.or(searchConditions)

  // Add additional filters
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      dbQuery = dbQuery.eq(key, value)
    }
  }

  const { data, error } = await dbQuery

  if (error) {
    logger.error(`Search error for table ${table}`, { error: error.message })
    return []
  }

  return (data as T[]) || []
}
