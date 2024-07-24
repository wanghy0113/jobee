export type BrowserType = 'chromium' | 'firefox' | 'webkit'

export interface CrawlParams {
  keywords: string[]
  location: string
  traceBackDays?: number
}

export interface CrawlResult {
  title: string
  company: {
    name: string
    shortDescription?: string
    ggCompanyLogoUrl?: string
    ggCompanyUrl?: string
    cbCompanyLogoUrl?: string
    cbCompanyUrl?: string
    facebookUrl?: string
    linkedinUrl?: string
    twitterUrl?: string
  }
  location: string
  googleJobId: string
  labels: {
    posted?: string
    type?: string
    salary?: string
    qualification?: string
    otherLabels?: string[]
  }
  via?: string
  jobDescription?: string
  applyEntries: {
    url: string
    platform: string
  }[]
  skills: string[]
  jobHighlights: {
    [key: string]: string[]
  }
}
