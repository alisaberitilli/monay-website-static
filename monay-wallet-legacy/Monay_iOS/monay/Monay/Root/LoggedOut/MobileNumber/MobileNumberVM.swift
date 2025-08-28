//
//  MobileNumberVM.swift
//  Monay
//
//  Created by WFH on 19/10/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

class MobileNumberVM {
    
    // MARK: - Instance properties
    
    var usertype: UserType = .user
    var redirectFrom = RedirectFrom.pin
    var changeMobileOrEmailType = ChangeMobileOrEmailType.mobile
    var countryPhoneCode = ""
    var countryList: [CountryList] = []

    // MARK: - Helper methods
    
    func isValidText(_ inputData: [String]) -> (Bool, String) {
        
        if Validator.emptyString(inputData[0]) {
          return(false, LocalizedKey.messageEnterMobileNumber.value)
        } else if !Validator.isValidPhoneNumber(inputData[0]) {
          return(false, LocalizedKey.messageMobileNumberValidLength.value)
        }
        
        return (true, "")
    }
    
    func sendOtpAPI(parameters: HTTPParameters, completion: @escaping ((Bool, String) -> Void)) {
        
        HudView.show()
        
        APIComponent
            .Account
            .sendOtp(parameters: parameters, result: { (result) in
                
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
    
    func updatePhoneNumberAPI(parameters: HTTPParameters, completion: @escaping ((Bool, String) -> Void)) {
        
        HudView.show()
        
        APIComponent
            .Profile
            .updatePhoneNumber(parameters: parameters, result: { (result) in
                
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
    
    // MARK: - CountryList API
func countryList(completion: @escaping ((Bool, String) -> Void)) {
    
    HudView.show()
     
    APIComponent
        .Account
        .countryList(result: { (result) in
            
            HudView.kill()
            
            switch result {
            case .success(let response):
                if let data = response.serverResponse as? [HTTPParameters] {
                    
                    if data.isEmpty {
                        completion(true, "")
                    } else {
                        let cards = data.compactMap { CountryList(JSON: $0) }
                        self.countryList.append(contentsOf: cards)
                        
                        completion(true, "")
                    }
                }
            case .failure(let error):
                completion(false, error.localizedDescription)
            }
        })
}
}
