let wompiToken: string | null = null
let tokenExpiration = 0

interface WompiTokenResponse {
  access_token: string
  expires_in: number
  token_type: string
  scope: string
}

export async function getWompiToken(): Promise<string> {
  const now = Date.now()

  // Si ya tenemos un token y no ha expirado, lo reutilizamos
  if (wompiToken && now < tokenExpiration) {
    return wompiToken
  }

  // De lo contrario, solicitamos uno nuevo
  const url = 'https://id.wompi.sv/connect/token'
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    audience: 'wompi_api',
    client_id: process.env.WOMPI_CLIENT_ID ?? '',
    client_secret: process.env.WOMPI_CLIENT_SECRET ?? '',
  })

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  })

  const data = (await response.json()) as Partial<WompiTokenResponse>

  if (data.access_token) {
    wompiToken = data.access_token
    tokenExpiration = now + (data.expires_in ?? 0) * 1000
    return wompiToken
  } else {
    throw new Error('No se pudo obtener el token de Wompi')
  }
}
