// Fallback for deployment events that are skipped or delayed.
// Uses exactly the same immutable one-time run lock as the deploy event.
import {runFullProduction} from './dispatch-full-on-deploy.mjs';
export default async function(){
  await runFullProduction();
}
export const config={schedule:'*/10 * * * *'};
