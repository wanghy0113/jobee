import { Module } from '@nestjs/common'
import { JobController } from './job.controller'
import { JobService } from './job.service'
import { PrismaService } from '@/prisma.service'
import { GoogleJobsCrawler } from '@/job-crawler/google'
import { OrganizationService } from '@/organization/organization.service'

@Module({
  controllers: [JobController],
  providers: [
    JobService,
    PrismaService,
    GoogleJobsCrawler,
    OrganizationService,
  ],
  exports: [JobService],
})
export class JobModule {}
