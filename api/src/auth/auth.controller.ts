import {
  Controller,
  Post,
  UseGuards,
  Request,
  Response,
  Get,
  BadRequestException,
  Query,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { LocalAuthGuard } from './local-auth.guard'
import { GoogleAuthService } from './google-auth-service'
import { JwtAuthGuard } from './jwt-auth.guard'
import { UsersService } from '@/user/user.service'
import { JobService } from '@/job/job.service'

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jobService: JobService,
    private userService: UsersService,
    private googleAuthService: GoogleAuthService,
  ) {}

  @Get('google')
  async googleAuth(@Query('redirectUrl') redirectUrl: string, @Response() res) {
    // Set the redirect URL as the referer URL in cookie
    res.cookie('redirectUrl', redirectUrl || process.env.FRONTEND_URL)
    res.redirect(this.googleAuthService.getGoogleAuthUrl())
  }

  @Get('google/callback')
  async googleAuthRedirect(@Request() req, @Response() res) {
    const profile = (await this.googleAuthService.getProfile(
      req.query.code,
    )) as any

    if (!profile.email) {
      throw new BadRequestException('No email in profile')
    }

    const user = await this.userService.findByEmail(profile.email)
    if (!user) {
      await this.userService.create({
        email: profile.email,
      })
    }

    const sessionToken = await this.authService.getSessionToken(profile.email)

    // Set user data in cookie
    res.cookie('sessionToken', sessionToken)

    // Get redirect URL from cookie
    const redirectUrl = req.cookies.redirectUrl

    // Clear redirect URL in cookie
    res.clearCookie('redirectUrl')

    // Redirect the client to the redirect URL
    res.redirect(redirectUrl)
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Response() res) {
    const sessionToken = await this.authService.getSessionToken(req.user.email)

    // Set user data in cookie
    res.cookie('sessionToken', sessionToken)
  }

  @UseGuards(JwtAuthGuard)
  @Get('session')
  async session(@Request() req, @Response() res) {
    const user = await this.userService.findByEmail(req.user.email)
    if (!user) {
      throw new BadRequestException('User not found')
    }

    const jobSearch = await this.jobService.getLatestJobSearchByUserId(user.id)
    const savedJobs = await this.jobService.getSavedJobsByUserId(user.id)

    // Refresh token if it's about to expired
    if (req.user.exp - Date.now() / 1000 < 300) {
      const refreshedToken = await this.authService.getSessionToken(
        req.user.email,
      )
      res.cookie('sessionToken', refreshedToken)
    }

    res.json({
      user: {
        ...user,
        password: undefined,
      },
      jobSearch,
      savedJobs,
    })
  }

  @Post('signup')
  async signup(@Request() req) {
    if (!req.body.email || !req.body.password) {
      return new BadRequestException('Email and password are required')
    }

    const user = await this.authService.signup(
      req.body.email,
      req.body.password,
    )

    return {
      ...user,
      password: undefined,
    }
  }
}
