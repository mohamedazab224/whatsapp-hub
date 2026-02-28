"use client"

import { useEffect } from "react"

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html>
      <body>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <div style={{ textAlign: "center", padding: "20px" }}>
            <h2>حدث خطأ!</h2>
            <p style={{ color: "#666" }}>عذراً، حدث خطأ غير متوقع.</p>
            <button
              onClick={() => reset()}
              style={{
                padding: "10px 20px",
                marginTop: "20px",
                backgroundColor: "#0070f3",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              حاول مجدداً
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
