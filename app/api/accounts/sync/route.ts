import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { createLogger } from "@/lib/logger"
import crypto from "crypto"

const logger = createLogger("API:SyncAccounts")

interface WABAPhoneNumber {
  id: string
  display_phone_number: string
  verified_name: string
  quality_rating: string
  status: string
}

interface WABAConfig {
  id: string
  name: string
  phones: WABAPhoneNumber[]
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID()

  try {
    const body = await request.json()
    const { projectId, wabaConfigs } = body

    if (!projectId || !Array.isArray(wabaConfigs)) {
      logger.warn("Invalid sync request", { requestId })
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()

    let syncedAccounts = 0
    let syncedNumbers = 0

    for (const waba of wabaConfigs as WABAConfig[]) {
      // Store/update phone numbers (no separate WABA table in schema)
      for (const phone of waba.phones) {
        const { error: phoneError } = await supabase.from("whatsapp_numbers").upsert(
          {
            project_id: projectId,
            phone_number_id: phone.id,
            display_phone_number: phone.display_phone_number,
            verified_name: phone.verified_name,
            quality_rating: phone.quality_rating,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "phone_number_id" }
        )

        if (phoneError) {
          logger.warn("Failed to sync phone number", { requestId, phoneId: phone.id, error: phoneError })
          continue
        }

        syncedNumbers++
      }

      syncedAccounts++
    }

    logger.info("Accounts synced successfully", {
      requestId,
      projectId,
      wabasCount: syncedAccounts,
      phonesCount: syncedNumbers,
    })

    return NextResponse.json({
      success: true,
      synced: {
        accounts: syncedAccounts,
        numbers: syncedNumbers,
      },
    })
  } catch (error) {
    logger.error("Error syncing accounts", { requestId, error })
    return NextResponse.json({ error: "Failed to sync accounts" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID()

  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId")

    if (!projectId) {
      return NextResponse.json({ error: "Project ID required" }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()

    // Get all phone numbers for project
    const { data: numbers, error: numbersError } = await supabase
      .from("whatsapp_numbers")
      .select("*")
      .eq("project_id", projectId)

    if (numbersError) {
      logger.error("Failed to fetch numbers", { requestId, error: numbersError })
      return NextResponse.json({ error: "Failed to fetch numbers" }, { status: 500 })
    }

    // Return phone numbers grouped by project
    const accountsMap = new Map<string, any>()
    const numbers_array = numbers || []

    // Group all numbers for the project under a default account
    if (numbers_array.length > 0) {
      accountsMap.set("default", {
        id: "default",
        phones: numbers_array,
      })
    }

    logger.info("Fetched accounts and numbers", {
      requestId,
      projectId,
      accountsCount: accountsMap.size,
      numbersCount: numbers_array.length,
    })

    return NextResponse.json({
      accounts: Array.from(accountsMap.values()),
      numbers: numbers_array,
    })
  } catch (error) {
    logger.error("Error fetching accounts", { requestId, error })
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 })
  }
}
