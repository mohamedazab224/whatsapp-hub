"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Sidebar } from "@/components/dashboard/sidebar"
import { logInfo, logError } from "@/lib/errors"

// Complete Meta data with all WABAs, phones, and templates from meta_all.json
const META_ALL_DATA = {
  "meta": {
    "app_id": "889346333913449",
    "type": "SYSTEM_USER",
    "application": "ASW",
    "data_access_expires_at": 0,
    "expires_at": 0,
    "is_valid": true,
    "issued_at": 1772161256,
    "scopes": [
      "catalog_management",
      "pages_show_list",
      "business_management",
      "pages_messaging",
      "instagram_basic",
      "instagram_manage_comments",
      "instagram_manage_insights",
      "instagram_content_publish",
      "whatsapp_business_management",
      "instagram_manage_messages",
      "pages_read_engagement",
      "pages_manage_metadata",
      "whatsapp_business_messaging",
      "instagram_shopping_tag_products",
      "instagram_branded_content_brand",
      "read_audience_network_insights",
      "instagram_branded_content_ads_brand",
      "manage_app_solution",
      "pages_utility_messaging",
      "paid_marketing_messages",
      "whatsapp_business_manage_events",
      "public_profile"
    ],
    "user_id": "122172793790780848"
  },
  "business": {
    "id": "314437023701205",
    "name": "Mohamed Azab",
    "verification_status": "verified",
    "created_time": "2021-08-14T06:48:04+0000"
  },
  "wabas": [
    {
      "id": "1381823417288383",
      "info": {
        "id": "1381823417288383",
        "name": "hand Mohamed Azab",
        "timezone_id": "0",
        "message_template_namespace": "70197576_2a40_4884_9265_ce61986c9432"
      },
      "phones": [
        {
          "id": "964277060104222",
          "display_phone_number": "+20 10 26682797",
          "verified_name": "hand Mohamed Azab",
          "quality_rating": "UNKNOWN",
          "status": "CONNECTED",
          "account_mode": "LIVE"
        }
      ],
      "templates": [],
      "apps": [
        {
          "whatsapp_business_api_data": {
            "category": "أعمال",
            "link": "https://business.facebook.com/bizkit/home",
            "name": "BizWeb",
            "id": "514771569228061"
          }
        }
      ],
      "webhooks": null
    },
    {
      "id": "2144651456337012",
      "info": {
        "id": "2144651456337012",
        "name": "Mohamed Azab",
        "currency": "USD",
        "timezone_id": "53",
        "message_template_namespace": "f492b3dc_fb6a_47b9_8458_cd1e3527ad97"
      },
      "phones": [
        {
          "id": "1020054711186921",
          "display_phone_number": "+1 205-460-5650",
          "verified_name": "Mohamed Azab",
          "quality_rating": "GREEN",
          "status": "CONNECTED",
          "account_mode": "LIVE"
        }
      ],
      "templates": [
        {
          "name": "hello",
          "parameter_format": "POSITIONAL",
          "components": [
            {
              "type": "BODY",
              "text": "Hello world!"
            },
            {
              "type": "BUTTONS",
              "buttons": [
                {
                  "type": "FLOW",
                  "text": "View Flow",
                  "flow_id": 1946584099618562,
                  "flow_action": "NAVIGATE",
                  "navigate_screen": "SELECT_BRANCH"
                }
              ]
            }
          ],
          "language": "en",
          "status": "APPROVED",
          "category": "MARKETING",
          "sub_category": "FORM",
          "id": "1567295111152491"
        },
        {
          "name": "installation_complete",
          "parameter_format": "POSITIONAL",
          "components": [
            {
              "type": "HEADER",
              "format": "TEXT",
              "text": "Installation complete"
            },
            {
              "type": "BODY",
              "text": "Hi {{1}}, your {{2}} installation is complete! Our technician has configured your connection, and you're now ready to go online. If you have any issues, feel free to reply or contact {{3}} for assistance.",
              "example": {
                "body_text": [["John", "Fibre Broadband", "support@telco.com"]]
              }
            }
          ],
          "language": "en_US",
          "status": "APPROVED",
          "category": "UTILITY",
          "library_template_name": "installation_complete",
          "id": "955131554138421"
        }
      ],
      "apps": [
        {
          "whatsapp_business_api_data": {
            "link": "https://www.facebook.com/games/?app_id=1087358919742996",
            "name": "Kapso",
            "id": "1087358919742996"
          }
        }
      ],
      "webhooks": null
    },
    {
      "id": "1329792992522819",
      "info": {
        "id": "1329792992522819",
        "name": "Mohamed Azab",
        "timezone_id": "53",
        "message_template_namespace": "83bbfc49_5b19_4bcf_a871_aa1e1269d834"
      },
      "phones": [
        {
          "id": "1019111107950292",
          "display_phone_number": "+20 10 92750351",
          "verified_name": "Mohamed Azab",
          "quality_rating": "UNKNOWN",
          "status": "PENDING",
          "account_mode": "LIVE"
        }
      ],
      "templates": [],
      "apps": [],
      "webhooks": null
    },
    {
      "id": "1198849982358674",
      "info": {
        "id": "1198849982358674",
        "name": "UberFix",
        "currency": "USD",
        "timezone_id": "53",
        "message_template_namespace": "f19f81d5_0560_4503_910e_3ff62b5e215b"
      },
      "phones": [],
      "templates": [
        {
          "name": "scheduling",
          "parameter_format": "POSITIONAL",
          "language": "en_US",
          "status": "APPROVED",
          "category": "UTILITY",
          "library_template_name": "appointment_scheduling",
          "id": "2213016016171976"
        },
        {
          "name": "reminder",
          "parameter_format": "POSITIONAL",
          "language": "en_US",
          "status": "APPROVED",
          "category": "UTILITY",
          "library_template_name": "appointment_reminder",
          "id": "902485578942321"
        },
        {
          "name": "appointment",
          "parameter_format": "POSITIONAL",
          "language": "en_US",
          "status": "APPROVED",
          "category": "UTILITY",
          "library_template_name": "appointment_cancelled",
          "id": "899296955837400"
        },
        {
          "name": "appointment_confirmation_1",
          "parameter_format": "POSITIONAL",
          "language": "ar",
          "status": "APPROVED",
          "category": "UTILITY",
          "sub_category": "CUSTOM",
          "id": "1424480052385807"
        },
        {
          "name": "order_management_4",
          "parameter_format": "POSITIONAL",
          "language": "ar",
          "status": "APPROVED",
          "category": "UTILITY",
          "library_template_name": "order_management_4",
          "id": "2040184413495846"
        }
      ],
      "apps": [
        {
          "whatsapp_business_api_data": {
            "link": "http://www.jotform.com/",
            "name": "Jotform Agent",
            "id": "1102773744861735"
          },
          "override_callback_uri": "https://api.jotform.com/ai-agent-builder/0199bc57304276d986cb2f60ce5418702d89/webhook"
        }
      ],
      "webhooks": null
    },
    {
      "id": "1458856398934130",
      "info": {
        "id": "1458856398934130",
        "name": "Mohamed Azab",
        "currency": "USD",
        "timezone_id": "53",
        "message_template_namespace": "881a3a5e_adc3_4e13_8c14_a90bb4e3c601"
      },
      "phones": [
        {
          "id": "1032441389943808",
          "display_phone_number": "+1 206-479-5608",
          "verified_name": "Mohamed Azab",
          "quality_rating": "GREEN",
          "status": "CONNECTED",
          "account_mode": "LIVE"
        },
        {
          "id": "952530191273396",
          "display_phone_number": "+1 208-379-9564",
          "verified_name": "Mohamed Azab",
          "quality_rating": "UNKNOWN",
          "status": "CONNECTED",
          "account_mode": "LIVE"
        }
      ],
      "templates": [
        {
          "name": "uberone",
          "parameter_format": "POSITIONAL",
          "language": "en_US",
          "status": "APPROVED",
          "category": "MARKETING",
          "sub_category": "FORM",
          "id": "1550461489580784"
        },
        {
          "name": "missed_appointment",
          "parameter_format": "POSITIONAL",
          "language": "ar",
          "status": "APPROVED",
          "category": "UTILITY",
          "library_template_name": "missed_appointment",
          "id": "2036635873734786"
        },
        {
          "name": "appointment_scheduling",
          "parameter_format": "POSITIONAL",
          "language": "ar",
          "status": "APPROVED",
          "category": "UTILITY",
          "library_template_name": "appointment_scheduling",
          "id": "925222166624859"
        },
        {
          "name": "appointment_confirmed",
          "parameter_format": "POSITIONAL",
          "language": "ar",
          "status": "APPROVED",
          "category": "UTILITY",
          "library_template_name": "appointment_confirmed",
          "id": "1443910377115321"
        },
        {
          "name": "appointment_cancellation",
          "parameter_format": "POSITIONAL",
          "language": "ar",
          "status": "APPROVED",
          "category": "UTILITY",
          "library_template_name": "appointment_cancellation_1",
          "id": "1781092799228487"
        },
        {
          "name": "delivery_code",
          "message_send_ttl_seconds": 600,
          "parameter_format": "POSITIONAL",
          "language": "en_US",
          "status": "APPROVED",
          "category": "UTILITY",
          "id": "1769282936680688"
        }
      ],
      "apps": [],
      "webhooks": null
    }
  ]
}

export default function InitPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<{
    type: "idle" | "loading" | "success" | "error"
    message: string
  }>({ type: "idle", message: "" })

  const handleInitialize = async () => {
    try {
      setIsLoading(true)
      setStatus({ type: "loading", message: "جاري تهيئة المشروع..." })

      logInfo("Init Page", "Starting initialization with Meta data")

      const response = await fetch("/api/init/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meta_data: META_ALL_DATA }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to initialize")
      }

      const data = await response.json()
      logInfo("Init Page", `Initialization complete: ${JSON.stringify(data)}`)

      setStatus({
        type: "success",
        message: `تم بنجاح! تم إنشاء المشروع وتحميل ${data.numbersImported} أرقام WhatsApp`,
      })

      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = "/inbox"
      }, 2000)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "خطأ في التهيئة"
      logError("Init Page", error)
      setStatus({ type: "error", message: errorMsg })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden" dir="rtl">
      <Sidebar />

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>تهيئة المشروع</CardTitle>
            <CardDescription>
              سيتم إنشاء مشروعك وتحميل أرقام WhatsApp الخاصة بك من بيانات Meta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status.type !== "idle" && (
              <div
                className={`p-4 rounded-lg text-sm ${
                  status.type === "loading" ? "bg-blue-50 text-blue-900" :
                  status.type === "success" ? "bg-green-50 text-green-900" :
                  "bg-red-50 text-red-900"
                }`}
              >
                {status.message}
              </div>
            )}

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs">✓</div>
                <span>سيتم إنشاء مشروع جديد لك</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs">✓</div>
                <span>سيتم تحميل جميع أرقام WhatsApp الخاصة بك</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs">✓</div>
                <span>سيتم تفعيل جميع الميزات</span>
              </div>
            </div>

            <Button
              onClick={handleInitialize}
              disabled={isLoading || status.type === "success"}
              className="w-full"
            >
              {isLoading ? "جاري المعالجة..." : "ابدأ الآن"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
