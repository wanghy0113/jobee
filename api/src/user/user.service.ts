import { PrismaService } from '@/prisma.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    })
  }

  async findByEmail(email: string) {
    if (!email) {
      return null
    }

    return this.prisma.user.findUnique({
      where: { email },
      include: {
        userResume: {
          include: {
            educations: true,
            workExperiences: true,
          },
        },
      },
    })
  }

  async create(data: { email: string; password?: string }) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
      },
    })
  }
}
