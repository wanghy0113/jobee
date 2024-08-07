import { Module } from '@nestjs/common'
import { ResumeService } from './resume.service'
import { PrismaService } from '@/prisma.service'
import { ChatOpenAI } from '@langchain/openai'

@Module({
  providers: [
    ResumeService,
    PrismaService,
    {
      provide: 'GPT3',
      useValue: new ChatOpenAI({ model: 'gpt-3.5-turbo' }),
    },
  ],
  exports: [ResumeService],
})
export class ResumeModule {}
