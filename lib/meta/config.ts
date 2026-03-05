/**
 * Meta WhatsApp Business Data Configuration
 * Contains business information, WABAs, and connected phone numbers
 */

export const META_CONFIG = {
  meta: {
    app_id: "889346333913449",
    type: "SYSTEM_USER",
    application: "ASW",
    is_valid: true,
    user_id: "122172793790780848",
    scopes: [
      "whatsapp_business_messaging",
      "whatsapp_business_management",
      "pages_messaging",
      "business_management",
      "catalog_management",
    ],
  },

  business: {
    id: "314437023701205",
    name: "Mohamed Azab",
    verification_status: "verified",
    created_time: "2021-08-14T06:48:04+0000",
  },

  // WhatsApp Business Accounts (WABAs)
  wabas: [
    {
      id: "1381823417288383",
      name: "hand Mohamed Azab",
      timezone_id: "0",
      phones: [
        {
          id: "964277060104222",
          display_phone_number: "+20 10 26682797",
          verified_name: "hand Mohamed Azab",
          quality_rating: "UNKNOWN",
          status: "CONNECTED",
          account_mode: "LIVE",
        },
      ],
    },
    {
      id: "2144651456337012",
      name: "Mohamed Azab",
      timezone_id: "53",
      currency: "USD",
      phones: [
        {
          id: "1020054711186921",
          display_phone_number: "+1 205-460-5650",
          verified_name: "Mohamed Azab",
          quality_rating: "GREEN",
          status: "CONNECTED",
          account_mode: "LIVE",
        },
      ],
    },
    {
      id: "1458856398934130",
      name: "Mohamed Azab",
      timezone_id: "53",
      currency: "USD",
      phones: [
        {
          id: "1032441389943808",
          display_phone_number: "+1 206-479-5608",
          verified_name: "Mohamed Azab",
          quality_rating: "GREEN",
          status: "CONNECTED",
          account_mode: "LIVE",
        },
        {
          id: "952530191273396",
          display_phone_number: "+1 208-379-9564",
          verified_name: "Mohamed Azab",
          quality_rating: "UNKNOWN",
          status: "CONNECTED",
          account_mode: "LIVE",
        },
      ],
    },
  ],

  // Message Templates
  templates: {
    appointment_confirmation: {
      name: "appointment_confirmation_1",
      language: "ar",
      status: "APPROVED",
      category: "UTILITY",
      id: "1424480052385807",
    },
    order_management: {
      name: "order_management_4",
      language: "ar",
      status: "APPROVED",
      category: "UTILITY",
      id: "2040184413495846",
    },
    appointment_scheduling: {
      name: "appointment_scheduling",
      language: "ar",
      status: "APPROVED",
      category: "UTILITY",
      id: "925222166624859",
    },
    appointment_confirmed: {
      name: "appointment_confirmed",
      language: "ar",
      status: "APPROVED",
      category: "UTILITY",
      id: "1443910377115321",
    },
  },

  // Flow Configuration
  flows: {
    uberone: {
      id: 1550461489580784,
      name: "uberone",
      status: "APPROVED",
      category: "MARKETING",
    },
  },
}

// Environment variables required for Meta integration
export const REQUIRED_META_ENV_VARS = {
  META_APP_ID: "889346333913449",
  META_BUSINESS_ID: "314437023701205",
  META_ACCESS_TOKEN: "Your access token here",
  META_APP_SECRET: "Your app secret here",
  VERIFY_TOKEN: "Your verify token here",
  META_API_VERSION: "v24.0",
}

// WhatsApp connected numbers
export const WHATSAPP_NUMBERS = [
  {
    phoneNumberId: "964277060104222",
    displayPhoneNumber: "+20 10 26682797",
    verifiedName: "hand Mohamed Azab",
    wabaId: "1381823417288383",
    status: "CONNECTED",
    qualityRating: "UNKNOWN",
  },
  {
    phoneNumberId: "1020054711186921",
    displayPhoneNumber: "+1 205-460-5650",
    verifiedName: "Mohamed Azab",
    wabaId: "2144651456337012",
    status: "CONNECTED",
    qualityRating: "GREEN",
  },
  {
    phoneNumberId: "1032441389943808",
    displayPhoneNumber: "+1 206-479-5608",
    verifiedName: "Mohamed Azab",
    wabaId: "1458856398934130",
    status: "CONNECTED",
    qualityRating: "GREEN",
  },
  {
    phoneNumberId: "952530191273396",
    displayPhoneNumber: "+1 208-379-9564",
    verifiedName: "Mohamed Azab",
    wabaId: "1458856398934130",
    status: "CONNECTED",
    qualityRating: "UNKNOWN",
  },
]
