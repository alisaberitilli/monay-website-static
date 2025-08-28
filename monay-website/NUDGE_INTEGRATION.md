# Nudge API Integration

This document describes the integration of the Nudge API (app.nudge.net) with the Monay website.

## Overview

The Nudge API integration allows all form submissions from the Monay website to be automatically sent to Nudge for CRM management, lead tracking, and customer relationship management.

## Configuration

### API Credentials
- **API URL**: `https://app.nudge.net`
- **API Key**: `S`grH6txwh1WGTjJjKjgzdAEXs4ZzfktDALRTWyc+qIl5fjNNiufoGC+2msFUP80XyPKWJ+Y1i/C5peWT5tRLKVQ==`
- **API Version**: `2021-06-01`

### Environment Variables
For production, consider moving the API key to environment variables:
```bash
NUDGE_API_KEY=your_api_key_here
NUDGE_API_URL=https://app.nudge.net
```

## Integration Points

### 1. User Signup Form
- **Form Type**: `signup`
- **Data Sent**: Email, first name, last name, country, password
- **Tags**: `website-signup`, `new-user`
- **Source**: `monay-website-signup`

### 2. Contact Sales Form
- **Form Type**: `contact-sales`
- **Data Sent**: Email, first name, last name, company, country, message
- **Tags**: `website-contact`, `sales-inquiry`
- **Source**: `monay-website-contact`

### 3. Meeting Scheduler
- **Form Type**: `schedule-meeting`
- **Data Sent**: Email, name, company, phone, meeting type, date, time, notes
- **Tags**: `website-scheduler`, `meeting-request`
- **Source**: `monay-website-scheduler`

### 4. Pilot Program Application
- **Form Type**: `pilot-program`
- **Data Sent**: Email, company type, token volume, technical requirements, timeline
- **Tags**: `website-pilot`, `pilot-program`
- **Source**: `monay-website-pilot`

### 5. OTP Email Delivery
- **Endpoint**: `/v1/Nudge/Send`
- **Channel**: `0` (Email)
- **Required Parameters**: 
  - `nudgeId`: "5281" (Fixed Nudge ID)
  - `channel`: 0 (for email)
  - `toEmailAddress`: User email
- **Optional Parameters**:
  - `recipientId`: Full name (First + Last Name concatenated)
  - `toName`: Full name (First + Last Name concatenated)
  - `mergeTags`: Array of custom tags for template variables

## API Endpoints

### Main Nudge API Route
- **Path**: `/api/nudge`
- **Method**: `POST`
- **Purpose**: Centralized endpoint for all Nudge submissions

### Nudge API Endpoints Used
- **Contacts**: `/api/v1/contacts` - For creating/updating contact records
- **Companies**: `/api/v1/companies` - For company information (future use)
- **Deals**: `/api/v1/deals` - For deal tracking (future use)
- **Send**: `/v1/Nudge/Send` - For sending OTP emails via templates

## Data Flow

1. **Form Submission**: User submits form on frontend
2. **Frontend Processing**: Form data is validated and prepared
3. **Nudge API Call**: Data is sent to `/api/nudge` endpoint
4. **Nudge Processing**: Data is formatted and sent to Nudge API
5. **Backup Submission**: Original API endpoints are called as backup
6. **Response Handling**: Success/error responses are handled appropriately

## Error Handling

### Nudge API Errors
- Network failures
- Authentication errors
- Invalid data format
- Rate limiting

### Fallback Strategy
- All submissions attempt Nudge first
- Original API endpoints serve as backup
- Graceful degradation if Nudge is unavailable

## Security Considerations

### API Key Protection
- API key is currently hardcoded (should be moved to environment variables)
- Consider implementing API key rotation
- Monitor API usage for suspicious activity

### Data Privacy
- Sensitive data (passwords) are included in custom fields
- Consider encryption for sensitive information
- Ensure GDPR compliance for EU users

## Monitoring and Analytics

### Logging
- All Nudge submissions are logged with timestamps
- Success/failure rates are tracked
- Error details are captured for debugging

### Metrics to Track
- Submission success rate
- Response times
- Error types and frequencies
- Form completion rates

## Future Enhancements

### Planned Features
1. **Webhook Integration**: Real-time notifications from Nudge
2. **Contact Updates**: Sync existing contact information
3. **Deal Tracking**: Integrate with Nudge deal management
4. **Automated Follow-ups**: Trigger email sequences based on form submissions
5. **Analytics Dashboard**: Visual representation of lead generation metrics

### API Improvements
1. **Rate Limiting**: Implement proper rate limiting
2. **Retry Logic**: Add exponential backoff for failed requests
3. **Batch Processing**: Handle multiple submissions efficiently
4. **Webhook Verification**: Secure webhook endpoints

## Troubleshooting

### Common Issues

1. **API Key Invalid**
   - Verify API key is correct
   - Check if key has expired
   - Ensure proper permissions

2. **Rate Limiting**
   - Implement request throttling
   - Add delays between submissions
   - Monitor API usage limits

3. **Data Format Errors**
   - Validate required fields
   - Check data types
   - Ensure proper encoding

### Debug Mode
Enable debug logging by setting environment variable:
```bash
DEBUG_NUDGE=true
```

## Support

For Nudge API support:
- **Documentation**: https://app.nudge.net/docs
- **API Status**: Check Nudge status page
- **Contact**: Reach out to Nudge support team

For Monay website integration issues:
- Check server logs for error details
- Verify API endpoint configuration
- Test with sample data
