import { config } from 'dotenv';
config();

import '@/ai/flows/generate-new-content-from-prompt.ts';
import '@/ai/flows/refine-selected-text-flow.ts';
import '@/ai/flows/explain-or-fix-selected-code.ts';
import '@/ai/flows/format-content-flow.ts';
import '@/ai/flows/diagnose-code-flow.ts'; // add this line