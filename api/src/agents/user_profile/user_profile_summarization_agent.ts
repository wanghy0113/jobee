import { Expose, plainToInstance } from 'class-transformer'
import {
  IsOptional,
  IsString,
  IsArray,
  validateOrReject,
} from 'class-validator'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { RunnableLike, Runnable } from '@langchain/core/runnables'
import { prompt } from './prompt/user_profile_summarization_few_shot'
import 'reflect-metadata'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { Logger } from '@nestjs/common'

export class UserProfileSummarizationResult {
  @Expose({ name: 'job_title' })
  @IsOptional()
  @IsString()
  jobTitle?: string

  @Expose({ name: 'locations' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  locations?: string[]

  @Expose({ name: 'skills' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[]

  @Expose({ name: 'experiences' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  experiences?: string[]

  @Expose({ name: 'education' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  education?: string[]

  @Expose({ name: 'job_contents' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  jobContents?: string[]
}

export class UserProfileSummarizationAgent {
  private chain: Runnable

  constructor(model: RunnableLike) {
    const promptTemplate = ChatPromptTemplate.fromMessages([
      ['system', prompt.system],
      ['user', '{profile}'],
    ])
    this.chain = promptTemplate.pipe(model).pipe(new StringOutputParser())
  }

  async run(
    profile: string,
    retries = 3,
  ): Promise<UserProfileSummarizationResult | null> {
    Logger.debug('Start summarizing user profile...')
    let retry = 0
    while (retry < retries) {
      try {
        const output = await this.chain.invoke({ profile })
        const startingIndex = output.indexOf('{')
        const jsonString = output.substring(startingIndex)
        const result = plainToInstance(
          UserProfileSummarizationResult,
          JSON.parse(jsonString),
        )

        await validateOrReject(result)
        return result
      } catch (e) {
        Logger.error(`Failed to summarize user profile: ${e}, retrying...`)
        retry += 1
      }
    }

    Logger.error(`Failed to summarize user profile after ${retry} retries.`)
    return null
  }
}
