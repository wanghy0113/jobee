import { Expose, plainToInstance } from 'class-transformer'
import {
  IsOptional,
  IsString,
  IsArray,
  validateOrReject,
} from 'class-validator'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { RunnableLike, Runnable } from '@langchain/core/runnables'
import { prompt } from './prompt'
import 'reflect-metadata'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { Logger } from '@nestjs/common'

export class CompanySummaryAgentResult {
  @Expose({ name: 'intro' })
  @IsOptional()
  @IsString()
  intro?: string

  @Expose({ name: 'industry' })
  @IsOptional()
  @IsString()
  industry?: string

  @Expose({ name: 'labels' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  labels?: string[]
}

export class CompanySummaryAgent {
  private chain: Runnable

  constructor(model: RunnableLike) {
    const promptTemplate = ChatPromptTemplate.fromMessages([
      ['system', prompt.system],
      ['user', '{job_description}'],
    ])
    this.chain = promptTemplate.pipe(model).pipe(new StringOutputParser())
  }

  async run(
    jobDescription: string,
    retries = 3,
  ): Promise<CompanySummaryAgentResult | null> {
    Logger.debug('Start summarizing comany info...')
    let retry = 0
    while (retry < retries) {
      try {
        const output = await this.chain.invoke({
          job_description: jobDescription,
        })
        console.log(output)
        const startingIndex = output.indexOf('{')
        const jsonString = output.substring(startingIndex)
        console.log(jsonString)
        const result = plainToInstance(
          CompanySummaryAgentResult,
          JSON.parse(jsonString),
        )

        await validateOrReject(result)
        return result
      } catch (e) {
        Logger.error(`Failed to summarize company info: ${e}, retrying...`)
        retry += 1
      }
    }

    Logger.error(`Failed to summarize company info after ${retry} retries.`)
    return null
  }
}
