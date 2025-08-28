//
//  SecondaryUserProfileVM.swift
//  Monay
//
//  Created by Aayushi Bhagat on 09/09/22.
//  Copyright © 2022 Codiant. All rights reserved.
//

import Foundation

class SecondaryUserProfileVM {
  
  var secondaryUsers: SecondaryUser?
  
  func isValidText(limit: String) -> (Bool, String) {
      
      if Validator.emptyString(limit) {
        return (false, "Please set limit")
      }
      
      return (true, "")
  }

  func secondaryUserProfileAPI(id: String, completion: @escaping ((Bool, String) -> Void)) {

    HudView.show()
    
    APIComponent.More.secondaryUserProfile(result: { result in

      HudView.kill()
      
      switch result {
        
      case .success(let response):
        if let data = response.serverResponse as? HTTPParameters {
          let secondaryUser = SecondaryUser(JSON: data)
          self.secondaryUsers = secondaryUser
          completion(true, "")
      }
      case .failure(let error):
        completion(false, error.localizedDescription)
      }
      
    }, id: id)
    
  }
  
  func secondaryUserProfileUpdateStatusAPI(parameters: HTTPParameters, id: String, completion: @escaping ((Bool, String) -> Void)) {
    HudView.show()
    
    APIComponent.More.secondaryUserProfileStatusUpdate(result: { result in
      
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
      
    }, id: id, parameters: parameters)
    
  }
  
  func secondaryUserProfileRangeAPI(parameters: HTTPParameters, id: String, completion: @escaping ((Bool, String) -> Void)) {
    
    HudView.show()
    
    APIComponent.More.secondaryUserProfileSetRange(result: { result in
      
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
      
    }, id: id, parameters: parameters)
    
  }
  
  // secondaryUserProfileDelete
  
  func secondaryUserProfileDeleteAPI(id: String, completion: @escaping ((Bool, String) -> Void)) {

    HudView.show()
    
    APIComponent.More.secondaryUserProfileDelete(result: { result in
      
      HudView.kill()
      
      switch result {
        
      case .success:
        completion(true, "")
        
      case .failure(let error):
        completion(false, error.localizedDescription)
      }
      
    }, id: id)
    
  }
  
}
