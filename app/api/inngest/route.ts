import { serve } from 'inngest/next'
import { inngest } from '@/src/server/jobs/client'
import { inngestFunctions } from '@/src/server/jobs/functions'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: inngestFunctions,
})
