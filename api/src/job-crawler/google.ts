import * as cheerio from 'cheerio'
import { Injectable, Logger } from '@nestjs/common'
import { CrawlParams, CrawlResult } from './types'
import { findKeywordsForJob } from './keywords'
import { PrismaService } from '@/prisma.service'
import { OrganizationService } from '@/organization/organization.service'

const GOOGLE_URL = 'https://www.google.com/search'

export interface CrawlJobOptions {
  offset?: number
  limit?: number
}

@Injectable()
export class GoogleJobsCrawler {
  constructor(
    private prisma: PrismaService,
    private organizationService: OrganizationService,
  ) {}

  generateSearchQuery(params: CrawlParams): string {
    // return `(${params.keywords.join(' OR ')}) ${params.location}`
    return `${params.keywords} ${params.location}`
  }

  async getCompanyData(
    companyName: string,
    location?: string,
    domain?: string,
  ) {
    const nameWords = companyName.split(' ')
    if (
      nameWords.length > 1 &&
      (nameWords[nameWords.length - 1].toLowerCase().includes('inc') ||
        nameWords[nameWords.length - 1].toLowerCase().includes('llc') ||
        nameWords[nameWords.length - 1].toLowerCase().includes('corp') ||
        nameWords[nameWords.length - 1].toLowerCase().includes('career'))
    ) {
      nameWords.pop()
    }
    const companyData = await this.organizationService.searchOrganizations(
      nameWords.slice(0, 2).join(' '),
      location,
      domain,
    )
    if (companyData.length) {
      return companyData[0]
    }

    return null
  }

  queryEncode(query: string) {
    return encodeURIComponent(query.replace(/ /g, '+'))
  }

  async crawlJobs(
    query: string,
    options: CrawlJobOptions = {},
    traceBackDays?: number,
  ): Promise<CrawlResult[]> {
    Logger.debug('Crawling jobs on Google')

    const queryParams: Record<string, string> = {
      rciv: 'jb', // required to get job listings
      q: query, // query string
      nfpr: '0', // Set to 0 to avoid filtering or autocorrections on the query
      asearch: 'jb_list',
      async: '_id:VoQFxe,_pms:hts,_fmt:pc',
      start: '0', // start index of the job listings,
      cs: '0', // client side search
    }
    if (traceBackDays) {
      queryParams['tbs'] = `qdr:d${traceBackDays}`
    }

    let startIndex = options.offset ?? 0
    const jobs: CrawlResult[] = []
    while (true) {
      queryParams.start = startIndex.toString()
      const url = `${GOOGLE_URL}?${Object.entries(queryParams)
        .map(([k, v]) => `${k}=${v}`)
        .join('&')}`
      Logger.debug(`Navigating to ${url}`)
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        },
      })

      if (!response.ok) {
        Logger.warn(`Failed to fetch ${url}`)
        break
      }

      const results = await this.processJobSearchResponse(response)
      if (!results.length) {
        break
      }
      if (options.limit && jobs.length + results.length >= options.limit) {
        results.splice(options.limit - jobs.length)
        jobs.push(...results)
        break
      }
      jobs.push(...results)
      startIndex += results.length
    }

    Logger.debug(`Found ${jobs.length} jobs`)
    return jobs
  }

  async crawlJobsWithCrawlParams(
    params: CrawlParams,
    options: CrawlJobOptions = {},
  ): Promise<CrawlResult[]> {
    Logger.debug('Crawling jobs on Google')

    return this.crawlJobs(
      this.generateSearchQuery(params),
      options,
      params.traceBackDays,
    )
  }

  decodeUnicodeEscapes(str: string) {
    // This regex matches \x followed by exactly two hexadecimal digits
    return str.replace(/\\x([0-9A-Fa-f]{2})/g, (_, code) =>
      String.fromCharCode(parseInt(code, 16)),
    )
  }

  async processJobSearchResponse(response: Response): Promise<CrawlResult[]> {
    const JOB_TITLE_SELECTOR = 'div[class*="BjJfJf"]'
    const COMPANY_SELECTOR = 'div[class*="vNEEBe"]'
    const LOCATION_AND_VIA_SELECTOR = 'div[class*="Qk80Jf"]'
    const APPLY_ENTRY_SELECTOR = 'a[class*="pMhGee Co68jc j0vryd"]'
    const APPLY_PLATFORM_SELECTOR = 'div[class*="iSJ1kb va9cAf"] > span'
    const JOB_ID_CONTAINER_SELECTOR = 'div[class*="KGjGe"]'
    const JOB_LABELS_SELECTOR = 'span[class*="LL4CDc"]'
    const JOB_DECRIPTION_SELECTOR = 'span[class*="HBvzbc"]'
    const JOB_DESCRIPTION_REMOVE_SELECTOR = 'span[class*="UiMktc"]'
    const JOB_HIGHLIGHTS_SELECTOR = 'div[class*="JxVj3d"]'
    const JOB_HIGHLIGHT_KEY = 'div[class*="iflMsb"]'
    const JOB_HIGHLIGHT_ITEMS = 'div[class*="nDgy9d"]'
    const COMPANY_LOGO_SELECTOR = 'g-img[class*="eZUcuf"] > img'
    const COMPANY_URL_SELECTOR = 'a[class*="F8xMkc"]'

    const text = await response.text()
    const domStart = text.indexOf('</style>') + '</style>'.length
    const domEnd = text.lastIndexOf('</div>')
    const dom = text.substring(domStart, domEnd)
    const $ = cheerio.load(dom)
    const jobList = $('li[class*="iFjolb"]')

    const results: CrawlResult[] = []
    for (const job of jobList) {
      const title = $(job).find(JOB_TITLE_SELECTOR).text().trim()
      const company = $(job).find(COMPANY_SELECTOR).text().trim()
      if (!title || !company) {
        continue
      }
      const companyLogoSrc =
        $(job).find(COMPANY_LOGO_SELECTOR).attr('src') || ''
      const companyUrl = $(job).find(COMPANY_URL_SELECTOR).attr('href') || ''

      const location = $(job)
        .find(LOCATION_AND_VIA_SELECTOR)
        .first()
        .text()
        .trim()

      const via = $(job).find(LOCATION_AND_VIA_SELECTOR).last().text().trim()
      const applyEntries = $(job).find(APPLY_ENTRY_SELECTOR)
      const googleJobId = $(job)
        .find(JOB_ID_CONTAINER_SELECTOR)
        .attr('data-encoded-doc-id')

      const labels: CrawlResult['labels'] = {
        otherLabels: [],
      }
      for (const label of $(job).find(JOB_LABELS_SELECTOR)) {
        const text = $(label).text().trim()
        if (!label.attribs['aria-label']) {
          labels.otherLabels.includes(text) || labels.otherLabels.push(text)
        } else if (label.attribs['aria-label'].includes('Posted')) {
          labels.posted = text
        } else if (label.attribs['aria-label'].includes('Employment Type')) {
          labels.type = text
        } else if (label.attribs['aria-label'].includes('Salary')) {
          labels.salary = text
        } else if (label.attribs['aria-label'].includes('Qualification')) {
          labels.qualification = text
        } else {
          labels.otherLabels.includes(text) || labels.otherLabels.push(text)
        }
      }

      $(job).find(JOB_DESCRIPTION_REMOVE_SELECTOR).remove()
      const jobDescription = $(job)
        .find(JOB_DECRIPTION_SELECTOR)
        .first()
        .text()
        .trim()

      const companyDomain = companyUrl ? new URL(companyUrl).hostname : ''
      const companyData = await this.getCompanyData(
        company,
        location,
        companyDomain,
      )

      const jobApplyEntries: { url: string; platform: string }[] = []
      for (const applyEntry of applyEntries) {
        const applyUrl = $(applyEntry).attr('href')
        const applyPlatform = $(applyEntry).find(APPLY_PLATFORM_SELECTOR).text()
        jobApplyEntries.push({ url: applyUrl, platform: applyPlatform })
      }

      const jobHighlights: { [key: string]: string[] } = {}
      for (const highlight of $(job).find(JOB_HIGHLIGHTS_SELECTOR)) {
        const highlightKey = $(highlight).find(JOB_HIGHLIGHT_KEY).text()
        const highlightItems = $(highlight).find(JOB_HIGHLIGHT_ITEMS)
        if (!jobHighlights[highlightKey]) {
          jobHighlights[highlightKey] = []
        }

        for (const item of highlightItems) {
          const text = $(item).text()
          if (!jobHighlights[highlightKey].includes(text)) {
            jobHighlights[highlightKey].push(text)
          }
        }
      }

      const skills = findKeywordsForJob(title, jobDescription)

      results.push({
        title,
        company: {
          name: company,
          shortDescription: companyData?.short_description,
          ggCompanyLogoUrl: companyLogoSrc,
          ggCompanyUrl: companyUrl,
          cbCompanyLogoUrl: companyData?.logo_url,
          cbCompanyUrl: companyData?.homepage_url,
          facebookUrl: companyData?.facebook_url,
          linkedinUrl: companyData?.linkedin_url,
          twitterUrl: companyData?.twitter_url,
        },
        location,
        via,
        applyEntries: jobApplyEntries,
        googleJobId,
        jobDescription,
        labels,
        jobHighlights,
        skills,
      })
    }

    return results
  }
}
