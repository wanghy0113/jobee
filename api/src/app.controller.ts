import { Body, Controller, Post } from '@nestjs/common'
import { AppService, SearchByJobDescriptionResult } from './app.service'
import { ParamsGenAgentResult } from './agents/params_gen/agent'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/search/gen-params')
  generateParams(
    @Body() body: { jobDescription: string },
  ): Promise<ParamsGenAgentResult> {
    const params = this.appService.generateParams(body.jobDescription)
    console.log(params)
    return params
  }

  @Post('/search/gen-query')
  generateQuery(@Body() body: { jobDescription: string }): Promise<string> {
    const query = this.appService.generateQuery(body.jobDescription)
    console.log(query)
    return query
  }

  @Post('/search-with-query')
  searchWithQuery(
    @Body()
    {
      query,
      limit,
      offset,
    }: {
      query: string
      limit?: number
      offset?: number
    },
  ): Promise<SearchByJobDescriptionResult> {
    return this.appService.searchWithQuery(query, {
      limit,
      offset,
    })
  }
}
