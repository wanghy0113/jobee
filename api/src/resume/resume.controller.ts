import {
  Controller,
  Patch,
  Body,
  Param,
  Post,
  UseGuards,
  Request,
  UnauthorizedException,
  Get,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Delete,
} from '@nestjs/common'
import { ResumeService } from './resume.service'
import { JwtAuthGuard } from '@/auth/jwt-auth.guard'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'

@Controller('resume')
export class ResumeController {
  constructor(private resumesService: ResumeService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/create-from-file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9)
          const ext = extname(file.originalname)
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`
          callback(null, filename)
        },
      }),
    }),
  )
  async uploadFile(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded')
    }

    if (!req.user) {
      throw new UnauthorizedException('request unauthorized')
    }

    const text = await this.resumesService.extractText(file)

    const resume =
      await this.resumesService.generateStructuredResumeFromText(text)
    return await this.resumesService.createResume({
      basicInfo: {
        ...resume,
        educations: undefined,
        workExperiences: undefined,
      },
      educations: resume.educations,
      workExperiences: resume.workExperiences,
      userId: req.user.id,
    })
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:resumeId')
  async deleteResume(@Request() req, @Param('resumeId') resumeId: string) {
    if (!req.user) {
      throw new UnauthorizedException('request unauthorized')
    }

    return await this.resumesService.deleteResume({
      userId: req.user.id,
      resumeId,
    })
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:resumeId')
  async getResume(@Request() req, @Param('resumeId') resumeId: string) {
    if (!req.user) {
      throw new UnauthorizedException('request unauthorized')
    }

    return await this.resumesService.getResume({
      userId: req.user.id,
      resumeId,
    })
  }

  @UseGuards(JwtAuthGuard)
  @Post('/')
  async createResume(
    @Request() req,
    @Body('basicInfo') basicInfo: any,
    @Body('educations') educations: any[],
    @Body('workExperiences') workExperiences: any[],
  ) {
    if (!req.user) {
      throw new UnauthorizedException('request unauthorized')
    }

    return await this.resumesService.createResume({
      userId: req.user.id,
      basicInfo,
      educations,
      workExperiences,
    })
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:resumeId/education')
  async createEducation(
    @Request() req,
    @Param('resumeId') resumeId: string,
    @Body() data: any,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('request unauthorized')
    }

    return await this.resumesService.createEducation({
      userId: req.user.id,
      resumeId,
      data,
    })
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:resumeId/workExperience')
  async createWorkExperience(
    @Request() req,
    @Param('resumeId') resumeId: string,
    @Body() data: any,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('request unauthorized')
    }

    return await this.resumesService.createWorkExperience({
      userId: req.user.id,
      resumeId,
      data,
    })
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/:resumeId/basic-info')
  async updateBasicInfo(
    @Request() req,
    @Param('resumeId') resumeId: string,
    @Body() data: any,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('request unauthorized')
    }

    return await this.resumesService.updateBasicInfo({
      userId: req.user.id,
      resumeId,
      data,
    })
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/:resumeId/education/:educationId')
  async updateEducation(
    @Request() req,
    @Param('resumeId') resumeId: string,
    @Param('educationId') educationId: string,
    @Body() data: any,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('request unauthorized')
    }

    return await this.resumesService.updateEducation({
      userId: req.user.id,
      resumeId,
      educationId,
      data,
    })
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/:resumeId/workExperience/:workExperienceId')
  async updateWorkExperiences(
    @Request() req,
    @Param('resumeId') resumeId: string,
    @Param('workExperienceId') workExperienceId: string,
    @Body() data: any,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('request unauthorized')
    }

    return await this.resumesService.updateWorkExperience({
      userId: req.user.id,
      resumeId,
      workExperienceId,
      data,
    })
  }
}
