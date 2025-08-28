//
//  CMSVM.swift
//  Monay
//
//  Created by Aayushi on 14/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation
import ObjectMapper

class CMSVM {
    
  static let privacyPolicy = "privacy_policy"
  static let tnc = "terms_conditions"
  static let howItWorks = "how_it_works"
  
    // MARK: - Instance properties
    
    var selectedCMS: CMSType = .terms
    var cms: CMS?
    var usertype: UserType = .user
    
    // MARK: - Helper methods
    
    func cmsAPI(parameters: HTTPParameters, completion: @escaping ((Bool, String) -> Void)) {
        
        HudView.show()
        
        APIComponent
            .Account
            .cms(parameters: parameters, result: { [weak self] (result) in
                
                guard let `self` = self else {
                    return
                }
                
                HudView.kill()
                
                switch result {
                case .success(let response):
                    
                    if let data = response.serverResponse as? HTTPParameters,
                       let rows = data[APIKey.rows] as? [HTTPParameters] {
                        let arrayOfcms = rows.compactMap({ CMS(JSON: $0) })
                        
                        switch self.selectedCMS {
                        case .userPolicy:
                            
                          self.cms = arrayOfcms.filter { $0.pageKey == CMSVM.privacyPolicy }.first
                            
                        case .terms:
                            
                            self.cms = arrayOfcms.filter { $0.pageKey == CMSVM.tnc }.first
                            
                        case .howItWorks:
                            
                            self.cms = arrayOfcms.filter { $0.pageKey == CMSVM.howItWorks }.first
                            
                        case .privacyPolicy:
                            
                            self.cms = arrayOfcms.filter { $0.pageKey == CMSVM.privacyPolicy }.first
                            
                        }
                        
                        completion(true, "")
                    }
                    
                case .failure(let error):
                    completion(false, error.localizedDescription)
                }
            })
    }
}
