import { Controller, Get, Query } from '@nestjs/common'
import { GeoService } from './geo.service'

@Controller('geo')
export class GeoController {
  constructor(private geoService: GeoService) {}

  @Get('auto-complete')
  async autoComplete(
    @Query('query') query: string,
    @Query('country') country?: string,
  ) {
    return this.geoService.autoComplete(query, country)
  }
}
