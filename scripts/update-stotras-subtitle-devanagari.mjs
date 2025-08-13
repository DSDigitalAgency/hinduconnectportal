import { processLanguage } from './subtitle-utils.mjs';

async function main() {
  await processLanguage({ sourceLang: 'Devanagari' });
}

main().catch((err) => { console.error(err); process.exit(1); });


