import { GithubRepoLoader} from '@langchain/community/document_loaders/web/github'
import type { Document } from '@langchain/core/documents'
import { generateEmbedding, summariseCode } from './gemini'
import { db } from '@/server/db'

export const loadGithubRepo = async (githubUrl: string, githubToken?: string) =>{
    const loader = new GithubRepoLoader(githubUrl,{
        accessToken: githubToken || '',
        branch: 'main',
        ignoreFiles: ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb'],
        recursive: true,
        unknown: 'warn',
        maxConcurrency: 5
    })

    const docs = await loader.load()
    return docs
}


// DOCS is basically this (see below) , it is a array of Document , each document reperesent a file with its source code, path 

// Document {
//     pageContent: '#Wed Feb 19 23:03:56 IST 2025\n' +
//       'distributionBase=GRADLE_USER_HOME\n' +
//       'distributionPath=wrapper/dists\n' +
//       'distributionUrl=https\\://services.gradle.org/distributions/gradle-8.2-bin.zip\n' +
//       'zipStoreBase=GRADLE_USER_HOME\n' +
//       'zipStorePath=wrapper/dists\n',
//     metadata: {
//       source: 'gradle/wrapper/gradle-wrapper.properties',
//       repository: 'https://github.com/12345prashant/patient-app',
//       branch: 'main'
//     },
//     id: undefined
//   }

// console.log(await loadGithubRepo('https://github.com/12345prashant/patient-app'))

export const indexGithubRepo = async (projectId: string, githubUrl: string, githubToken?: string)=>{
    const docs = await loadGithubRepo(githubUrl, githubToken);
    const allEmbeddings = await generateEmbeddings(docs)
    await Promise.allSettled(allEmbeddings.map(async (embedding, index)=>{
        console.log(`Processing ${index} of ${allEmbeddings.length}`)
        if(!embedding) return

        const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
            data: {
                summary: embedding.summary,
                sourceCode: embedding.sourceCode,
                fileName: embedding.fileName,
                projectId,
            }
        })
        await db.$executeRaw`
        UPDATE "SourceCodeEmbedding"
        SET "summaryEmbedding" = ${embedding.embedding}::vector
        WHERE "id" = ${sourceCodeEmbedding.id}
        `
    }))
}

const generateEmbeddings = async(docs: Document[])=>{
    return await Promise.all(docs.map(async doc=>{
        const summary = await summariseCode(doc)
        const embedding = await generateEmbedding(summary)
        return {
            summary,
            embedding,
            sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
            fileName: doc.metadata.source,
        }
    }))
}