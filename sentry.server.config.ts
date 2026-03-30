import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: 1.0,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  
  // Filter sensitive data
  beforeSend(event, hint) {
    // Remove sensitive data from error reports
    if (event.request) {
      delete event.request.cookies
      
      // Remove authorization headers
      if (event.request.headers) {
        delete event.request.headers['authorization']
        delete event.request.headers['cookie']
      }
    }
    
    // Remove sensitive context data
    if (event.contexts) {
      delete event.contexts.user?.ip_address
    }
    
    return event
  },
})
