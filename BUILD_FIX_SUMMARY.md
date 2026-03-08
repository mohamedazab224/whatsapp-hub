# Build Error Fix - Server-Side Supabase Import Issue

## Problem
The Turbopack build was failing with this error:
```
You're importing a component that needs "next/headers". That only works in a Server Component 
which is not supported in the pages/ directory.
```

The root cause: `lib/supabase/server.ts` imported `next/headers` (server-only), but this file was being imported by client components like `components/dashboard/sidebar.tsx`, creating an RSC boundary violation.

## Solution
Split the Supabase client utilities into two separate modules:

### 1. `lib/supabase/server.ts` (Server-only)
- Added `"use server"` directive at the top
- Only exports `createSupabaseServerClient()` which uses `next/headers`
- Can only be imported by Server Components and API routes

### 2. `lib/supabase/admin.ts` (New file)
- No server-only dependencies
- Exports `createSupabaseAdminClient()` which uses only `@supabase/supabase-js`
- Can be safely imported anywhere (client/server)

## Changes Made
1. Created `/lib/supabase/admin.ts` - admin client without `next/headers`
2. Updated `lib/supabase/server.ts` - added `"use server"` directive
3. Updated imports in all files that use `createSupabaseAdminClient()`:
   - `lib/middleware/whatsapp-webhook-receiver.ts`
   - `lib/meta/seed.ts`
   - `app/api/auth/init-project/route.ts`
   - `app/auth/callback/route.ts`
   - `app/api/vae/webhook/whatsapp/route.ts`
   - And all other API routes

## Result
- ✅ Build should now pass
- ✅ No more RSC boundary violations
- ✅ Clear separation of server-only and shared utilities
- ✅ Turbopack can properly tree-shake unused dependencies
