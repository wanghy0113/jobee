import { Injectable } from '@nestjs/common'
import axios from 'axios'
import * as jwt from 'jsonwebtoken'

@Injectable()
export class GoogleAuthService {
  private clientID = process.env.GOOGLE_CLIENT_ID
  private clientSecret = process.env.GOOGLE_CLIENT_SECRET
  private redirectUri = `${process.env.API_URL}/auth/google/callback`

  getGoogleAuthUrl() {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
    const options = {
      redirect_uri: this.redirectUri,
      client_id: this.clientID,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ].join(' '),
    }

    const qs = new URLSearchParams(options).toString()
    return `${rootUrl}?${qs}`
  }

  async getProfile(code: string) {
    const url = 'https://oauth2.googleapis.com/token'
    const values = {
      code,
      client_id: this.clientID,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri,
      grant_type: 'authorization_code',
    }

    const response = await axios.post(
      url,
      new URLSearchParams(values).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    )
    const idToken = response.data.id_token
    if (!idToken) {
      throw new Error('No id_token in response')
    }
    return this.verifyToken(idToken)
  }

  async verifyToken(idToken: string) {
    const ticket = jwt.decode(idToken)
    return ticket
  }
}
