//
//  ChangeEmailVM.swift
//  Monay
//
//  Created by WFH on 29/12/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

class ChangeEmailVM {
    
    // MARK: - Instance properties
    
    var usertype: UserType = .user
    var redirectFrom = RedirectFrom.editProfile
    var changeMobileOrEmailType = ChangeMobileOrEmailType.mobile
    
    // MARK: - Helper methods
    
    func isValidText(_ inputData: [String]) -> (Bool, String) {
        if Validator.emptyString(inputData[0]) {
          return(false, LocalizedKey.messageEnterEmail.value)
        } else if !Validator.validEmail(inputData[0]) {
            return(false, LocalizedKey.messageEnterCorrectEmail.value)
        }
        
        return (true, "")
    }
    
    func updateEmailAPI(parameters: HTTPParameters, completion: @escaping ((Bool, String) -> Void)) {
        
        HudView.show()
        
        APIComponent
            .Profile
            .updateEmail(parameters: parameters, result: { (result) in
                
                HudView.kill()
                
                switch result {
                case .success(let response):
                    if let data = response.fullServerResponse as? HTTPParameters,
                        let message = data[APIKey.message] as? String {
                        completion(true, message)
                    }
                case .failure(let error):
                    completion(false, error.localizedDescription)
                }
            })
    }
}
