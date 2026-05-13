/**
 * Email Notification Service
 * To enable real emails, install nodemailer and provide SMTP credentials in .env
 */

export async function sendEmail({ to, subject, text, html }) {
  console.log('📧 [MOCK EMAIL SENT]');
  console.log(`   To: ${to}`);
  console.log(`   Subject: ${subject}`);
  console.log(`   Body: ${text.substring(0, 50)}...`);
  
  // In production, use nodemailer or a service like Resend/SendGrid:
  /*
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  
  await transporter.sendMail({
    from: '"TaskFlow" <notifications@taskflow.com>',
    to,
    subject,
    text,
    html,
  });
  */
  
  return { success: true };
}

/**
 * Notify user about task assignment
 */
export async function notifyTaskAssigned(user, task, project) {
  return sendEmail({
    to: user.email,
    subject: `New Task Assigned: ${task.title}`,
    text: `Hi ${user.name},\n\nYou have been assigned a new task: "${task.title}" in project "${project.title}".\n\nView details: ${process.env.NEXT_PUBLIC_APP_URL}/projects/${project.id}`,
    html: `<p>Hi ${user.name},</p><p>You have been assigned a new task: <strong>"${task.title}"</strong> in project <strong>"${project.title}"</strong>.</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL}/projects/${project.id}">View details</a></p>`,
  });
}
