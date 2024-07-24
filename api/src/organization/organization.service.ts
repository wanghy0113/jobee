import { PrismaService } from '@/prisma.service'
import { Injectable } from '@nestjs/common'
import * as pgvector from 'pgvector'
import * as fs from 'fs'
import * as csvParser from 'csv-parser'
import ollama from 'ollama'
import * as similarity from 'similarity'

@Injectable()
export class OrganizationService {
  constructor(private prisma: PrismaService) {}

  async populateOrganizationData(splitNum: number) {
    const filePath = `/Users/hongyiwang/jobee/api/src/organization/organization_data/split_${splitNum}.csv`
    let rows = 0
    let count = 0
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', async (data) => {
        rows++
        try {
          await this.prisma.organization.create({
            data: {
              id: data.uuid,
              name: data.name,
              type: data.type,
              primary_role: data.primary_role,
              cb_url: data.cb_url,
              domain: data.domain,
              homepage_url: data.homepage_url,
              logo_url: data.logo_url,
              facebook_url: data.facebook_url,
              twitter_url: data.twitter_url,
              linkedin_url: data.linkedin_url,
              combined_stock_symbols: data.combined_stock_symbols,
              city: data.city,
              region: data.region,
              country_code: data.country_code,
              short_description: data.short_description,
            },
          })
          count++
          process.stdout.write(`\rFound ${rows}, populated ${count}`)
        } catch (error) {}
      })
      .on('end', () => {
        console.log(`Processed ${rows} rows. Created ${count} organizations.`)
      })

    console.log(`Processed ${rows} rows. Created ${count} organizations.`)
  }

  async generateAndInsertShortDescriptionEmbedding(countryCode?: string) {
    const rows: any[] = countryCode
      ? await this.prisma.$queryRaw`
    SELECT id, short_description
    FROM public."Organization" 
    WHERE country_code = ${countryCode} AND short_description_embedding IS NULL
    LIMIT 200000`
      : await this.prisma.$queryRaw`
    SELECT id, short_description
    FROM public."Organization" 
    WHERE short_description_embedding IS NULL AND name ILIKE '%meta%'
    LIMIT 200000`
    console.log(`Found ${rows.length} organizations.`)
    const processRow = async (row: any) => {
      const embeddings = await ollama.embeddings({
        model: 'nomic-embed-text',
        prompt: row.short_description,
      })

      await this.prisma
        .$executeRaw`UPDATE public."Organization" SET short_description_embedding = ${pgvector.toSql(embeddings.embedding)}::vector WHERE id = ${row.id}`
    }

    let promises = []
    let count = 0
    for (const row of rows) {
      const promise = processRow(row)
      promises.push(promise)
      count++
      if (count % 100 === 0) {
        // console.log(
        //   `${count}/${rows.length} embeddings generated. ${(count / rows.length) * 100}%`,
        // )
        process.stdout.write(
          `\r${count}/${rows.length} embeddings generated. ${(count / rows.length) * 100}%.`,
        )
      }
      if (promises.length >= 50) {
        await Promise.allSettled(promises)
        promises = []
      }
    }

    // Await the remaining promises
    await Promise.all(promises)
  }

  async searchOrganizations(
    name: string,
    location?: string,
    domain?: string,
    keywords?: string,
    limit: number = 5,
    similarityThreshold: number = 0.5,
  ) {
    name = name.replaceAll("'", "''")
    if (domain && domain.startsWith('www.')) {
      domain = domain.replace('www.', '')
    }
    const selectClause = `SELECT id, name, city, region, short_description, domain, homepage_url, logo_url, facebook_url, twitter_url, linkedin_url, similarity(name, '${name}') AS n_sim`

    let whereClause = `WHERE similarity(name, '${name}') > ${similarityThreshold}`
    if (domain) {
      whereClause = `WHERE domain = '${domain}'`
    }

    let orderClause = `ORDER BY n_sim DESC`
    if (keywords) {
      const keywordsEmbedding = await ollama.embeddings({
        model: 'nomic-embed-text',
        prompt: keywords,
      })
      orderClause = `ORDER BY n_sim DESC, short_description_embedding <-> ${keywordsEmbedding.embedding}::vector`
    }

    const query = `
      ${selectClause}
      FROM public."Organization"
      ${whereClause}
      ${orderClause}
      LIMIT ${limit}`

    const items: any[] = await this.prisma.$queryRawUnsafe(query)
    const sortedItems = items
      .sort((a, b) => {
        return similarity(name, b.name) - similarity(name, a.name)
      })
      .sort((a, b) => {
        return (
          similarity(location, `${b.city}, ${b.region}, ${b.country}`) -
          similarity(location, `${a.city}, ${a.region}, ${a.country}`)
        )
      })

    return sortedItems.map((item) => {
      return {
        id: item.id,
        n_sim: item.n_sim,
        name: item.name,
        city: item.city,
        region: item.region,
        country_code: item.country_code,
        short_description: item.short_description,
        domain: item.domain,
        homepage_url: item.homepage_url,
        logo_url: item.logo_url,
        facebook_url: item.facebook_url,
        twitter_url: item.twitter_url,
        linkedin_url: item.linkedin_url,
      }
    })
  }

  async removeCompanySuffix(suffix: string) {
    const organizations = await this.prisma.organization.findMany({
      where: {
        name: {
          endsWith: ` ${suffix}`,
          mode: 'insensitive',
        },
      },
    })

    for (const organization of organizations) {
      const newName = organization.name.replace(` ${suffix}`, '')
      await this.prisma.organization.update({
        where: {
          id: organization.id,
        },
        data: {
          name: newName,
        },
      })
    }
  }
}
