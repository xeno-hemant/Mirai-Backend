export interface EmailContent {
  subject: string
  html: string
  text: string
}

export function waitlistConfirmationTemplate(params: { email: string; role?: string | null }): EmailContent {
  const roleText = params.role ? ` as a ${params.role}` : ''
  return {
    subject: "You're on the list — Welcome to Mirai",
    text: `You're on the list.\n\nWelcome to Mirai${roleText}. We are bringing together bold ideas, curious builders, and idea-stage founders to turn momentum into something real.\n\nWe will save your spot and reach out as soon as early access begins.\n\n— The Mirai Team`,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0f19; color: #f0f6fc; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: #131a29; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 36px;">
    <h1 style="font-size: 28px; margin-bottom: 16px; color: #ffffff;">Build the future. Together.</h1>
    <p style="font-size: 16px; line-height: 1.6; color: rgba(240,246,252,0.7);">You're on the list${roleText}.</p>
    <p style="font-size: 16px; line-height: 1.6; color: rgba(240,246,252,0.7);">Mirai is built for people who make things — bringing your startup journey into one thoughtful space, from the first spark of an idea to the moment you find your co-founder.</p>
    <div style="margin: 32px 0; padding: 16px; background: rgba(0, 144, 255, 0.1); border-left: 3px solid #0090ff; border-radius: 4px;">
      <p style="margin: 0; font-size: 14px; color: #0090ff;">Spot reserved for: <strong>${params.email}</strong></p>
    </div>
    <p style="font-size: 14px; color: rgba(240,246,252,0.4); margin-top: 32px; border-top: 1px solid rgba(255,255,255,0.1); pt: 20px;">
      © 2026 Mirai · Made for people who make things.
    </p>
  </div>
</body>
</html>`,
  }
}

export function hackathonRegistrationTemplate(params: { hackathonTitle: string; userName: string }): EmailContent {
  return {
    subject: `Registered: ${params.hackathonTitle} on Mirai`,
    text: `Hi ${params.userName},\n\nYou are registered for ${params.hackathonTitle}. Find your challenge, form a sharp team, and make the weekend count.\n\n— The Mirai Team`,
    html: `<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; background-color: #0b0f19; color: #f0f6fc; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: #131a29; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 36px;">
    <h2 style="color: #ffffff;">You're in for ${params.hackathonTitle}</h2>
    <p style="color: rgba(240,246,252,0.7); line-height: 1.6;">Hi ${params.userName}, your registration has been confirmed. Head to the hackathon hub to browse tracks, join a team, or post your project idea.</p>
  </div>
</body>
</html>`,
  }
}

export function matchCreatedTemplate(params: { userName: string; matchedWithName: string }): EmailContent {
  return {
    subject: `It's a Match! You and ${params.matchedWithName} connected on Mirai`,
    text: `Great news ${params.userName}!\n\nYou and ${params.matchedWithName} have mutually connected on Mirai.\n\nLog in to your Mirai dashboard to start collaborating.\n\n— The Mirai Team`,
    html: `<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; background-color: #0b0f19; color: #f0f6fc; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: #131a29; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 36px;">
    <h2 style="color: #ffffff;">New Co-Founder Match!</h2>
    <p style="color: rgba(240,246,252,0.7); line-height: 1.6;">Hi ${params.userName}, both you and <strong>${params.matchedWithName}</strong> indicated you'd like to collaborate.</p>
    <p style="color: rgba(240,246,252,0.7); line-height: 1.6;">Check your matches tab on Mirai to view shared skills, interests, and kick off the conversation.</p>
  </div>
</body>
</html>`,
  }
}
