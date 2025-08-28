//
//  Enums.swift
//  Monay
//
//  Created by Aayushi on 10/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

enum PaymentMethod: String {
    case card
    case wallet
}

enum UserRole: String {
  case user = "USER"
  case secondaryUser = "SECONDARY USER"
  case merchant = "MERCHANT"
}

enum FlagStatus: String {
  case trueStatus = "true"
  case falseStatus = "false"
}

enum UserIDMode: String {
  case email = "Use Email Instead"
  case mobile = "Use Mobile Instead"
}

enum PaymentType {
    case send
    case request
}

enum MoreType: Int {
    case myWallet = 101
    case paymentRequest
    case withdrawMoney
    case withdrawalRequest
    case autoTopup
    case myCards
    case secondaryAccount
    case bankAccount
    case kyc
    case shareInvite
    case settingSupport
    case primaryAccount
}

enum SupportType {
    case pending
    case closed
}

enum CMSType: String, CaseIterable {
  case howItWorks = "how-it-works"
  case userPolicy = "user-policy"
  case terms = "terms-and-conditions"
  case privacyPolicy = "privacyPolicy"
}

enum UserType: String {
  case user
  case secondaryUser
  case merchant
}

enum PaymentStatus: String {
    case pending
    case completed
    case cancelled
    case failed
}

enum CardTypeEnum: String {
    case debitCard = "Debit Card"
    case creditCard = "Credit Card"
}

enum RedirectFrom: String {
    case payMoney = "Pay Money"
    case requestMoney
    case addMoney
    case withdrawalRequestMoney
    case pin
    case signup
    case scan
    case forgotPassword
    case editProfile
    case scanner
    case autoTopup
}

enum PayBy {
    case saveCard
    case newCard
    case none
}

enum AppKey {
    
    enum User: String {
        
        case isBiometricEnable
        
        var valueAsString: String {
            guard let value = userDefualt.value(forKey: rawValue) as? String else { return "" }
            return value
        }
        
        var valueAsBool: Bool {
            guard let value = userDefualt.value(forKey: rawValue) as? Bool else { return false }
            return value
        }
    }
}

var isBiometricAuthenticated: Bool {
  get {
    UserDefaults.standard.bool(forKey: "isBiometricAuthenticated")
  }
  set {
    UserDefaults.standard.set(newValue, forKey: "isBiometricAuthenticated")
  }
  
}

enum SettingOption: CaseIterable {
  
  case security
  case changePassword
  case notifications
  case howItWorks
  case faq
  case support
  case termsCondition
  case userPolicy
  
  var title: String {
    switch self {
    case .security:
      return "Security"
      
    case .changePassword:
      return "Change Password"
      
    case .notifications:
      return "Notifications"
      
    case .howItWorks:
      return "How It Works"
      
    case .faq:
      return "FAQ"
      
    case .support:
      return "Support"
      
    case .termsCondition:
      return "Terms & Conditions"
      
    case .userPolicy:
      return "Privacy Policy"
    }
  }
  
  var iconName: String {
    switch self {
    case .security:
      return "ic_security"
      
    case .changePassword:
      return "ic_change_password"
      
    case .notifications:
      return "ic_notification_blue"
      
    case .howItWorks:
      return "ic_how_it_work"
      
    case .faq:
      return "ic_faq"
      
    case .support:
      return "ic_support"
      
    case .termsCondition:
      return "ic_terms_and_condition"
      
    case .userPolicy:
      return "ic_user_policy"
    }
  }
}

enum PlaceholderStateData {
  case noTransactionFound
  case noDataFound
  case noNotificationFound
  case noFAQ
  case noCard
  case noRequest
  case noBankAccount
  case noWithdrawHistory
  case noContact
  
  var title: String {
    switch self {
    case .noTransactionFound:
      return "No Transactions Found"
    case .noDataFound:
      return "No Data Found"
    case .noNotificationFound:
      return "No Notifications Found"
    case .noFAQ:
      return "No FAQ Found"
    case .noCard:
      return "No Cards Found"
    case .noRequest:
      return "No Request Found"
    case .noBankAccount:
      return "No Record Found"
    case .noWithdrawHistory:
      return "No Record Found"
    case .noContact:
      return "No Contacts Found"
    }
  }
  
  var message: String {
    switch self {
    case .noTransactionFound:
      return ""
    case .noDataFound:
      return ""
    case .noNotificationFound:
      return ""
    case .noFAQ:
      return ""
    case .noCard:
      return ""
    case .noRequest:
      return ""
    case .noBankAccount:
      return ""
    case .noWithdrawHistory:
      return ""
    case .noContact:
      return ""
    }
  }
}

enum ActionType: String {
    case deposit
    case withdrawal
    case transfer
}

enum NotificationType: String {
    case paymentRequest = "PAYMENT_REQUEST"
    case paymentReceive = "PAYMENT_RECEIVED"
    case paymentSent = "PAYMENT_SENT"
    case addWalletMonay = "ADD_WALLET_MONAY"
    case withdrawalRequest = "WITHDRAWAL_REQUEST"
    case withdrawalUserRequest = "WITHDRAWAL_USER_REQUEST"
    case kycApproval = "KYC_APPROVAL"
    case kycUploaded = "KYC_UPLOADED"
}

enum NotificationEventSource {
  case tap, auto
}

enum ChangeMobileOrEmailType {
    case mobile
    case email
}

enum KYCStatus: String {
    case pending
    case uploaded
    case approved
    case rejected
}
