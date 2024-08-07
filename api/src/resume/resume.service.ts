import { PrismaService } from '@/prisma.service'
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import * as fs from 'fs'
import * as pdfParse from 'pdf-parse'
import * as mammoth from 'mammoth'
import * as Tesseract from 'tesseract.js'
import { extname } from 'path'
import { RunnableLike } from '@langchain/core/runnables'
import { GenResumeFromTextAgent } from '@/agents/resume_gen/gen_resume_from_text_agent'

export interface updateBasicInfoData {
  googleJobId: string
  jobTitle: string
  jobLocation: string
  jobDescription: string
  jobData: any
}

@Injectable()
export class ResumeService {
  private resumeGenAgent: GenResumeFromTextAgent

  constructor(
    private prisma: PrismaService,
    @Inject('GPT3') private gpt3: RunnableLike,
  ) {
    this.resumeGenAgent = new GenResumeFromTextAgent(this.gpt3)
  }

  async deleteResume({
    resumeId,
    userId,
  }: {
    resumeId: string
    userId: string
  }) {
    const resume = await this.prisma.userResume.findFirst({
      where: {
        id: resumeId,
        userId,
      },
    })

    if (!resume) {
      return new NotFoundException(`user resume not found for ${resumeId}`)
    }

    return await this.prisma.userResume.delete({
      where: {
        id: resumeId,
        userId,
      },
    })
  }

  async createResume(params: {
    userId: string
    basicInfo: any
    educations?: any[]
    workExperiences?: any[]
  }) {
    const { userId, basicInfo, educations, workExperiences } = params

    const existingResume = await this.prisma.userResume.findFirst({
      where: {
        userId,
      },
    })
    if (existingResume) {
      await this.prisma.userResume.delete({
        where: {
          userId,
        },
      })
    }

    const resume = await this.prisma.userResume.create({
      data: {
        userId,
        ...basicInfo,
      },
    })

    if (educations?.length > 0) {
      await this.prisma.userEducation.createMany({
        data: educations.map((education) => {
          return {
            ...education,
            userResumeId: resume.id,
          }
        }),
      })
    }

    if (workExperiences?.length > 0) {
      await this.prisma.userWorkExperience.createMany({
        data: workExperiences.map((workExperience) => {
          return {
            ...workExperience,
            userResumeId: resume.id,
          }
        }),
      })
    }

    return await this.prisma.userResume.findFirst({
      where: {
        id: resume.id,
      },
      include: {
        educations: true,
        workExperiences: true,
      },
    })

    // const createEducations =
    //   educations?.length > 0
    //     ? {
    //         createMany: {
    //           data: educations.map((education) => {
    //             return {
    //               ...education,
    //             }
    //           }),
    //         },
    //       }
    //     : undefined
    // const createWorkExperiences =
    //   workExperiences?.length > 0
    //     ? {
    //         createMany: {
    //           data: workExperiences.map((workExperience) => {
    //             return {
    //               ...workExperience,
    //             }
    //           }),
    //         },
    //       }
    //     : undefined

    // console.log('creating resume, educations', createEducations)
    // console.log('creating resume, workExperiences', createWorkExperiences)
    // return await this.prisma.userResume.create({
    //   data: {
    //     userId,
    //     educations: createEducations,
    //     workExperiences: createWorkExperiences,
    //     ...basicInfo,
    //   },
    //   include: {
    //     educations: true,
    //     workExperiences: true,
    //   },
    // })
  }

  async getResume({ resumeId, userId }: { resumeId: string; userId: string }) {
    return await this.prisma.userResume.findFirst({
      where: {
        id: resumeId,
        userId,
      },
      include: {
        educations: true,
        workExperiences: true,
      },
    })
  }

  async createEducation(params: {
    userId: string
    resumeId: string
    data: any
  }) {
    const { userId, resumeId, data } = params

    return await this.prisma.userResume.update({
      where: {
        userId: userId,
        id: resumeId,
      },
      data: {
        educations: {
          create: data,
        },
      },
      include: {
        workExperiences: true,
        educations: true,
      },
    })
  }

  async createWorkExperience(params: {
    userId: string
    resumeId: string
    data: any
  }) {
    const { userId, resumeId, data } = params

    return await this.prisma.userResume.update({
      where: {
        userId: userId,
        id: resumeId,
      },
      data: {
        workExperiences: {
          create: data,
        },
      },
      include: {
        workExperiences: true,
        educations: true,
      },
    })
  }

  async updateBasicInfo(params: {
    userId: string
    resumeId: string
    data: any
  }) {
    const { userId, resumeId, data } = params
    const resume = await this.prisma.userResume.findFirst({
      where: {
        id: resumeId,
        userId,
      },
    })

    if (!resume) {
      return new NotFoundException(`user resume not found for ${resumeId}`)
    }

    return await this.prisma.userResume.update({
      where: {
        id: resumeId,
      },
      data,
      include: {
        educations: true,
        workExperiences: true,
      },
    })
  }

  async updateEducation(params: {
    userId: string
    resumeId: string
    educationId: string
    data: any
  }) {
    const { userId, resumeId, educationId, data } = params

    return await this.prisma.userResume.update({
      where: {
        userId,
        id: resumeId,
      },
      data: {
        educations: {
          update: {
            where: {
              id: educationId,
            },
            data,
          },
        },
      },
      include: {
        educations: true,
        workExperiences: true,
      },
    })
  }

  async updateWorkExperience(params: {
    userId: string
    resumeId: string
    workExperienceId: string
    data: any
  }) {
    const { userId, resumeId, workExperienceId, data } = params

    return await this.prisma.userResume.update({
      where: {
        userId,
        id: resumeId,
      },
      data: {
        workExperiences: {
          update: {
            where: {
              id: workExperienceId,
            },
            data,
          },
        },
      },
      include: {
        educations: true,
        workExperiences: true,
      },
    })
  }

  async extractText(file: Express.Multer.File): Promise<string> {
    const ext = extname(file.originalname).toLowerCase()
    const mimeType = file.mimetype
    let text = ''

    if (ext === '.pdf' && mimeType === 'application/pdf') {
      text = await this.extractTextFromPdf(file.path)
    } else if (
      (ext === '.doc' || ext === '.docx') &&
      mimeType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      text = await this.extractTextFromDoc(file.path)
    } else if (ext === '.png' && mimeType === 'image/png') {
      text = await this.extractTextFromPng(file.path)
    } else {
      throw new BadRequestException('Unsupported file type')
    }

    return text
  }

  private async extractTextFromPdf(filePath: string): Promise<string> {
    const dataBuffer = fs.readFileSync(filePath)
    const data = await pdfParse(dataBuffer)
    return data.text
  }

  private async extractTextFromDoc(filePath: string): Promise<string> {
    const dataBuffer = fs.readFileSync(filePath)
    const result = await mammoth.extractRawText({ buffer: dataBuffer })
    return result.value
  }

  private async extractTextFromPng(filePath: string): Promise<string> {
    const {
      data: { text },
    } = await Tesseract.recognize(filePath, 'eng')
    return text
  }

  async generateStructuredResumeFromText(text: string) {
    const response = await this.resumeGenAgent.run(text)

    return JSON.parse(response)
  }
}
