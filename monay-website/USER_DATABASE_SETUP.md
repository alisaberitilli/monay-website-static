# User Database Setup Guide

This guide explains how to set up and use the PostgreSQL user database system for storing pilot program applications.

## 🚀 Quick Setup

### 1. Create the Database Table
```bash
./setup-user-database.sh
```

### 2. Test the System
```bash
npm run test:user-db
```

## 🗄️ Database Schema

### Users Table Structure
```sql
CREATE TABLE users (
    id VARCHAR(10) PRIMARY KEY,                    -- 10-digit UUID
    email VARCHAR(255) NOT NULL UNIQUE,            -- User's email
    first_name VARCHAR(100) NOT NULL,              -- First name
    last_name VARCHAR(100) NOT NULL,               -- Last name
    mobile_number VARCHAR(20) NOT NULL,            -- Mobile number (+1XXXXXXXXXX)
    company_name VARCHAR(255),                     -- Company name
    company_type VARCHAR(50),                      -- Company type (startup, enterprise, etc.)
    job_title VARCHAR(100),                        -- Job title
    industry VARCHAR(100),                         -- Industry
    use_case TEXT,                                 -- Use case description
    technical_requirements TEXT[],                 -- Array of technical requirements
    expected_volume VARCHAR(50),                   -- Expected token volume
    timeline VARCHAR(100),                         -- Project timeline
    additional_notes TEXT,                         -- Additional notes
    email_verified BOOLEAN DEFAULT FALSE,          -- Email verification status
    mobile_verified BOOLEAN DEFAULT FALSE,         -- Mobile verification status
    verification_completed_at TIMESTAMP,           -- When verification was completed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Record creation time
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Last update time
);
```

### Indexes
- `idx_users_email` - Fast email lookups
- `idx_users_mobile` - Fast mobile number lookups  
- `idx_users_verification` - Fast verification status queries

## 🔑 10-Digit UUID Generation

The system automatically generates unique 10-character IDs for each user:
- **Format**: 10 alphanumeric characters (e.g., `a1b2c3d4e5`)
- **Uniqueness**: Guaranteed by PostgreSQL primary key constraint
- **Generation**: Uses custom function `generate_10_digit_uuid()`

## 📡 API Endpoints

### Save User Data
**POST** `/api/save-user`

**Request Body:**
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "mobileNumber": "+13016821633",
  "companyName": "Tech Corp",
  "companyType": "startup",
  "jobTitle": "CTO",
  "industry": "Technology",
  "useCase": "Digital asset management",
  "technicalRequirements": ["API Integration", "Real-time Data"],
  "expectedVolume": "1000-5000",
  "timeline": "Q1 2025",
  "additionalNotes": "Additional information"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User data saved successfully",
  "user": {
    "id": "a1b2c3d4e5",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "mobileNumber": "+13016821633",
    "companyName": "Tech Corp",
    "companyType": "startup",
    "jobTitle": "CTO",
    "industry": "Technology",
    "useCase": "Digital asset management",
    "technicalRequirements": ["API Integration", "Real-time Data"],
    "expectedVolume": "1000-5000",
    "timeline": "Q1 2025",
    "additionalNotes": "Additional information",
    "emailVerified": true,
    "mobileVerified": true,
    "verificationCompletedAt": "2025-01-22T10:30:00Z",
    "createdAt": "2025-01-22T10:30:00Z",
    "updatedAt": "2025-01-22T10:30:00Z"
  }
}
```

## 🔄 Integration Flow

### 1. User Registration
1. User fills out pilot program form
2. Email OTP is sent and verified
3. Mobile OTP is sent and verified
4. **User data is automatically saved to database**
5. User receives their unique 10-digit ID

### 2. Data Persistence
- **Automatic**: Data is saved immediately after SMS OTP verification
- **Secure**: Only verified users (email + mobile) are stored
- **Complete**: All form fields are preserved in the database

## 🧪 Testing

### Test User Database
```bash
npm run test:user-db
```

### Test OTP System
```bash
npm run test:otp
```

### Manual Testing
1. Complete the pilot program form
2. Verify email OTP
3. Verify mobile OTP
4. Check database for saved user
5. Verify 10-digit ID generation

## 🛠️ Database Management

### Check Users Table
```bash
psql -d monay_otp -U monay_user -c "SELECT id, email, first_name, last_name, mobile_number, created_at FROM users ORDER BY created_at DESC LIMIT 5;"
```

### Count Total Users
```bash
psql -d monay_otp -U monay_user -c "SELECT COUNT(*) as total_users FROM users;"
```

### Check Verification Status
```bash
psql -d monay_otp -U monay_user -c "SELECT email, email_verified, mobile_verified, verification_completed_at FROM users WHERE email_verified = true AND mobile_verified = true;"
```

## 🔒 Security Features

### Data Validation
- **Email Format**: Validates email structure
- **Mobile Format**: Ensures US format (+1XXXXXXXXXX)
- **Required Fields**: Prevents incomplete submissions
- **Duplicate Prevention**: Unique email constraint

### Access Control
- **Verification Required**: Only verified users are stored
- **Database Isolation**: Separate connection from OTP system
- **Input Sanitization**: Prevents SQL injection

## 📊 Monitoring

### Logs to Watch
- `✅ User database connected successfully`
- `✅ Users table created successfully`
- `✅ User created successfully with ID: [ID]`
- `✅ User saved successfully with ID: [ID]`

### Error Handling
- **Connection Failures**: Automatic fallback logging
- **Validation Errors**: Clear error messages returned
- **Database Errors**: Detailed logging for debugging

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Failed
```
❌ Failed to connect to user database: [error]
```
**Solution**: Check PostgreSQL service and connection string

#### Table Creation Failed
```
❌ Error creating users table: [error]
```
**Solution**: Ensure database user has CREATE TABLE permissions

#### User Save Failed
```
❌ Failed to create user in database
```
**Solution**: Check required fields and data validation

### Debug Commands
```bash
# Check PostgreSQL status
brew services list | grep postgresql

# Test database connection
psql -d monay_otp -U monay_user -c "SELECT 1;"

# Check table structure
psql -d monay_otp -U monay_user -c "\d users"

# View recent users
psql -d monay_otp -U monay_user -c "SELECT * FROM users ORDER BY created_at DESC LIMIT 3;"
```

## 📈 Performance

### Optimizations
- **Indexed Fields**: Fast lookups on email, mobile, verification status
- **Connection Pooling**: Efficient database connection management
- **Batch Operations**: Support for future bulk operations

### Scalability
- **UUID Generation**: No sequential ID bottlenecks
- **Efficient Queries**: Optimized for common access patterns
- **Modular Design**: Easy to extend with additional fields

## 🔮 Future Enhancements

### Planned Features
- **User Search**: Find users by various criteria
- **Data Export**: CSV/JSON export functionality
- **Analytics Dashboard**: User registration statistics
- **Bulk Operations**: Import/export multiple users
- **Audit Trail**: Track data modifications

### Integration Points
- **CRM Systems**: Export to Salesforce, HubSpot
- **Marketing Tools**: Connect to Mailchimp, ConvertKit
- **Analytics**: Google Analytics, Mixpanel integration

---

## 🆘 Need Help?

If you encounter issues:

1. **Check Logs**: Look for error messages in the console
2. **Verify Database**: Ensure PostgreSQL is running and accessible
3. **Test Connection**: Use the test scripts to isolate issues
4. **Check Permissions**: Verify database user has necessary privileges
5. **Review Schema**: Ensure the users table was created correctly

The system is designed to be robust and self-healing, with comprehensive error logging and fallback mechanisms.
