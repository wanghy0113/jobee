import { BadRequestException, Injectable } from '@nestjs/common'
import { UsersService } from '../user/user.service'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { jwtConstants } from './constants'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async getSessionToken(email: string) {
    const user = await this.usersService.findByEmail(email)
    if (!user) {
      throw new BadRequestException('User not found')
    }
    const payload = { email: user.email, sub: user.id }
    return this.jwtService.sign(payload, {
      expiresIn: '30d',
      secret: jwtConstants.secret,
    })
  }

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email)
    if (!user) {
      return null
    }

    const { password, ...result } = user
    const isMatch = await bcrypt.compare(pass, password)
    if (!isMatch) {
      return null
    }

    return result
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id }
    return {
      ...user,
      access_token: this.jwtService.sign(payload),
    }
  }

  async signup(email: string, password: string) {
    const existing = await this.usersService.findByEmail(email)
    if (existing) {
      throw new BadRequestException('User already exists')
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
    })

    return {
      ...user,
      password: undefined,
    }
  }
}
