/**
 * Test Email Channel Script
 *
 * Tests the email channel by sending a test email via Mailpit (development)
 * or Resend (production).
 *
 * Prerequisites:
 * - Docker running with Mailpit (pnpm docker:up)
 * - View emails at http://localhost:8025
 *
 * Run: npx tsx scripts/test-email-channel.ts
 */

import { EmailChannel } from '../src/infrastructure/channels/email/email.channel'

async function main() {
  console.log('=== Email Channel Test ===\n')

  const emailChannel = new EmailChannel()
  const provider = emailChannel.getProvider()

  console.log('Provider:', provider.getName())
  console.log('')

  // Test 1: Simple email
  console.log('Test 1: Sending simple email...')

  const result1 = await emailChannel.send({
    to: 'test@example.com',
    subject: 'Test Email - Simple',
    body: '<h1>Hello!</h1><p>This is a simple test email.</p>',
  })

  if (result1.success) {
    console.log('  ✓ Email sent successfully')
    console.log('    - Message ID:', result1.providerMessageId)
    console.log('    - Duration:', result1.duration, 'ms')
  } else {
    console.log('  ✗ Failed to send email')
    console.log('    - Error:', result1.error)
  }

  // Test 2: HTML email with styling
  console.log('\nTest 2: Sending styled HTML email...')

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .button { 
          display: inline-block; 
          padding: 12px 24px; 
          background: #4F46E5; 
          color: white; 
          text-decoration: none; 
          border-radius: 6px; 
        }
        .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to Zuno!</h1>
        </div>
        <div class="content">
          <p>Hello there!</p>
          <p>This is a styled test email from the Zuno Marketplace Notifications system.</p>
          <p>Features tested:</p>
          <ul>
            <li>HTML rendering</li>
            <li>CSS styles</li>
            <li>Email delivery via ${provider.getName()}</li>
          </ul>
          <p style="text-align: center; margin-top: 30px;">
            <a href="https://zuno.market" class="button">Visit Zuno</a>
          </p>
        </div>
        <div class="footer">
          <p>© 2025 Zuno Marketplace. All rights reserved.</p>
          <p>This is a test email.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const result2 = await emailChannel.send({
    to: 'user@example.com',
    subject: 'Welcome to Zuno Marketplace! 🎉',
    body: htmlContent,
  })

  if (result2.success) {
    console.log('  ✓ Styled email sent successfully')
    console.log('    - Message ID:', result2.providerMessageId)
    console.log('    - Duration:', result2.duration, 'ms')
  } else {
    console.log('  ✗ Failed to send styled email')
    console.log('    - Error:', result2.error)
  }

  // Test 3: Validation test (invalid email)
  console.log('\nTest 3: Testing validation (invalid email)...')

  const result3 = await emailChannel.send({
    to: 'invalid-email',
    subject: 'Test',
    body: 'Test body',
  })

  if (!result3.success) {
    console.log('  ✓ Validation correctly rejected invalid email')
    console.log('    - Error:', result3.error)
  } else {
    console.log('  ✗ Validation should have rejected invalid email!')
  }

  // Summary
  console.log('\n=== Summary ===')
  console.log('Provider used:', provider.getName())
  console.log('Tests passed:', [result1.success, result2.success, !result3.success].filter(Boolean).length, '/ 3')

  if (provider.getName() === 'mailpit') {
    console.log('')
    console.log('📧 View sent emails at: http://localhost:8025')
  }
}

main()
  .catch((e) => {
    console.error('Script failed:', e)
    process.exit(1)
  })
