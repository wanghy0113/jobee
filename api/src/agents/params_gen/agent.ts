import { Expose, plainToInstance } from 'class-transformer'
import {
  IsOptional,
  IsString,
  IsArray,
  validateOrReject,
  IsNumber,
} from 'class-validator'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { RunnableLike, Runnable } from '@langchain/core/runnables'
import { prompt } from './prompt/params_gen_prompt'
import 'reflect-metadata'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { Logger } from '@nestjs/common'

export class ParamsGenAgentResult {
  @Expose({ name: 'keywords' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[]

  @Expose({ name: 'locations' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  locations?: string[]

  @Expose({ name: 'trace_back_days' })
  @IsOptional()
  @IsNumber()
  traceBackDays?: number
}

export class ParamsGenAgent {
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
  ): Promise<ParamsGenAgentResult | null> {
    Logger.debug('Start generating search params...')
    let retry = 0
    while (retry < retries) {
      try {
        const output = await this.chain.invoke({
          job_description: jobDescription,
        })
        const startingIndex = output.indexOf('{')
        const jsonString = output.substring(startingIndex)
        const result = plainToInstance(
          ParamsGenAgentResult,
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
