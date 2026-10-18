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

export function waitlistConfirmationTemplate(params: {
  email: string
  role?: string | null
  logoUrl?: string
}): EmailContent {
  const roleDisplay = params.role
    ? params.role.charAt(0).toUpperCase() + params.role.slice(1).toLowerCase()
    : 'Builder'

  const currentYear = new Date().getFullYear()

  // Publicly accessible HTTPS URL for the trimmed official Mirai logo (hosted on production Vercel edge CDN)
  const defaultLogoUrl = 'https://www.mymirai.site/mirai-logo-trimmed.png'
  const logoUrl = params.logoUrl || defaultLogoUrl

  return {
    subject: "You're on the list — Mirai early access confirmed",
    text: `WAITLIST CONFIRMED\n\nYou're on the list.\nYou're one step closer to building something meaningful with Mirai.\n\nYou're on our early access list.\nWe're preparing something exciting. We'll email you as soon as your early access invitation is ready.\n\nYour Details:\n• Registered Email: ${params.email}\n• Selected Role: ${roleDisplay}\n\nWhat's Coming:\n• Startup Profiles — Showcase your idea.\n• Co-Founder Match — Find the right people.\n• Builder Community — Turn ideas into action.\n\nVisit: https://www.mymirai.site\n\nBuilt for people who want to build something.\n© ${currentYear} Mirai. All rights reserved.`,
    // Do NOT send logo as a separate PNG attachment — rendered via public HTTPS CDN
    attachments: undefined,
    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>You're on the list — Mirai</title>
  <style type="text/css">
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      background-color: #f6f8fb;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 20px 12px !important;
      }
      .card-inner {
        padding: 32px 22px !important;
      }
      .user-details-table td {
        display: block !important;
        width: 100% !important;
        text-align: left !important;
        padding-bottom: 10px !important;
      }
      .user-details-table td.role-col {
        padding-bottom: 0 !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f8fb; color: #082638; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <!-- Full background wrapper -->
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" class="email-wrapper" style="background-color: #f6f8fb; padding: 48px 16px;">
    <tr>
      <td align="center" valign="top">
        
        <!-- Main Card Container (560px max) -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border: 1px solid #e3e8ee; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px -2px rgba(8, 38, 56, 0.05);">
          <tr>
            <td class="card-inner" style="padding: 40px 38px;">
              
              <!-- Header: Official Logo -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" style="padding-bottom: 28px;">
                    <a href="https://www.mymirai.site" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img src="${logoUrl}" alt="Mirai" width="98" style="display: block; width: 98px; max-width: 98px; height: auto; border: 0;" />
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 26px;">
                <tr>
                  <td style="border-top: 1px solid #edf2f7; font-size: 1px; line-height: 1px;">&nbsp;</td>
                </tr>
              </table>

              <!-- Status Badge -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 16px;">
                <tr>
                  <td style="background-color: #eef6fc; border: 1px solid #d2e4f5; border-radius: 9999px; padding: 4px 12px; font-size: 10.5px; font-weight: 700; letter-spacing: 0.1em; color: #0074db; text-transform: uppercase;">
                    <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: #0074db; margin-right: 6px; vertical-align: middle;"></span>WAITLIST CONFIRMED
                  </td>
                </tr>
              </table>

              <!-- Main Heading & Supporting Text -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-bottom: 22px;">
                    <h1 style="margin: 0 0 8px 0; font-size: 25px; font-weight: 700; color: #082638; letter-spacing: -0.03em; line-height: 1.25;">
                      You&rsquo;re on the list.
                    </h1>
                    <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #516579;">
                      You&rsquo;re one step closer to building something meaningful with Mirai.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Confirmation Card (Pale Blue) -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f2f7fc; border: 1px solid #d4e5f4; border-radius: 12px; margin-bottom: 22px;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="28" valign="top" style="padding-right: 12px; padding-top: 2px;">
                          <!-- Minimal Confirmation Icon -->
                          <div style="width: 22px; height: 22px; border-radius: 50%; background-color: #0074db; text-align: center; line-height: 22px; color: #ffffff; font-size: 12px; font-weight: bold;">
                            &#10003;
                          </div>
                        </td>
                        <td valign="top">
                          <p style="margin: 0 0 4px 0; font-size: 14.5px; font-weight: 700; color: #082638; letter-spacing: -0.01em;">
                            You&rsquo;re on our early access list.
                          </p>
                          <p style="margin: 0; font-size: 13.5px; line-height: 1.55; color: #37536b;">
                            We&rsquo;re preparing something exciting. We&rsquo;ll email you as soon as your early access invitation is ready.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- User Details Card -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f9fbfd; border: 1px solid #e5edf5; border-radius: 12px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" class="user-details-table">
                      <tr>
                        <td valign="top" style="text-align: left;">
                          <div style="font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #697d91; margin-bottom: 4px;">
                            Registered Email
                          </div>
                          <div style="font-size: 14px; font-weight: 600; color: #082638; word-break: break-all;">
                            ${params.email}
                          </div>
                        </td>
                        <td valign="top" align="right" class="role-col">
                          <div style="font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #697d91; margin-bottom: 4px;">
                            Selected Role
                          </div>
                          <span style="display: inline-block; font-size: 12px; font-weight: 600; color: #082638; background-color: #e6f0fa; border: 1px solid #cce1f5; border-radius: 6px; padding: 2px 10px;">
                            ${roleDisplay}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- What's Coming Section -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
                <tr>
                  <td style="padding-bottom: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.09em; color: #475f75;">
                    What&rsquo;s Coming
                  </td>
                </tr>
                <tr>
                  <td>
                    <!-- Feature Row 1 -->
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 10px 0; border-top: 1px solid #f0f4f8;">
                      <tr>
                        <td width="22" valign="middle" style="padding-right: 10px;">
                          <div style="width: 6px; height: 6px; border-radius: 50%; background-color: #0074db;"></div>
                        </td>
                        <td valign="middle">
                          <span style="font-size: 14px; font-weight: 600; color: #082638;">Startup Profiles</span>
                          <span style="font-size: 13.5px; color: #60758a;"> &mdash; Showcase your idea.</span>
                        </td>
                      </tr>
                    </table>

                    <!-- Feature Row 2 -->
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 10px 0; border-top: 1px solid #f0f4f8;">
                      <tr>
                        <td width="22" valign="middle" style="padding-right: 10px;">
                          <div style="width: 6px; height: 6px; border-radius: 50%; background-color: #0074db;"></div>
                        </td>
                        <td valign="middle">
                          <span style="font-size: 14px; font-weight: 600; color: #082638;">Co-Founder Match</span>
                          <span style="font-size: 13.5px; color: #60758a;"> &mdash; Find the right people.</span>
                        </td>
                      </tr>
                    </table>

                    <!-- Feature Row 3 -->
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 10px 0; border-top: 1px solid #f0f4f8; border-bottom: 1px solid #f0f4f8;">
                      <tr>
                        <td width="22" valign="middle" style="padding-right: 10px;">
                          <div style="width: 6px; height: 6px; border-radius: 50%; background-color: #0074db;"></div>
                        </td>
                        <td valign="middle">
                          <span style="font-size: 14px; font-weight: 600; color: #082638;">Builder Community</span>
                          <span style="font-size: 13.5px; color: #60758a;"> &mdash; Turn ideas into action.</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Explore Mirai Link / Action -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">
                <tr>
                  <td>
                    <a href="https://www.mymirai.site" target="_blank" style="display: inline-block; background-color: #082638; color: #ffffff; font-size: 13px; font-weight: 600; text-decoration: none; padding: 9px 20px; border-radius: 7px; letter-spacing: 0.01em;">
                      Explore Mirai &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Footer Divider -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="border-top: 1px solid #edf2f7; font-size: 1px; line-height: 1px;">&nbsp;</td>
                </tr>
              </table>

              <!-- Footer Content -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="padding-top: 22px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 600; color: #2d475d;">
                      Built for people who want to build something.
                    </p>
                    <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #8194a5;">
                      &copy; ${currentYear} Mirai. All rights reserved. &middot; <a href="https://www.mymirai.site" target="_blank" style="color: #60758a; text-decoration: underline;">mymirai.site</a>
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>
        <!-- End Main Card -->

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
