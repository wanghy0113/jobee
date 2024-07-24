import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ChatOpenAI } from '@langchain/openai'
import { PrismaService } from './prisma.service'
import { GeoService } from './geo/geo.service'
import { GeoController } from './geo/geo.controller'
import { GoogleJobsCrawler } from './job-crawler/google'
import { OrganizationController } from './organization/organization.controller'
import { OrganizationService } from './organization/organization.service'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './user/user.module'
import { AuthController } from './auth/auth.controller'
import { AuthService } from './auth/auth.service'
import { UsersService } from './user/user.service'
import { JwtModule } from '@nestjs/jwt'
import { jwtConstants } from './auth/constants'
import { UserController } from './user/user.controller'
import { JobModule } from './job/job.module'
import { GoogleAuthService } from './auth/google-auth-service'

@Module({
  imports: [
    AuthModule,
    UsersModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
    JobModule,
  ],
  controllers: [
    AppController,
    GeoController,
    OrganizationController,
    AuthController,
    UserController,
  ],
  providers: [
    AppService,
    GeoService,
    AuthService,
    UsersService,
    GoogleJobsCrawler,
    GoogleAuthService,
    OrganizationService,
    PrismaService,
    {
      provide: 'GPT3',
      useValue: new ChatOpenAI({ model: 'gpt-3.5-turbo' }),
    },
  ],
})
export class AppModule {}
