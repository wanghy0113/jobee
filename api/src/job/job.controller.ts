import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { JobService, SaveJobData } from './job.service'
import { JwtAuthGuard } from '@/auth/jwt-auth.guard'

@Controller('job')
export class JobController {
  constructor(private jobService: JobService) {}

  @UseGuards(JwtAuthGuard)
  @Get('job-searches')
  async getJobSearches(@Request() req) {
    return this.jobService.getJobSearchesByUserId(req.user.id)
  }

  @Post('/search')
  async searchJobs(@Body() data: { jobTitle: string; jobLocation: string }) {
    return this.jobService.searchJobs(data)
  }

  @UseGuards(JwtAuthGuard)
  @Post('/create-search')
  async createJobSearch(
    @Request() req,
    @Body('jobTitle') jobTitle: string,
    @Body('jobLocation') jobLocation: string,
  ) {
    console.log('>>>>>request user', req.user.id)
    if (!req.user.id) {
      throw new UnauthorizedException('User ID is required')
    }

    if (!jobTitle || !jobLocation) {
      throw new BadRequestException('Job title and location are required')
    }

    return this.jobService.createJobSearch({
      userId: req.user.id,
      jobLocation,
      jobTitle,
    })
  }

  @UseGuards(JwtAuthGuard)
  @Post('/saved')
  async saveJob(@Request() req, @Body() data: SaveJobData) {
    await this.jobService.saveJob({
      userId: req.user.id,
      job: data,
    })

    return {
      status: 'success',
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/saved/:googleJobId')
  async deleteSavedJob(
    @Request() req,
    @Param('googleJobId') googleJobId: string,
  ) {
    console.log('deleteSavedJob', req.user.id, googleJobId)
    await this.jobService.deleteSavedJob(req.user.id, googleJobId)

    return {
      status: 'success',
    }
  }
}
