// Microsoft Teams Integration Configuration
// This file contains the configuration needed to integrate with Microsoft Teams

export const teamsConfig = {
  // Microsoft Graph API configuration
  graphApi: {
    baseUrl: 'https://graph.microsoft.com/v1.0',
    scopes: [
      'https://graph.microsoft.com/Calendars.ReadWrite',
      'https://graph.microsoft.com/User.Read',
      'https://graph.microsoft.com/OnlineMeetings.ReadWrite'
    ]
  },

  // Teams meeting settings
  meetingSettings: {
    defaultDuration: 30, // minutes
    bufferTime: 15, // minutes between meetings
    workingHours: {
      start: 9, // 9 AM
      end: 17, // 5 PM
      timezone: 'UTC'
    },
    skipWeekends: true,
    maxAdvanceBooking: 30 // days
  },

  // Ali's availability settings
  organizer: {
    email: 'ali@monay.com',
    name: 'Ali from Monay',
    title: 'Monay Platform Specialist',
    company: 'Monay',
    timezone: 'UTC',
    // Custom availability rules
    availability: {
      // Block specific dates (holidays, PTO, etc.)
      blockedDates: [] as string[],
      // Block specific time slots
      blockedTimeSlots: [] as Array<{ day: number; start: string; end: string }>
    }
  },

  // Meeting types and durations
  meetingTypes: {
    demo: {
      name: 'Platform Demo',
      duration: 30,
      description: 'Personalized walkthrough of the Monay platform'
    },
    consultation: {
      name: 'Technical Consultation',
      duration: 45,
      description: 'Deep dive into technical requirements and architecture'
    },
    integration: {
      name: 'Integration Discussion',
      duration: 60,
      description: 'Detailed discussion of integration requirements and timeline'
    },
    pricing: {
      name: 'Pricing Discussion',
      duration: 30,
      description: 'Pricing structure and pilot program details'
    }
  },

  // Email templates
  emailTemplates: {
    confirmation: {
      subject: 'Meeting Confirmed: Monay Platform Demo - {date}',
      from: 'system notification',
      replyTo: 'ali@monay.com'
    },
    reminder: {
      subject: 'Reminder: Monay Platform Demo Tomorrow',
      sendHoursBefore: 24
    },
    cancellation: {
      subject: 'Meeting Cancelled: Monay Platform Demo'
    }
  },

  // Integration endpoints
  endpoints: {
    scheduleMeeting: '/api/schedule-meeting',
    sendConfirmation: '/api/send-confirmation',
    checkAvailability: '/api/check-availability',
    rescheduleMeeting: '/api/reschedule-meeting',
    cancelMeeting: '/api/cancel-meeting'
  }
};

// Helper functions for Teams integration
export const teamsHelpers = {
  // Generate Teams meeting link
  generateMeetingLink: (meetingId: string, tenantId?: string, userId?: string) => {
    const context = {
      Tid: tenantId || 'your-tenant-id',
      Oid: userId || 'your-user-id'
    };
    
    return `https://teams.microsoft.com/l/meetup-join/19:${meetingId}@thread.v2/0?context=${encodeURIComponent(JSON.stringify(context))}`;
  },

  // Check if date is available (not blocked)
  isDateAvailable: (date: Date): boolean => {
    const dateString = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    
    // Skip weekends if configured
    if (teamsConfig.meetingSettings.skipWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
      return false;
    }
    
    // Check blocked dates
    if (teamsConfig.organizer.availability.blockedDates.includes(dateString)) {
      return false;
    }
    
    return true;
  },

  // Check if time slot is available
  isTimeSlotAvailable: (date: Date, time: string): boolean => {
    const [hour, minute] = time.split(':').map(Number);
    
    // Check working hours
    if (hour < teamsConfig.meetingSettings.workingHours.start || 
        hour >= teamsConfig.meetingSettings.workingHours.end) {
      return false;
    }
    
    // Check blocked time slots
    const dayOfWeek = date.getDay();
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    const isBlocked = teamsConfig.organizer.availability.blockedTimeSlots.some(blocked => {
      return blocked.day === dayOfWeek && 
             timeString >= blocked.start && 
             timeString < blocked.end;
    });
    
    return !isBlocked;
  },

  // Format date for display
  formatDate: (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  // Format time for display
  formatTime: (time: string): string => {
    const [hour, minute] = time.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  }
};

export default teamsConfig;
