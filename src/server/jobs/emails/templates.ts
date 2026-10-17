import fs from 'fs'
import path from 'path'

export interface EmailAttachment {
  filename: string
  content: Buffer | string
  cid?: string
}

export interface EmailContent {
  subject: string
  html: string
  text: string
  attachments?: EmailAttachment[]
}

let cachedLogo: Buffer | null = null

function getMiraiLogoAttachment(): EmailAttachment | null {
  try {
    if (!cachedLogo) {
      const filePath = path.join(process.cwd(), 'public', 'mirai-logo.png')
      if (fs.existsSync(filePath)) {
        cachedLogo = fs.readFileSync(filePath)
      }
    }
    if (cachedLogo) {
      return {
        filename: 'mirai-logo.png',
        content: cachedLogo,
        cid: 'mirai-logo',
      }
    }
  } catch (err) {
    console.warn('Unable to load mirai-logo.png attachment:', err)
  }
  return null
}

export function waitlistConfirmationTemplate(params: { email: string; role?: string | null }): EmailContent {
  const roleDisplay = params.role
    ? params.role.charAt(0).toUpperCase() + params.role.slice(1).toLowerCase()
    : 'Builder'

  const logoAttachment = getMiraiLogoAttachment()
  const attachments = logoAttachment ? [logoAttachment] : undefined

  return {
    subject: "You're on the waitlist! We'll let you know when we go live 🚀",
    text: `You're on the waitlist!\n\nBuild the future. Together.\n\nWelcome to Mirai, ${roleDisplay}.\n\nYour early access spot is confirmed for ${params.email}. We will let you know as soon as we go live.\n\nMirai brings your startup journey into one thoughtful space — from the first spark of an idea to finding your co-founder and shipping real products.\n\nVisit: https://mymirai.site\n\n— The Mirai Team\nMade for people who make things.`,
    attachments,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to the Mirai Waitlist</title>
</head>
<body style="margin: 0; padding: 0; background-color: #eef6fb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #082638; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #eef6fb; padding: 48px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 590px; background: #ffffff; border: 1px solid #d4e7f3; border-radius: 28px; overflow: hidden; box-shadow: 0 24px 50px -12px rgba(15, 111, 159, 0.14), 0 4px 12px rgba(8, 38, 56, 0.04);">
          
          <!-- Gradient Top Accent Bar (Mirai Cyan -> Ocean Blue -> Violet) -->
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #9fc9dd 0%, #0f6f9f 50%, #6b9fbe 100%); line-height: 6px; font-size: 1px;">&nbsp;</td>
          </tr>

          <!-- Card Body -->
          <tr>
            <td style="padding: 44px 38px 40px 38px;">
              
              <!-- Brand Header with Logo -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center" style="background: #eef6fb; border: 1px solid #d4e7f3; border-radius: 22px; padding: 14px 28px; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 8px 20px rgba(18, 50, 71, 0.06);">
                          <img src="cid:mirai-logo" alt="Mirai Logo" width="120" style="display: block; width: 120px; height: auto; border: 0; object-fit: contain;" />
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 20px;">
                    <span style="display: inline-block; padding: 5px 15px; background: rgba(15, 111, 159, 0.09); border: 1px solid rgba(15, 111, 159, 0.22); border-radius: 999px; color: #0f6f9f; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;">
                      ● Waitlist Confirmed
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Main Heading & Hero Message -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 22px;">
                <tr>
                  <td align="center">
                    <h1 style="margin: 0; font-size: 32px; font-weight: 800; color: #082638; letter-spacing: -0.04em; line-height: 1.18;">
                      Build the <span style="color: #0f6f9f; font-style: italic;">future.</span><br />Together.
                    </h1>
                    <p style="margin: 14px 0 0 0; font-size: 16px; line-height: 1.6; color: #476a82; max-width: 470px;">
                      You&apos;re officially on the list, <strong>${roleDisplay}</strong>. A home for bold ideas, curious builders, and idea-stage founders to turn momentum into something real.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Live Notification Highlight Box -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 28px;">
                <tr>
                  <td style="background: linear-gradient(135deg, #f0f7fc 0%, #e8f3fa 100%); border: 1.5px solid #bfe0f2; border-radius: 20px; padding: 22px 24px; box-shadow: 0 4px 16px rgba(15, 111, 159, 0.06);">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="42" valign="top" style="padding-right: 14px;">
                          <div style="width: 40px; height: 40px; border-radius: 12px; background: #0f6f9f; text-align: center; line-height: 40px; font-size: 18px; color: #ffffff; box-shadow: 0 4px 14px rgba(15, 111, 159, 0.35);">
                            🔔
                          </div>
                        </td>
                        <td valign="top">
                          <p style="margin: 0; font-size: 16px; font-weight: 800; color: #082638;">
                            We will let you know when we go live!
                          </p>
                          <p style="margin: 6px 0 0 0; font-size: 14px; line-height: 1.55; color: #245d78;">
                            Your spot is locked in. We are currently preparing the early access experience for our first cohort of builders. You&apos;ll receive an exclusive invite right in this inbox as soon as early access goes live.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Spot Reservation Details Card -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 22px; background: #fafcfe; border: 1px solid #d8e8f2; border-radius: 18px; padding: 20px 22px;">
                <tr>
                  <td>
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="font-size: 11px; text-transform: uppercase; color: #5b7f95; font-weight: 700; letter-spacing: 0.08em; padding-bottom: 5px;">Spot Reserved For</td>
                        <td align="right" style="font-size: 11px; text-transform: uppercase; color: #5b7f95; font-weight: 700; letter-spacing: 0.08em; padding-bottom: 5px;">Role Track</td>
                      </tr>
                      <tr>
                        <td style="font-size: 15px; font-weight: 700; color: #082638;">${params.email}</td>
                        <td align="right">
                          <span style="display: inline-block; padding: 4px 12px; background: rgba(15, 111, 159, 0.1); border-radius: 999px; font-size: 13px; font-weight: 700; color: #0f6f9f;">
                            ${roleDisplay}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- What to Expect / Feature Highlights -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 32px;">
                <tr>
                  <td style="font-size: 12px; font-weight: 800; color: #245d78; text-transform: uppercase; letter-spacing: 0.12em; padding-bottom: 14px;">
                    Everything you need to move forward
                  </td>
                </tr>
                <tr>
                  <td>
                    <!-- Item 1 -->
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px; background: #fbfdfd; border: 1px solid #e4eff6; border-radius: 14px; padding: 14px 16px;">
                      <tr>
                        <td width="36" valign="top">
                          <div style="width: 32px; height: 32px; border-radius: 10px; background: rgba(15, 111, 159, 0.1); text-align: center; line-height: 32px; font-size: 15px;">
                            🚀
                          </div>
                        </td>
                        <td valign="top" style="padding-left: 10px;">
                          <p style="margin: 0; font-size: 14px; font-weight: 700; color: #082638;">Startup Profiles</p>
                          <p style="margin: 2px 0 0 0; font-size: 13px; line-height: 1.45; color: #476a82;">Turn your early idea into a magnet for the right people, feedback, and momentum.</p>
                        </td>
                      </tr>
                    </table>

                    <!-- Item 2 -->
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px; background: #fbfdfd; border: 1px solid #e4eff6; border-radius: 14px; padding: 14px 16px;">
                      <tr>
                        <td width="36" valign="top">
                          <div style="width: 32px; height: 32px; border-radius: 10px; background: rgba(107, 159, 190, 0.15); text-align: center; line-height: 32px; font-size: 15px;">
                            👥
                          </div>
                        </td>
                        <td valign="top" style="padding-left: 10px;">
                          <p style="margin: 0; font-size: 14px; font-weight: 700; color: #082638;">Co-Founder Match</p>
                          <p style="margin: 2px 0 0 0; font-size: 13px; line-height: 1.45; color: #476a82;">Meet builders whose ambition, skills, and working rhythm fit yours.</p>
                        </td>
                      </tr>
                    </table>

                    <!-- Item 3 -->
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background: #fbfdfd; border: 1px solid #e4eff6; border-radius: 14px; padding: 14px 16px;">
                      <tr>
                        <td width="36" valign="top">
                          <div style="width: 32px; height: 32px; border-radius: 10px; background: rgba(159, 201, 221, 0.2); text-align: center; line-height: 32px; font-size: 15px;">
                            ⚡
                          </div>
                        </td>
                        <td valign="top" style="padding-left: 10px;">
                          <p style="margin: 0; font-size: 14px; font-weight: 700; color: #082638;">Hackathon Hub</p>
                          <p style="margin: 2px 0 0 0; font-size: 13px; line-height: 1.45; color: #476a82;">Discover events, form sharp teams, and ship proof you can show.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 36px;">
                <tr>
                  <td align="center">
                    <a href="https://mymirai.site" target="_blank" style="display: inline-block; background: #007bff; background-image: linear-gradient(135deg, #007bff 0%, #0f6f9f 100%); color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 15px 40px; border-radius: 999px; box-shadow: 0 10px 25px -4px rgba(0, 123, 255, 0.42); letter-spacing: 0.02em; text-align: center;">
                      Explore Mirai &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 38px;">
                <tr>
                  <td style="border-top: 1px solid #e4eff6;">&nbsp;</td>
                </tr>
              </table>

              <!-- Footer -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 8px;">
                <tr>
                  <td align="center" style="font-size: 12px; color: #64748b; line-height: 1.6;">
                    <p style="margin: 0 0 6px 0; font-weight: 600; color: #245d78;">
                      &copy; 2026 Mirai &middot; Made for people who make things.
                    </p>
                    <p style="margin: 0;">
                      You received this email because you registered for early access at <a href="https://mymirai.site" style="color: #0f6f9f; font-weight: 600; text-decoration: none;">mymirai.site</a>.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
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
