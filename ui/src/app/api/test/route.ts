import { getToken } from "next-auth/jwt"
import { NextRequest } from "next/server"

const secret = process.env.NEXTAUTH_SECRET

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret, raw: true})
  console.log("JSON Web Token", token)
  return new Response(token)
}
