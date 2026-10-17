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
    text: `You're on the waitlist!\n\nWelcome to Mirai, ${roleDisplay}.\n\nYour spot is reserved (${params.email}). We are building something extraordinary for founders and builders to turn ideas into real momentum.\n\nWe will let you know as soon as we go live and early access begins.\n\n— The Mirai Team\nhttps://mymirai.site`,
    attachments,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to the Mirai Waitlist</title>
</head>
<body style="margin: 0; padding: 0; background-color: #070a13; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #f1f5f9; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #070a13; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background: #0f172a; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
          
          <!-- Gradient Top Accent Bar -->
          <tr>
            <td style="height: 5px; background: linear-gradient(90deg, #7b61ff 0%, #0090ff 50%, #00f5c4 100%); line-height: 5px; font-size: 1px;">&nbsp;</td>
          </tr>

          <!-- Content Padding -->
          <tr>
            <td style="padding: 40px 36px 36px 36px;">
              
              <!-- Brand Header with Logo -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; padding: 12px; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; box-shadow: 0 10px 25px -5px rgba(0, 144, 255, 0.2);">
                      <img src="cid:mirai-logo" alt="Mirai Logo" width="68" height="68" style="display: block; border-radius: 14px; width: 68px; height: auto;" />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 20px;">
                    <span style="display: inline-block; padding: 5px 14px; background: rgba(0, 144, 255, 0.12); border: 1px solid rgba(0, 144, 255, 0.3); border-radius: 9999px; color: #38bdf8; font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;">
                      ● Waitlist Confirmed
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Main Heading & Hero Message -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 24px;">
                <tr>
                  <td align="center">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.03em; line-height: 1.25;">
                      You&apos;re on the waitlist! 🚀
                    </h1>
                    <p style="margin: 14px 0 0 0; font-size: 16px; line-height: 1.6; color: #94a3b8; max-width: 460px;">
                      Thank you for joining. We are crafting a home where bold ideas, curious builders, and idea-stage founders turn sparks into reality.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Live Notification Alert Box -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 28px;">
                <tr>
                  <td style="background: linear-gradient(135deg, rgba(0, 144, 255, 0.08) 0%, rgba(123, 97, 255, 0.08) 100%); border: 1px solid rgba(0, 144, 255, 0.25); border-radius: 16px; padding: 20px 22px;">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="36" valign="top" style="padding-right: 12px;">
                          <div style="width: 32px; height: 32px; border-radius: 50%; background: #0090ff; text-align: center; line-height: 32px; font-size: 16px;">
                            🔔
                          </div>
                        </td>
                        <td valign="top">
                          <p style="margin: 0; font-size: 15px; font-weight: 700; color: #ffffff;">
                            We will let you know when we go live!
                          </p>
                          <p style="margin: 6px 0 0 0; font-size: 13px; line-height: 1.55; color: #cbd5e1;">
                            Your spot is secured. We are currently rolling out early invites to our first cohort of builders. You&apos;ll get an exclusive notification as soon as early access doors open.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Spot Reservation Summary Card -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 24px; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 14px; padding: 18px 20px;">
                <tr>
                  <td>
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; padding-bottom: 4px;">Spot Reserved For</td>
                        <td align="right" style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; padding-bottom: 4px;">Role Track</td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; font-weight: 600; color: #e2e8f0;">${params.email}</td>
                        <td align="right" style="font-size: 14px; font-weight: 600; color: #38bdf8;">${roleDisplay}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- What to Expect / Feature Highlights -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 32px;">
                <tr>
                  <td style="font-size: 13px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; padding-bottom: 14px;">
                    What&apos;s coming in Mirai
                  </td>
                </tr>
                <tr>
                  <td>
                    <!-- Item 1 -->
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
                      <tr>
                        <td width="28" valign="top" style="font-size: 15px; line-height: 20px;">⚡</td>
                        <td valign="top" style="font-size: 14px; line-height: 1.5; color: #cbd5e1;">
                          <strong style="color: #ffffff;">Build in Public:</strong> Create your startup profile and attract early feedback, momentum, and supporters.
                        </td>
                      </tr>
                    </table>
                    <!-- Item 2 -->
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
                      <tr>
                        <td width="28" valign="top" style="font-size: 15px; line-height: 20px;">🤝</td>
                        <td valign="top" style="font-size: 14px; line-height: 1.5; color: #cbd5e1;">
                          <strong style="color: #ffffff;">Co-Founder Match:</strong> Connect with builders whose ambition, rhythm, and skills complement yours.
                        </td>
                      </tr>
                    </table>
                    <!-- Item 3 -->
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="28" valign="top" style="font-size: 15px; line-height: 20px;">🏆</td>
                        <td valign="top" style="font-size: 14px; line-height: 1.5; color: #cbd5e1;">
                          <strong style="color: #ffffff;">Hackathons & Sprints:</strong> Discover upcoming events, assemble dream teams, and ship proof you can show.
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
                    <a href="https://mymirai.site" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #0090ff 0%, #7b61ff 100%); color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 34px; border-radius: 9999px; box-shadow: 0 10px 25px -5px rgba(0, 144, 255, 0.4); text-align: center;">
                      Explore Mirai &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 36px;">
                <tr>
                  <td style="border-top: 1px solid rgba(255, 255, 255, 0.08);">&nbsp;</td>
                </tr>
              </table>

              <!-- Footer -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 10px;">
                <tr>
                  <td align="center" style="font-size: 12px; color: #64748b; line-height: 1.6;">
                    <p style="margin: 0 0 6px 0;">
                      &copy; 2026 Mirai &middot; Made for people who make things.
                    </p>
                    <p style="margin: 0;">
                      You received this email because you registered for the waitlist at <a href="https://mymirai.site" style="color: #38bdf8; text-decoration: none;">mymirai.site</a>.
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
