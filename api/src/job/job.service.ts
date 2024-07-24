import { GoogleJobsCrawler } from '@/job-crawler/google'
import { PrismaService } from '@/prisma.service'
import { Injectable } from '@nestjs/common'

export interface SaveJobData {
  googleJobId: string
  jobTitle: string
  jobLocation: string
  jobDescription: string
  jobData: any
}

@Injectable()
export class JobService {
  constructor(
    private prisma: PrismaService,
    private googleJobsCrawler: GoogleJobsCrawler,
  ) {}

  async searchJobs(data: { jobTitle: string; jobLocation: string }) {
    return this.googleJobsCrawler.crawlJobs(
      `${data.jobTitle} ${data.jobLocation}`,
    )
  }

  async getSavedJobsByUserId(userId: string) {
    return this.prisma.userSavedJobs.findMany({
      where: { userId },
    })
  }

  async saveJob(data: { userId: string; job: SaveJobData }) {
    return this.prisma.userSavedJobs.upsert({
      create: {
        userId: data.userId,
        googleJobId: data.job.googleJobId,
        jobTitle: data.job.jobTitle,
        jobLocation: data.job.jobLocation,
        jobDescription: data.job.jobDescription,
        jobData: JSON.stringify(data.job.jobData),
      },
      update: {
        jobTitle: data.job.jobTitle,
        jobLocation: data.job.jobLocation,
        jobDescription: data.job.jobDescription,
        jobData: JSON.stringify(data.job.jobData),
      },
      where: {
        userId_googleJobId: {
          userId: data.userId,
          googleJobId: data.job.googleJobId,
        },
      },
    })
  }

  async deleteSavedJob(userId: string, googleJobId: string) {
    await this.prisma.userSavedJobs.delete({
      where: {
        userId_googleJobId: {
          userId,
          googleJobId,
        },
      },
    })
  }

  async getJobSearchById(id: string) {
    return this.prisma.userJobSearch.findUnique({
      where: { id },
    })
  }

  async getJobSearchesByUserId(id: string) {
    return this.prisma.userJobSearch.findMany({
      where: { user: { id } },
    })
  }

  async getLatestJobSearchByUserId(id: string) {
    return this.prisma.userJobSearch.findFirst({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
    })
  }

  async createJobSearch(data: {
    userId: string
    jobLocation: string
    jobTitle: string
  }) {
    return this.prisma.userJobSearch.create({
      data: {
        userId: data.userId,
        jobLocation: data.jobLocation,
        jobTitle: data.jobTitle,
      },
    })
  }

  makeCrawlQuery(jobSearch: { jobTitle: string; jobLocation: string }) {
    return `${jobSearch.jobTitle} ${jobSearch.jobLocation}`
  }
}
