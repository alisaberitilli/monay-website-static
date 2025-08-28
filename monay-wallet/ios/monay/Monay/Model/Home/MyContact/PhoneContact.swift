//
//  PhoneContact.swift
//  Monay
//
//  Created by WFH on 26/09/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation
import ContactsUI

class PhoneContact: NSObject {
  
  // MARK: - Instance properties
  
  var firstName: String?
  var lastName: String?
  var avatarData: Data?
  var mobileNumber: String?
  var email: String?
  var isAppUser: Bool?
  var countryCode: String?
  
  init(firstName: String?, lastName: String?, countryCode: String?, mobileNumber: String?, email: String?, userImage: Data?, isAppUser: Bool?) {
    self.firstName = firstName
    self.lastName = lastName
    self.avatarData = userImage
    self.mobileNumber = mobileNumber
    self.email = email
    self.isAppUser = isAppUser
    self.countryCode = countryCode
  }
  
  override init() {
    super.init()
  }
}
