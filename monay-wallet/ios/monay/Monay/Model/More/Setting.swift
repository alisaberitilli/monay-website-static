//
//  Setting.swift
//  Monay
//
//  Created by Aayushi on 30/10/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

struct Setting: Hashable {
  
  var title: String!
  var options: [SettingOption]!
  
  init(title: String,
       options: [SettingOption]) {
    self.title = title
    self.options = options
  }
}

struct UploadDocument: Hashable {
  
  var title: String!
  var options: [String]!
  
  init(title: String,
       options: [String]) {
    self.title = title
    self.options = options
  }

}
