//
//  SupportCategoryVM.swift
//  Monay
//
//  Created by WFH on 26/11/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

class SupportCategoryVM {
    
    // MARK: - Instance properties
    
  static let addMoney = "add_money"
  static let sendMoney = "send_money"
  static let requestMoney = "request_money"
  static let failedTransactions = "failed_transactions"
  static let accountSettings = "account_settings"
  static let kycSupport = "kyc_support"
  static let reportFraudActivity = "report_fraudulent_activity"
  static let others = "others"
  
    let supportCategories = [
      SupportCategory(title: LocalizedKey.issueAddMoney.value),
        SupportCategory(title: LocalizedKey.issueSendMoney.value),
        SupportCategory(title: LocalizedKey.issueRequestMoney.value),
      SupportCategory(title: LocalizedKey.failedTransactions.value),
      SupportCategory(title: LocalizedKey.needhelpInAccountSettings.value),
      SupportCategory(title: LocalizedKey.kycSupport.value),
      SupportCategory(title: LocalizedKey.reportFraudActivity.value),
      SupportCategory(title: LocalizedKey.others.value)
    ]
}

struct SupportCategory {
    var title: String!
}
