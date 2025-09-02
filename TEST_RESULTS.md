# Local Testing Results for Monay Website

## Test Date: 2025-08-28

### Configuration
- **Local URL**: http://localhost:3000
- **Email Recipient**: ali@monay.com
- **Calendly URL**: https://calendly.com/monay-demo

## Test Cases

### 1. Book Demo Button
- [ ] Clicking "Book Demo" opens Calendly in new tab
- [ ] URL is correct: https://calendly.com/monay-demo
- [ ] No modal form appears

### 2. Pilot Program Form
- [ ] Form displays correctly
- [ ] All fields are functional
- [ ] Dropdowns show custom arrow styling
- [ ] Form submission shows alert with ali@monay.com
- [ ] Form data is captured correctly

### 3. Dropdown Styling
- [ ] Custom arrow icon visible on right
- [ ] Default browser arrow is hidden
- [ ] Styling works in light mode
- [ ] Styling works in dark mode

### 4. Dark Mode
- [ ] Toggle button works
- [ ] All elements transition smoothly
- [ ] Text remains readable in both modes
- [ ] Forms look good in both modes

### 5. Email Submissions
- [ ] All forms mention ali@monay.com as recipient
- [ ] Contact form works
- [ ] Pilot program form works
- [ ] Meeting scheduler (if still present) works

## Known Issues
- EmailJS is not configured (shows demo alerts instead of sending real emails)
- Real email sending requires EmailJS account setup

## Notes
- All form submissions currently show alerts for demo purposes
- To enable real email delivery:
  1. Sign up at emailjs.com
  2. Get service ID, template ID, and public key
  3. Add to environment variables
  4. Restart the server

## Test Results
Please mark each checkbox after testing and note any issues below:

---
**Issues Found:**


---
**Additional Notes:**

