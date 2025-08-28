const enValidationMsg = {
  /**
   * Login
   */
  enterEmail: 'Enter an email',
  enterValidEmail: 'Enter a valid email',
  enterPassword: 'Enter a password',
  loginSuccessfully: 'You login successfully',
  loginError: 'Incorrect email or password',
  /**
   * Logout
   */
  logoutSuccessfully: 'You logout successfully',
  /**
   * Reset Password
   */
  passwordSuccess: 'Password is updated successfully',
  passwordLengthMessage: (min, max) => `Use ${min}-${max} characters for your password`,
  passwordNotMatchMessage: 'New Password and Confirm Password does not match',
  reEnterPassword: 'Re-enter the password',
  /**
   * Change Password
   */
  currentPasswordError: 'Current password is wrong',
  passwordChangeSuccess: 'You changed password successfully',
  enterCurrentPassword: 'Enter current password',
  enterNewPassword: 'Enter new password',
  reEnterNewPassword: 'Re-enter the new password',
  /**
   * Update Profile
   */
  firstName: 'Enter first Name',
  lastName: 'Enter last Name',
  selectIcon: 'Select profile picture',
  profileSuccessfully: 'Your profile updated successfully',
  /**
   * Reply Message
   */
  enterResponse: 'Enter message',
  enterReason: 'Enter Reason',
  /**
  * FAQ
  */
  addFAQ: 'New FAQ added successfully',
  updateFAQ: 'FAQ updated successfully',
  deleteFAQ: 'FAQ deleted successfully',
  enterFAQquestion: 'Enter question',
  enterFAQanswer: 'Enter answer',


  selectKycStatus: 'Select KYC Status',
  reason: 'Enter reason',

  /**
  * Approver
  */
  enterSubadminFirstName: 'Enter sub admin first name',
  enterSubadminLastName: 'Enter sub admin last name',
  addSubadminMessage: 'Subadmin added successfully',
  updateSubadminMessage: 'Subadmin updated successfully',
  selectRole: 'Select role',
  /**
   * Upload file
   */
  fileUploadSuccess: (fileName) => `${fileName} upload successfully`,
  fileUploadFail: (fileName) => `${fileName} upload failed`,
  filesAllowed: (files) => `Only this ${files} file type are allowed`,
  fileSizeLimit: (size) => `File should be upto ${size} MB`,
  fileAudioLengthLimit: ({ minLength, maxLength }) => `Audio file should be between ${minLength}-${maxLength} seconds in length`,
  /**
   * Common
   */
  statusUpdate: 'Status updated successfully',
  enterMinChar: (val) => `Enter minimun ${val} characters`,
  enterMaxChar: (val) => `Maximum ${val} characters allowed`,
  enterMinNumber: (val) => `Enter minimun ${val} digits`,
  enterMaxNumber: (val) => `Maximum ${val} digits allowed`,
  alphaNumericOnly: 'Only alphanumeric character allowed',
  numericOnly: 'Only numeric value allowed',

  orderLengthMessage: (min, max) => `Order must be between ${min}-${max}`,
  /**
   * No Data Message
   */
  notAvailable: 'Not Available',
  noDataFound: 'No record found',
  noDataUserList: 'There is no user registered in the system',
  noDataMerchantList: 'There is no merchant registered in the system',
  noDataTransactionList: 'No transaction found',
  noDataPaymentRequestList: 'No payment request found',
  noDataFaqList: 'Click on the "Add FAQ" button to add FAQ',
  /**
   * Update Settings
   */
  twilioAccountSid: 'Enter twilio account Id',
  twilioAuthToken: 'Enter twilio auth Token',
  twilioFromNumber: 'Enter twilio from Number',
  smtpEmailFromName: 'Enter SMTP email from name',
  smtpEmailFromEmail: 'Enter SMTP email from Email',
  nonKycUserTransactionLimit: 'Enter non-kyc user transaction limit',
  kycUserTransactionLimit: 'Enter kyc user transaction limit',
  transactionLimitDays: 'Enter transaction limit days',
  smtpHostd: 'Enter SMTP Host',
  smtpPort: 'Enter SMTP Port',
  smtpUsername: 'Enter SMTP Username',
  smtpPassword: 'Enter SMTP Password',
  portLength: 'SMPT port should be 3 digits',
  twilioPhoneNumber: 'Please enter valid phone number',
  currencyAbbr: 'Please select currency abbreviation',
  countryPhoneCode: 'Please select country phone code',
}

export default enValidationMsg
