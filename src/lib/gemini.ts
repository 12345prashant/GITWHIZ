import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Document } from '@langchain/core/documents';
import 'dotenv/config'; 



const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash'
})

export const aiSummariseCommit = async (diff: string) => {
  // https://github.com/{username}/{repo_name}/commit/{commitHash}.diff
  const response = await model.generateContent([
    `You are an expert programmer, and you are trying to summarize a git diff.
Reminders about the git diff format:
For every file, there are a few metadata lines, like (for example): 
'''
diff --git a/lib/index.js b/lib/index.js
index aadf691..bfef663 100644
--- a/lib/index.js
+++ b/lib/index.js
'''
This means that \`lib/index.js\` was modified in this commit.
Then there is a specifier of the lines that were modified.
A line starting with \`+\` means it was added.
A line starting with \`-\` means that line was deleted.
A line that starts with neither \`+\` nor \`-\` is code given for context and better understanding.
It is not part of the diff.

EXAMPLE SUMMARY COMMENTS:
\`\`\`
* Raised the amount of returned recordings from \`10\` to \`100\` [packages/server/recordings_api.ts], [packages/server/constants.ts]
* Fixed a typo in the GitHub action name [.github/workflows/gpt-commit-summarizer.yml]
* Moved the \`octokit\` initialization to a separate file [src/octokit.ts], [src/index.ts]
* OpenAI API for completions [packages/utils/apis/openai.ts]
* Lowered numeric tolerance for test files
\`\`\`

Most commits will have fewer comments than this examples list.
The last comment includes the file names because there were more than two relevant files in the hypothetical commit. 
Do not include parts of the example in the summary.
It is given only as an example of appropriate comments.

Please summarize the following diff file:

${diff}`
  ])

  return response.response.text();
}

// console.log(await aiSummariseCommit(`diff --git a/app/src/main/java/com/example/patientapp/SendMessage.java b/app/src/main/java/com/example/patientapp/SendMessage.java
//   index 2c28f33..1d0406c 100644
//   --- a/app/src/main/java/com/example/patientapp/SendMessage.java
//   +++ b/app/src/main/java/com/example/patientapp/SendMessage.java
//   @@ -64,7 +64,7 @@ protected void onCreate(Bundle savedInstanceState) {
//            messageList = new ArrayList<>();
//            messageList.add("I need Help");
//            messageList.add("I need Help");
//   -        messageList.add("I need Help");
//   +        messageList.add("DRINK WATER");
//            messageAdapter = new MessageAdapter(this, messageList, this);
//            messageRecyclerView.setAdapter(messageAdapter);
//    `))

export async function summariseCode(doc: Document){
  console.log("getting summary for", doc.metadata.source);
  try{
      const code = doc.pageContent.slice(0,10000); // Limit first 10000 charcters
  const response = await  model.generateContent([
    `You are an intelligent senior software engineer who specialises in onboarding junior software engineers onto projects.
    You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file.
    Here is the code:
    
    ---
    ${code}
    ---
    Give a summary no more than 100 words of the code above. 
    `
  ]);

  return response.response.text()
  } catch(error){
      return ''
  }
  

}

export async function generateEmbedding(summary: string){
  const model = genAI.getGenerativeModel({
    model: "text-embedding-004"
  })
  const result = await model.embedContent(summary)
  const embedding = result.embedding
  return embedding.values
}

// console.log(await generateEmbedding("hello world"))


