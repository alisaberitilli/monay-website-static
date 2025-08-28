//
//  Rewards.swift
//  Monay
//
//  Created by Aayushi on 21/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

struct Rewards {
  
  var name: String?
  var dateTime: String?
  var amount: String?
  
  static func defaultData() -> [Rewards] {
    return [Rewards(name: "Amy Mellor", dateTime: "29 May 2020, 2:54 PM", amount: "+ $56,789"),
            Rewards(name: "Amber Hale", dateTime: "29 May 2020, 2:54 PM", amount: "+ $56,789"),
            Rewards(name: "Aaron Dickinson", dateTime: "29 May 2020, 2:54 PM", amount: "+ $56,789"),
            Rewards(name: "Amy Mellor", dateTime: "29 May 2020, 2:54 PM", amount: "+ $56,789"),
            Rewards(name: "Amber Hale", dateTime: "29 May 2020, 2:54 PM", amount: "+ $56,789"),
            Rewards(name: "Aaron Dickinson", dateTime: "29 May 2020, 2:54 PM", amount: "+ $56,789"),
            Rewards(name: "Amy Mellor", dateTime: "29 May 2020, 2:54 PM", amount: "+ $56,789"),
            Rewards(name: "Amber Hale", dateTime: "29 May 2020, 2:54 PM", amount: "+ $56,789"),
            Rewards(name: "Aaron Dickinson", dateTime: "29 May 2020, 2:54 PM", amount: "+ $56,789"),
            Rewards(name: "Amy Mellor", dateTime: "29 May 2020, 2:54 PM", amount: "+ $56,789")]
  }
  
}
