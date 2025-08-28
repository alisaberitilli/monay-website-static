//
//  ScannerVM.swift
//  Monay
//
//  Created by Aayushi Bhagat on 08/09/22.
//  Copyright © 2022 Codiant. All rights reserved.
//

import Foundation

class ScannerVM {
  
  // MARK: - Instance properties
  
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
  
  func userLinkAPI(userId: String, completion: @escaping ((Bool, String) -> Void)) {
      
      HudView.show()
      
    APIComponent
      .Account
      .userLink(userId: userId) { (result) in
                      
              HudView.kill()
              
              switch result {
              case .success:
                completion(true, "")

              case .failure(let error):
                  completion(false, error.localizedDescription)
              }
          }
  }

  func sendOtpAPI(parameters: HTTPParameters, completion: @escaping ((Bool, String) -> Void)) {
      
      HudView.show()
      
      APIComponent
          .Account
          .sendPrimaryOtp(parameters: parameters, result: { (result) in
              
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
