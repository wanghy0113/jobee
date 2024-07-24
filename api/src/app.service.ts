import { Inject, Injectable } from '@nestjs/common'
import { ParamsGenAgent } from './agents/params_gen/agent'
import { RunnableLike } from '@langchain/core/runnables'
import { CrawlResult } from './job-crawler/types'
import { CrawlJobOptions, GoogleJobsCrawler } from './job-crawler/google'
import { SearchQueryGenAgent } from './agents/search_query_gen/search_query_gen_agent'
import { CompanySummaryAgent } from './agents/company_summary/agent'

export interface SearchByJobDescriptionResult {
  params?: {
    keywords: string[]
    locations: string[]
    traceBackDays: number
  }
  jobs?: CrawlResult[]
  errors?: string[]
}

@Injectable()
export class AppService {
  private paramsGenAgent: ParamsGenAgent
  private queryGenAgent: SearchQueryGenAgent
  private companySummaryAgent: CompanySummaryAgent

  constructor(
    @Inject('GPT3') private gpt3: RunnableLike,
    private googleJobsCrawler: GoogleJobsCrawler,
  ) {
    this.paramsGenAgent = new ParamsGenAgent(this.gpt3)
    this.queryGenAgent = new SearchQueryGenAgent(this.gpt3)
    this.companySummaryAgent = new CompanySummaryAgent(this.gpt3)
  }

  async generateParams(jobDescription: string) {
    return this.paramsGenAgent.run(jobDescription)
  }

  async generateQuery(jobDescription: string) {
    return this.queryGenAgent.run(jobDescription)
  }

  async searchWithQuery(query: string, options?: CrawlJobOptions) {
    const jobs = await this.googleJobsCrawler.crawlJobs(query, options)

    return { jobs }
  }
}
