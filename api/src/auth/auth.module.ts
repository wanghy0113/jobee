import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { LocalStrategy } from './local.strategy'
import { JwtStrategy } from './jwt.strategy'
import { UsersModule } from '../user/user.module'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { jwtConstants } from './constants'
import { GoogleAuthService } from './google-auth-service'
import { JobService } from '@/job/job.service'
import { PrismaService } from '@/prisma.service'
import { GoogleJobsCrawler } from '@/job-crawler/google'
import { OrganizationService } from '@/organization/organization.service'

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [
    PrismaService,
    AuthService,
    LocalStrategy,
    JwtStrategy,
    GoogleJobsCrawler,
    GoogleAuthService,
    OrganizationService,
    JobService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
