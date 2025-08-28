//
//  SettingVM.swift
//  Monay
//
//  Created by Aayushi on 30/10/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

class SettingVM {
    
  // MARK: - Outputs

  let dataSource = [Setting(title: LocalizedKey.settings.value, options: [.security,
                                                         .changePassword]),
                    Setting(title: LocalizedKey.supports.value, options: [.notifications,
                                                         .howItWorks,
                                                         .faq,
                                                         .support,
                                                         .termsCondition,
                                                         .userPolicy])]
}
