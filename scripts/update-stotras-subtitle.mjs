// New implementation: skip documents that already have a non-empty subtitle
import { processLanguage } from './subtitle-utils.mjs';

async function main() {
  await processLanguage({ sourceLang: 'Telugu' });
}

main().catch((err) => { console.error(err); process.exit(1); });


