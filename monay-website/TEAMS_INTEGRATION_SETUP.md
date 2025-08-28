# Microsoft Teams Integration Setup Guide

This guide explains how to set up the appointment scheduling system to integrate with Microsoft Teams and your `ali@tilli.pro` account.

## Overview

The scheduling system allows visitors to book demos and consultations with Ali from Tilli.pro through a user-friendly interface that integrates with Microsoft Teams for video meetings.

## Features

- **Interactive Calendar**: Shows available dates and time slots
- **Meeting Types**: Platform Demo, Technical Consultation, Integration Discussion, Pricing Discussion
- **Teams Integration**: Automatically creates Teams meetings and sends meeting links
- **Email Confirmations**: Sends detailed confirmation emails with meeting information
- **Availability Management**: Configurable working hours and blocked time slots

## Prerequisites

1. **Microsoft 365 Account**: You need a Microsoft 365 account with Teams access
2. **Microsoft Graph API Access**: Required for calendar management and meeting creation
3. **Email Service**: For sending confirmation emails (SendGrid, Mailgun, AWS SES, etc.)

## Setup Steps

### 1. Microsoft Graph API Configuration

#### Register an Azure App
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to "Azure Active Directory" > "App registrations"
3. Click "New registration"
4. Name: `Monay Scheduling System`
5. Supported account types: "Accounts in this organizational directory only"
6. Redirect URI: `http://localhost:3000/auth/callback`

#### Configure API Permissions
1. Go to "API permissions"
2. Click "Add a permission"
3. Select "Microsoft Graph" > "Application permissions"
4. Add these permissions:
   - `Calendars.ReadWrite`
   - `User.Read`
   - `OnlineMeetings.ReadWrite`
5. Click "Grant admin consent"

#### Get Client Credentials
1. Go to "Certificates & secrets"
2. Create a new client secret
3. Copy the Application (client) ID and Client secret

### 2. Environment Variables

Create a `.env.local` file in your project root:

```bash
# Microsoft Graph API
MICROSOFT_CLIENT_ID=your_client_id_here
MICROSOFT_CLIENT_SECRET=your_client_secret_here
MICROSOFT_TENANT_ID=your_tenant_id_here

# Email Service (example with SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@monay.com
SENDGRID_REPLY_TO=ali@tilli.pro

# Teams Configuration
TEAMS_ORGANIZER_EMAIL=ali@tilli.pro
TEAMS_ORGANIZER_NAME="Ali from Tilli.pro"
TEAMS_WORKING_HOURS_START=9
TEAMS_WORKING_HOURS_END=17
TEAMS_TIMEZONE=UTC
```

### 3. Update Configuration

Edit `src/lib/teams-config.ts` with your actual values:

```typescript
export const teamsConfig = {
  // Update with your actual tenant and user IDs
  organizer: {
    email: process.env.TEAMS_ORGANIZER_EMAIL || 'ali@tilli.pro',
    name: process.env.TEAMS_ORGANIZER_NAME || 'Ali from Tilli.pro',
    // ... other settings
  },
  
  // Add your blocked dates and time slots
  availability: {
    blockedDates: [
      '2024-12-25', // Christmas
      '2024-01-01', // New Year
      // Add other blocked dates
    ],
    blockedTimeSlots: [
      { day: 1, start: '12:00', end: '13:00' }, // Monday lunch
      // Add other blocked time slots
    ]
  }
};
```

### 4. Email Service Setup

#### Option A: SendGrid
1. Create a SendGrid account
2. Verify your sender domain
3. Create an API key with "Mail Send" permissions
4. Update environment variables

#### Option B: Mailgun
1. Create a Mailgun account
2. Verify your sender domain
3. Get your API key and domain
4. Update environment variables

#### Option C: AWS SES
1. Set up AWS SES in your region
2. Verify your sender email/domain
3. Create SMTP credentials
4. Update environment variables

### 5. Update API Routes

The API routes are already created but you'll need to:

1. **Implement Microsoft Graph API calls** in `/api/schedule-meeting/route.ts`
2. **Configure your email service** in `/api/send-confirmation/route.ts`
3. **Add authentication middleware** for security

## Usage

### For Visitors
1. Click "Book Demo" button on the website
2. Fill out the scheduling form
3. Select preferred date and time
4. Submit the form
5. Receive confirmation email with Teams meeting link

### For Ali (Admin)
1. Meetings automatically appear in your Teams calendar
2. Receive email notifications for new bookings
3. Manage availability through the configuration file
4. Access meeting details and attendee information

## Customization

### Meeting Types
Edit `teamsConfig.meetingTypes` in `teams-config.ts`:

```typescript
meetingTypes: {
  customType: {
    name: 'Custom Meeting Type',
    duration: 45,
    description: 'Custom description'
  }
}
```

### Working Hours
Update `teamsConfig.meetingSettings.workingHours`:

```typescript
workingHours: {
  start: 8, // 8 AM
  end: 18,  // 6 PM
  timezone: 'America/New_York'
}
```

### Blocked Time Slots
Add recurring blocked times:

```typescript
blockedTimeSlots: [
  { day: 1, start: '12:00', end: '13:00' }, // Monday lunch
  { day: 3, start: '15:00', end: '16:00' }, // Wednesday team meeting
]
```

## Security Considerations

1. **API Rate Limiting**: Implement rate limiting on scheduling endpoints
2. **Input Validation**: All form inputs are validated server-side
3. **Authentication**: Consider adding authentication for admin functions
4. **CORS**: Configure CORS properly for production

## Troubleshooting

### Common Issues

1. **"Failed to schedule meeting"**
   - Check Microsoft Graph API permissions
   - Verify client credentials
   - Check calendar access

2. **"Failed to send confirmation email"**
   - Verify email service credentials
   - Check sender domain verification
   - Review email service logs

3. **Time zone issues**
   - Ensure consistent timezone configuration
   - Check browser timezone vs server timezone

### Debug Mode

Enable debug logging by setting:

```bash
DEBUG=true
```

This will log API calls and responses to the console.

## Production Deployment

1. **Update environment variables** with production values
2. **Configure proper CORS** for your domain
3. **Set up monitoring** for API endpoints
4. **Implement error tracking** (e.g., Sentry)
5. **Add health checks** for critical services

## Support

For technical support or questions about the integration:

- **Email**: ali@tilli.pro
- **Documentation**: This guide and inline code comments
- **Issues**: Check the console for error messages and API responses

## Future Enhancements

- **Calendar Sync**: Two-way sync with external calendars
- **Rescheduling**: Allow attendees to reschedule meetings
- **Cancellation**: Automated cancellation handling
- **Reminders**: Automated reminder emails
- **Analytics**: Meeting booking analytics and reporting
- **Multi-organizer**: Support for multiple team members
