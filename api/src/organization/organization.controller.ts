import { Controller, Get, Param, Post, Query, Body } from '@nestjs/common'
import { OrganizationService } from './organization.service'

@Controller('organization')
export class OrganizationController {
  constructor(private organizationService: OrganizationService) {}

  @Post('populate/:splitNum')
  async populateAll(@Param('splitNum') splitNum: number) {
    return this.organizationService.populateOrganizationData(splitNum)
  }

  @Post('generate-embedding/all')
  async generateEmbeddingAll(@Body('country_code') countryCode: string) {
    return this.organizationService.generateAndInsertShortDescriptionEmbedding(
      countryCode,
    )
  }

  @Get('search')
  async searchOrganization(
    @Query('name') name: string,
    @Query('location') location: string,
    @Query('domain') domain: string,
    @Query('keywords') keywords: string,
  ) {
    return this.organizationService.searchOrganizations(
      name,
      location,
      domain,
      keywords,
      5,
      0.7,
    )
  }

  @Post('remove-company-suffix')
  async removeCompanySuffix(@Body('suffix') suffix: string) {
    return this.organizationService.removeCompanySuffix(suffix)
  }
}
