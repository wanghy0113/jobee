import { ChatPromptTemplate } from '@langchain/core/prompts'
import { RunnableLike, Runnable } from '@langchain/core/runnables'
import {
  all_in_one_prompt,
  job_contents_prompt,
  meta_only_prompt,
  skills_prompt,
} from './prompt/job_matching_prompt_few_shot_cot'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { Logger } from '@nestjs/common'

export class JobMatchAgent {
  private allInOneChain: Runnable
  private matchMetaChain: Runnable
  private matchSkillsChain: Runnable
  private matchJobContentsChain: Runnable

  constructor(model: RunnableLike) {
    this.allInOneChain = this.buildMatchChain(model, all_in_one_prompt)
    this.matchMetaChain = this.buildMatchChain(model, meta_only_prompt)
    this.matchSkillsChain = this.buildMatchChain(model, skills_prompt)
    this.matchJobContentsChain = this.buildMatchChain(
      model,
      job_contents_prompt,
    )
  }

  buildMatchChain(
    model: RunnableLike,
    prompt: typeof all_in_one_prompt,
  ): Runnable {
    const promptTemplate = ChatPromptTemplate.fromMessages([
      ['system', prompt.system],
      ['user', prompt.examples[0][0]],
      ['ai', prompt.examples[0][1]],
      [
        'user',
        `Please perform matching for the following information - forget the previous example:

---job seeker profile---
{userProfile}

---job description---
{jobContent}`,
      ],
    ])
    return promptTemplate.pipe(model).pipe(new StringOutputParser())
  }

  async matchMeta(
    jobContent: any,
    userProfile: string,
    maxRetries: number = 3,
  ) {
    Logger.debug('Start matching job meta...')
    const jobContentUpdated = {
      job_title: jobContent.title || '',
      locations: jobContent.locations || [],
      salary: jobContent.salary || '',
      experience: jobContent.experience || '',
      education: jobContent.education || '',
      company_name: jobContent.companyName || '',
      company_size: jobContent.companySize || '',
      company_culture: jobContent.companyCulture || '',
      company_industry: jobContent.companyIndustry || '',
      remoteOk: jobContent.remoteOk || false,
      job_types: jobContent.jobTypes || [],
      benefits: jobContent.benefits || [],
    }
    let retry = 0
    while (retry < maxRetries) {
      try {
        const output = await this.matchMetaChain.invoke({
          jobContent: JSON.stringify(jobContentUpdated),
          userProfile,
        })
        const startingIndex = output.indexOf('{')
        const parsedOutput = output.substring(startingIndex)
        Logger.debug(`Job meta match output: ${parsedOutput}`)
        const result = JSON.parse(parsedOutput)
        if (!result) {
          throw new Error('Result not found')
        }

        Logger.debug(`Job meta matched: ${result}`)
        return result
      } catch (error) {
        Logger.error(`Failed to match job meta: ${error}, retrying...`)
        retry++
      }
    }

    Logger.error(`Failed to match job meta after ${retry} retries.`)
  }

  async matchSkills(
    jobContent: any,
    userProfile: string,
    maxRetries: number = 3,
  ) {
    Logger.debug('Start matching job skills...')
    const jobContentUpdated = {
      skills: jobContent.skills || [],
    }
    let retry = 0
    while (retry < maxRetries) {
      try {
        const output = await this.matchSkillsChain.invoke({
          jobContent: JSON.stringify(jobContentUpdated),
          userProfile,
        })
        const startingIndex = output.indexOf('{')
        const parsedOutput = output.substring(startingIndex)
        Logger.debug(`Job skills match output: ${parsedOutput}`)
        const result = JSON.parse(parsedOutput)
        if (!result) {
          throw new Error('Result not found')
        }

        Logger.debug(`Job skills matched: ${result}`)
        return result
      } catch (error) {
        Logger.error(`Failed to match job skills: ${error}, retrying...`)
        retry++
      }
    }

    Logger.error(`Failed to match job skills after ${retry} retries.`)
  }

  async matchJobContents(
    jobContent: any,
    userProfile: string,
    maxRetries: number = 3,
  ) {
    Logger.debug('Start matching job contents...')
    const jobContentUpdated = {
      job_contents: jobContent.jobContents || [],
    }
    let retry = 0
    while (retry < maxRetries) {
      try {
        const output = await this.matchJobContentsChain.invoke({
          jobContent: JSON.stringify(jobContentUpdated),
          userProfile,
        })
        const startingIndex = output.indexOf('{')
        const parsedOutput = output.substring(startingIndex)
        Logger.debug(`Job contents match output: ${parsedOutput}`)
        const result = JSON.parse(parsedOutput)
        if (!result) {
          throw new Error('Result not found')
        }

        Logger.debug(`Job contents matched: ${result}`)
        return result
      } catch (error) {
        Logger.error(`Failed to match job contents: ${error}, retrying...`)
        retry++
      }
    }

    Logger.error(`Failed to match job contents after ${retry} retries.`)
  }

  async matchAllInOne(
    jobContent: any,
    userProfile: string,
    maxRetries: number = 3,
  ) {
    Logger.debug('Start matching job all in one...')
    let retry = 0
    while (retry < maxRetries) {
      try {
        const output = await this.allInOneChain.invoke({
          jobContent: JSON.stringify(jobContent),
          userProfile,
        })
        const startingIndex = output.indexOf('{')
        const parsedOutput = output.substring(startingIndex)
        Logger.debug(`Job all in one match output: ${parsedOutput}`)
        const result = JSON.parse(parsedOutput)
        if (!result) {
          throw new Error('Result not found')
        }

        Logger.debug(`Job all in one matched: ${result}`)
        return result
      } catch (error) {
        Logger.error(`Failed to match job all in one: ${error}, retrying...`)
        retry++
      }
    }

    Logger.error(`Failed to match job all in one after ${retry} retries.`)
  }

  async matchWith3Steps(
    jobContent: any,
    userProfile: string,
    maxRetries: number = 3,
  ) {
    Logger.debug('Start matching job with 3 steps...')
    const metaMatchRes = await this.matchMeta(
      jobContent,
      userProfile,
      maxRetries,
    )
    const skillsMatchRes = await this.matchSkills(
      jobContent,
      userProfile,
      maxRetries,
    )
    const jobContentsMatchRes = await this.matchJobContents(
      jobContent,
      userProfile,
      maxRetries,
    )

    if (!metaMatchRes || !skillsMatchRes || !jobContentsMatchRes) {
      Logger.error('Failed to match job with 3 steps.')
      return null
    }

    return {
      ...metaMatchRes,
      ...skillsMatchRes,
      ...jobContentsMatchRes,
    }
  }
}
