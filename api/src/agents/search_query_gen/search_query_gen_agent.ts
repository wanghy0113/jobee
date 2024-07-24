import { ChatPromptTemplate } from '@langchain/core/prompts'
import { RunnableLike, Runnable } from '@langchain/core/runnables'
import { prompt } from './prompt/search_query_gen_prompt'
import 'reflect-metadata'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { Logger } from '@nestjs/common'

export class SearchQueryGenAgent {
  private chain: Runnable

  constructor(model: RunnableLike) {
    const promptTemplate = ChatPromptTemplate.fromMessages([
      ['system', prompt.system],
      ['user', '{job_description}'],
    ])
    this.chain = promptTemplate.pipe(model).pipe(new StringOutputParser())
  }

  async run(jobDescription: string, retries = 3): Promise<string | null> {
    Logger.debug('Start generating search query...')
    let retry = 0
    while (retry < retries) {
      try {
        const output = await this.chain.invoke({
          job_description: jobDescription,
        })

        return output
      } catch (e) {
        Logger.error(`Failed to generate search query: ${e}, retrying...`)
        retry += 1
      }
    }

    Logger.error(`Failed to generate search query after ${retry} retries.`)
    return null
  }
}
