import { processLanguage } from './subtitle-utils.mjs';

async function main() {
  await processLanguage({ sourceLang: 'Malayalam' });
}

main().catch((err) => { console.error(err); process.exit(1); });


