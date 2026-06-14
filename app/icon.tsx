import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#456731",
          borderRadius: 4,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M5 4L1 10L5 16" stroke="#fdad5b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M15 4L19 10L15 16" stroke="#fdad5b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 3L8 17" stroke="#fcf9f3" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
    ),
    { ...size },
  );
}
