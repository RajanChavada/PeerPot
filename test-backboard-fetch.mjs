const apiKey = "espr_2324iJK_Fv-mwdJip8qZ3_CQ3XIwlPmUTj8YHEHf2OQ";
async function run() {
  const res = await fetch("https://app.backboard.io/api/threads/messages", {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      content: 'say "pong"',
      llm_provider: 'openai',
      model_name: 'gpt-4o-mini'
    })
  });
  console.log(res.status, await res.text());
}
run();
