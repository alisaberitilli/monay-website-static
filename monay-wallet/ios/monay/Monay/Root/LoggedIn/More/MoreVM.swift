//
//  MoreVM.swift
//  Monay
//
//  Created by Aayushi on 14/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

class MoreVM {
    
  // MARK: - Outputs

  let dataSource = [Setting(title: LocalizedKey.settings.value, options: [.security,
                                                         .changePassword]),
                    Setting(title: LocalizedKey.supports.value, options: [.notifications,
                                                         .howItWorks,
                                                         .faq,
                                                         .support,
                                                         .termsCondition,
                                                         .userPolicy])]

    // MARK: - Helper methods
    
    func signout(completion: @escaping ((Bool, String) -> Void)) {
        
        HudView.show()
        
        APIComponent
            .Account
            .logout(result: { (result) in
                
                HudView.kill()
                
                switch result {
                case .success:
                    completion(true, "")
                case .failure(let error):
                    completion(true, error.localizedDescription)
                }
            })
    }
}
