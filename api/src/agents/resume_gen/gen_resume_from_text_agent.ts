import { ChatPromptTemplate } from '@langchain/core/prompts'
import { RunnableLike, Runnable } from '@langchain/core/runnables'
import { prompt } from './prompt/gen_resume_from_text_prompt'
import 'reflect-metadata'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { Logger } from '@nestjs/common'

export class GenResumeFromTextAgent {
  private chain: Runnable

  constructor(model: RunnableLike) {
    const promptTemplate = ChatPromptTemplate.fromMessages([
      ['system', prompt.system],
      ['user', '{resume_text}'],
    ])
    this.chain = promptTemplate.pipe(model).pipe(new StringOutputParser())
  }

  async run(resumeText: string, retries = 3): Promise<string | null> {
    Logger.debug('Start generating structured resume...')
    let retry = 0
    while (retry < retries) {
      try {
        const output = await this.chain.invoke({
          resume_text: resumeText,
        })

        return output
      } catch (e) {
        Logger.error(`Failed to generate structured resume: ${e}, retrying...`)
        retry += 1
      }
    }

    Logger.error(`Failed to generate structured resume after ${retry} retries.`)
    return null
  }
}
