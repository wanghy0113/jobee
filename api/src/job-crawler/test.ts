// import { GoogleJobsCrawler } from './google'

// const test = async () => {
//   const crawler = new GoogleJobsCrawler()

//   const javaJobs = await crawler.crawlJobs(
//     'software+engineer+java+vancouver+bc',
//     {
//       offset: 0,
//       limit: 500,
//     },
//   )

//   console.log(`found ${javaJobs.length} jobs for java`)
//   const javaJobsWithJava = javaJobs.filter(
//     (job) =>
//       job.jobDescription.toLowerCase().includes('java') ||
//       job.title.toLowerCase().includes('java'),
//   )
//   console.log(`found ${javaJobsWithJava.length} jobs for java with java`)

//   const cppJobs = await crawler.crawlJobs(
//     'software+engineer+c%2B%2B+vancouver+bc',
//     {
//       offset: 0,
//       limit: 500,
//     },
//   )

//   console.log(`found ${cppJobs.length} jobs for cpp`)
//   const cppJobsWithCpp = cppJobs.filter(
//     (job) =>
//       job.jobDescription.toLowerCase().includes('c++') ||
//       job.title.toLowerCase().includes('c++'),
//   )
//   // const cppjobsWithoutCpp = cppJobs.filter(
//   //   (job) =>
//   //     !job.jobDescription.toLowerCase().includes('c++') &&
//   //     !job.title.toLowerCase().includes('c++'),
//   // )
//   // console.log(
//   //   `found ${cppjobsWithoutCpp.length} jobs for cpp without cpp ${cppjobsWithoutCpp}`,
//   // )
//   console.log(`found ${cppJobsWithCpp.length} jobs for cpp with cpp`)

//   const javaOrCppJobs = await crawler.crawlJobs(
//     'software+engineer+"java+OR+c%2B%2B"+vancouver+bc',
//     {
//       offset: 0,
//       limit: 500,
//     },
//   )

//   console.log(`found ${javaOrCppJobs.length} jobs for javaOrCppJobs`)
//   const javaOrCppJobsWithJava = javaOrCppJobs.filter(
//     (job) =>
//       job.jobDescription.toLowerCase().includes('java') ||
//       job.title.toLowerCase().includes('java'),
//   )
//   console.log(
//     `found ${javaOrCppJobsWithJava.length} jobs for javaOrCppJobs with java`,
//   )
//   const javaOrCppJobsWithCpp = javaOrCppJobs.filter(
//     (job) =>
//       job.jobDescription.toLowerCase().includes('c++') ||
//       job.title.toLowerCase().includes('c++'),
//   )
//   console.log(
//     `found ${javaOrCppJobsWithCpp.length} jobs for javaOrCppJobs with cpp`,
//   )
//   const javaOrCppJobsWithoutJavaAndCpp = javaOrCppJobs.filter(
//     (job) =>
//       !job.jobDescription.toLowerCase().includes('java') &&
//       !job.title.toLowerCase().includes('java') &&
//       !job.jobDescription.toLowerCase().includes('c++') &&
//       !job.title.toLowerCase().includes('c++'),
//   )
//   console.log(
//     `found ${javaOrCppJobsWithoutJavaAndCpp.length} jobs for javaOrCppJobs without java and cpp`,
//   )

//   const cppOrJavaJobs = await crawler.crawlJobs(
//     'software+engineer+"c%2B%2B+OR+java"+vancouver+bc',
//     {
//       offset: 0,
//       limit: 500,
//     },
//   )

//   console.log(`found ${cppOrJavaJobs.length} jobs for cppOrJavaJobs`)

//   const cppOrJavaJobsWithCpp = cppOrJavaJobs.filter(
//     (job) =>
//       job.jobDescription.toLowerCase().includes('c++') ||
//       job.title.toLowerCase().includes('c++'),
//   )
//   console.log(
//     `found ${cppOrJavaJobsWithCpp.length} jobs for cppOrJavaJobs with cpp`,
//   )
//   const cppOrJavaJobsWithJava = cppOrJavaJobs.filter(
//     (job) =>
//       job.jobDescription.toLowerCase().includes('java') ||
//       job.title.toLowerCase().includes('java'),
//   )
//   console.log(
//     `found ${cppOrJavaJobsWithJava.length} jobs for cppOrJavaJobs with java`,
//   )
// }

// test()
