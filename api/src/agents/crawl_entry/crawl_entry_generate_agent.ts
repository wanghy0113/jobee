import { Expose } from 'class-transformer'
import {
  validateOrReject,
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
  IsInt,
} from 'class-validator'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { RunnableLike, Runnable } from '@langchain/core/runnables'
import { prompt } from './prompt/crawl_entry_generate_prompt_few_shot'
import { plainToInstance } from 'class-transformer'
import { StringOutputParser } from '@langchain/core/output_parsers'
import 'reflect-metadata'
import { Logger } from '@nestjs/common'

export class CrawlEntryAgentResult {
  @Expose({ name: 'locations' })
  @IsArray()
  @IsString({ each: true })
  locations: string[]

  @Expose({ name: 'keywords' })
  @IsArray()
  @IsString({ each: true })
  keywords: string[]

  @Expose({ name: 'remote_ok' })
  @IsOptional()
  @IsBoolean()
  remoteOk?: boolean

  @Expose({ name: 'salary_range' })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  salaryRange?: number[]

  @Expose({ name: 'job_types' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  jobTypes?: string[]
}

export class CrawlEntryGenerateAgent {
  private chain: Runnable

  constructor(model: RunnableLike) {
    this.chain = ChatPromptTemplate.fromMessages([
      ['system', prompt.system],
      ['user', prompt.examples[0][0]],
      ['ai', prompt.examples[0][0]],
      ['user', '{profile}'],
    ])
      .pipe(model)
      .pipe(new StringOutputParser())
  }

  async run(
    profile: string,
    retries = 3,
  ): Promise<CrawlEntryAgentResult | null> {
    Logger.debug('Start generating crawl entry...')
    let retry = 0
    while (retry < retries) {
      try {
        const output = await this.chain.invoke({ profile: profile })
        Logger.debug(`Output: ${output}`)
        const startingIndex = output.indexOf('{')
        const jsonString = output.substring(startingIndex)
        const result = plainToInstance(
          CrawlEntryAgentResult,
          JSON.parse(jsonString),
        )

        await validateOrReject(result)
        return result
      } catch (e) {
        Logger.error(`Failed to generate job crawl entry: ${e}, retrying...`)
        retry += 1
      }
    }

    Logger.error(`Failed to generate job crawl entry after ${retries} retries.`)
    return null
  }
}
