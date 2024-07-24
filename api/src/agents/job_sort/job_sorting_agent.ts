import { Expose } from 'class-transformer'
import {
  validateOrReject,
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
} from 'class-validator'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { RunnableLike, Runnable } from '@langchain/core/runnables'
import { prompt } from './prompt/job_sorting_prompt_few_shot'
import { plainToInstance } from 'class-transformer'
import 'reflect-metadata'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { Logger } from '@nestjs/common'

export class JobSortResult {
  @Expose({ name: 'salary' })
  @IsOptional()
  @IsString()
  salary?: string

  @Expose({ name: 'locations' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  locations?: string[]

  @Expose({ name: 'title' })
  @IsOptional()
  @IsString()
  title?: string

  @Expose({ name: 'skills' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[]

  @Expose({ name: 'experience' })
  @IsOptional()
  @IsString()
  experience?: string

  @Expose({ name: 'remote_ok' })
  @IsOptional()
  @IsBoolean()
  remoteOk?: boolean

  @Expose({ name: 'job_types' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  jobTypes?: string[]

  @Expose({ name: 'benefits' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[]

  @Expose({ name: 'job_contents' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  jobContents?: string[]

  @Expose({ name: 'education' })
  @IsOptional()
  @IsString()
  education?: string

  @Expose({ name: 'company_name' })
  @IsOptional()
  @IsString()
  companyName?: string

  @Expose({ name: 'company_size' })
  @IsOptional()
  @IsString()
  companySize?: string

  @Expose({ name: 'company_culture' })
  @IsOptional()
  @IsString()
  companyCulture?: string

  @Expose({ name: 'company_industry' })
  @IsOptional()
  @IsString()
  companyIndustry?: string
}

export class JobSortAgent {
  private chain: Runnable

  constructor(model: RunnableLike) {
    this.chain = ChatPromptTemplate.fromMessages([
      ['system', prompt.system],
      ['user', prompt.examples[0][0]],
      ['ai', prompt.examples[0][1]],
      ['user', '{job}'],
    ])
      .pipe(model)
      .pipe(new StringOutputParser())
  }

  async sort(job: string, retries = 3): Promise<JobSortResult | null> {
    Logger.debug('Start sorting job...')
    let retry = 0
    while (retry < retries) {
      try {
        const output = await this.chain.invoke({ job })
        Logger.debug(`Output: ${output}`)
        const startingIndex = output.indexOf('{')
        const jsonString = output.substring(startingIndex)
        const result = plainToInstance(JobSortResult, JSON.parse(jsonString))

        await validateOrReject(result)
        return result
      } catch (e) {
        Logger.error(`Failed to sort job: ${e}, retrying...`)
        retry += 1
      }
    }

    Logger.error(`Failed to sort job after ${retries} retries.`)
    return null
  }
}
