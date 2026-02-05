import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
    width: 180,
    height: 180,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontSize: 100,
                    background: '#09090b',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#10b981',
                    // iOS adds its own border radius, so we keep it square or slight radius
                    // But 'maskable' icons usually want full bleed background.
                }}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    border: '6px solid #10b981',
                    color: '#10b981',
                    fontSize: 80,
                    fontWeight: 800
                }}>
                    $
                </div>
            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    )
}
