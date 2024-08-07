import { Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { jwtConstants } from './constants'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: (req: any) => {
        console.log('req?.cookies?.sessionToken', req?.cookies?.sessionToken)
        console.log('req?.headers?.authorization', req?.headers?.authorization)
        return (
          req?.cookies?.sessionToken ||
          req?.headers?.authorization?.split(' ')[1]
        )
      },
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    })
  }

  async validate(payload: any) {
    return { id: payload.sub, email: payload.email, exp: payload.exp }
  }
}
