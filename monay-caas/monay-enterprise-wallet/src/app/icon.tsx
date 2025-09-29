import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 32,
  height: 32,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Blue M shape */}
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* First part of M */}
          <path
            d="M5 20 L5 8 Q5 5 8 5 Q11 5 11 8 L11 12 L16 7 Q16 5 18 5"
            stroke="#0080FF"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          {/* Second part of M */}
          <path
            d="M18 5 Q20 5 20 7 L25 12 L25 8 Q25 5 28 5 Q31 5 31 8 L31 20"
            stroke="#0080FF"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          {/* Yellow dot */}
          <circle cx="26" cy="24" r="3" fill="#FFD700" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}