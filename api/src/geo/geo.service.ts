import { PrismaService } from '@/prisma.service'
import { Injectable } from '@nestjs/common'
import { usStates, caProvinces } from './abbreviation'

@Injectable()
export class GeoService {
  constructor(private prisma: PrismaService) {}

  getStateName(country: string, state: string) {
    if (country === 'US') {
      return usStates[state] || state
    } else if (country === 'CA') {
      return caProvinces[state] || state
    }
    return state
  }

  async autoComplete(query: string, country?: string) {
    const results = await this.prisma.city.findMany({
      where: {
        name: {
          startsWith: query,
          mode: 'insensitive',
        },
        pop: {
          gte: 50000,
        },
        country,
      },
      orderBy: {
        pop: 'desc',
      },
      take: 5,
    })

    return results.map((r) => ({
      name: r.name,
      country: r.country,
      state: this.getStateName(r.country, r.admin1),
    }))
  }
}
