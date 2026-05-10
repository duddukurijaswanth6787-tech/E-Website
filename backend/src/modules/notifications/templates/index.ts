import { NOTIFICATION_TYPES } from '../../../realtime/events/erpEvents';

export interface EmailTemplateData {
  title: string;
  message: string;
  ctaText?: string;
  ctaUrl?: string;
  priority?: string;
  metadata?: Record<string, any>;
}

/**
 * Enterprise Notification Template Engine
 * Generates branded HTML for different notification types.
 */
export const renderNotificationTemplate = (type: string, data: EmailTemplateData): string => {
  const brandingColor = getPriorityColor(data.priority || 'normal');
  
  const baseLayout = (content: string) => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden; }
          .header { background: ${brandingColor}; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; }
          .footer { background: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #888; }
          .btn { display: inline-block; padding: 12px 24px; background: ${brandingColor}; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; }
          .priority-badge { font-size: 10px; font-weight: bold; text-transform: uppercase; padding: 4px 8px; border-radius: 12px; background: rgba(0,0,0,0.1); }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Vasanthi Creations ERP</h1>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Vasanthi Creations. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  let bodyContent = '';

  switch (type) {
    case NOTIFICATION_TYPES.QC_REJECTED:
      bodyContent = `
        <div class="priority-badge">Action Required</div>
        <h2>QC Rejection Alert</h2>
        <p><strong>Task Number:</strong> ${data.metadata?.taskNumber || 'N/A'}</p>
        <p>${data.message}</p>
        <p>Please review the rejection notes in the dashboard and initiate rework immediately.</p>
        ${data.ctaUrl ? `<a href="${data.ctaUrl}" class="btn">View Rejection Details</a>` : ''}
      `;
      break;

    case NOTIFICATION_TYPES.WORKFLOW_ASSIGNED:
      bodyContent = `
        <h2>New Workflow Assignment</h2>
        <p>You have been assigned a new task: <strong>${data.metadata?.taskNumber || 'Task'}</strong></p>
        <p>${data.message}</p>
        ${data.ctaUrl ? `<a href="${data.ctaUrl}" class="btn">View Assignment</a>` : ''}
      `;
      break;

    default:
      bodyContent = `
        <h2>${data.title}</h2>
        <p>${data.message}</p>
        ${data.ctaUrl ? `<a href="${data.ctaUrl}" class="btn">View Details</a>` : ''}
      `;
  }

  return baseLayout(bodyContent);
};

const getPriorityColor = (priority: string): string => {
  switch (priority.toLowerCase()) {
    case 'urgent':
    case 'critical': return '#dc2626'; // Red
    case 'high': return '#ea580c'; // Orange
    case 'normal': return '#2563eb'; // Blue
    default: return '#57534e'; // Stone
  }
};
