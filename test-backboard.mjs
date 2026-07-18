import { BackboardClient } from 'backboard-sdk';

const client = new BackboardClient({
  apiKey: "espr_2324iJK_Fv-mwdJip8qZ3_CQ3XIwlPmUTj8YHEHf2OQ"
});

async function run() {
  try {
    const resp = await client.sendMessage({
      content: 'say "pong"',
      llm_provider: 'openai',
      model_name: 'gpt-4o-mini'
    });
    console.log(resp.content);
  } catch(e) {
    console.error(e);
  }
}
run();
