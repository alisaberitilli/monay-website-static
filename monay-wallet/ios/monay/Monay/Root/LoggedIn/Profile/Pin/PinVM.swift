//
//  PinVM.swift
//  Monay
//
//  Created by WFH on 22/10/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

class PinVM {
    
    // MARK: - Instance properties
    
    var redirectFrom: RedirectFrom?
    var userDetail: UserDetail?
    var transaction: Transaction?
    var user: User?
    
    // MARK: - Helper methods
    
    func isValidText(_ inputData: [String]) -> (Bool, String) {
        
        if Validator.emptyString(inputData[0]) &&
            Validator.emptyString(inputData[1]) &&
            Validator.emptyString(inputData[2]) &&
            Validator.emptyString(inputData[3]) {
          return (false, LocalizedKey.messageEnterPin.value)
        } else if Validator.emptyString(inputData[0]) ||
            Validator.emptyString(inputData[1]) ||
            Validator.emptyString(inputData[2]) ||
            Validator.emptyString(inputData[3]) {
          return (false, LocalizedKey.messageEnterValidPin.value)
        }
        
        return (true, "")
    }
    
    func payMoneyAPI(parameters: HTTPParameters, completion: @escaping ((Bool, String, String) -> Void)) {
        
        HudView.show()
        
        APIComponent
            .home
            .payMoney(parameters: parameters, result: { (result) in
                
                HudView.kill()
                
                switch result {
                case .success(let response):
                    if let data = response.fullServerResponse as? HTTPParameters {
                      let status = (data[APIKey.status] as? String) ?? ""
                        let message = data[APIKey.message] as? String ?? ""
                        
                        if let json = response.serverResponse as? HTTPParameters {
                            self.transaction = Transaction(JSON: json)
                        }
                        return completion(true, message, status)
                    }
                    
                case .failure(let error):
                    completion(false, error.localizedDescription, "")
                }
            })
    }
    
    func userRequestPayMoneyAPI(parameters: HTTPParameters, completion: @escaping ((Bool, String, String) -> Void)) {
        
        HudView.show()
        
        APIComponent
            .home
            .userRequestPayMoney(parameters: parameters, result: { (result) in
                
                HudView.kill()
                
                switch result {
                case .success(let response):
                    
                    if let data = response.fullServerResponse as? HTTPParameters {
                      let status = (data[APIKey.status] as? String) ?? ""
                        let message = data[APIKey.message] as? String ?? ""
                        
                        if let json = response.serverResponse as? HTTPParameters {
                            self.transaction = Transaction(JSON: json)
                        }
                        return completion(true, message, status)
                    }
                    
                case .failure(let error):
                    completion(false, error.localizedDescription, "")
                }
            })
    }
    
    func addMoneyFromCardAPI(parameters: HTTPParameters, completion: @escaping ((Bool, String, String) -> Void)) {
        
        HudView.show()
        
        APIComponent
            .Profile
            .addMoneyFromCard(parameters: parameters, result: { (result) in
                
                HudView.kill()
                
                switch result {
                case .success(let response):
                    
                    if let data = response.fullServerResponse as? HTTPParameters {
                      let status = (data[APIKey.status] as? String) ?? ""
                        let message = data[APIKey.message] as? String ?? ""
                        
                        if let json = response.serverResponse as? HTTPParameters {
                            self.transaction = Transaction(JSON: json)
                        }
                        return completion(true, message, status)
                    }
                case .failure(let error):
                    completion(false, error.localizedDescription, "")
                }
            })
    }
    
    func withdrawalMoneyAPI(parameters: HTTPParameters, completion: @escaping ((Bool, String) -> Void)) {
        
        HudView.show()
        
        APIComponent
            .Profile
            .withdrawalMoney(parameters: parameters, result: { (result) in
                
                HudView.kill()
                
                switch result {
                case .success(let response):
                    if let data = response.fullServerResponse as? HTTPParameters,
                        let json = response.serverResponse as? HTTPParameters,
                        let message = data[APIKey.message] as? String {
                        self.transaction = Transaction(JSON: json)
                        completion(true, message)
                    }
                    
                case .failure(let error):
                    completion(false, error.localizedDescription)
                }
            })
    }
  
  func autoTopupAPI(parameters: HTTPParameters, completion: @escaping ((Bool, String, String) -> Void)) {
        
        HudView.show()
        
        APIComponent
            .More
            .autoTopup(parameters: parameters, result: { (result) in
                
                HudView.kill()
                
                switch result {
                case .success(let response):
                    
                    if let data = response.fullServerResponse as? HTTPParameters {
                      let status = (data[APIKey.status] as? String) ?? ""
                        let message = data[APIKey.message] as? String ?? ""
                        
                        if let json = response.serverResponse as? HTTPParameters {
                            self.transaction = Transaction(JSON: json)
                        }
                        Authorization.shared.userCredentials.minimumWalletAmount = parameters["minimumWalletAmount"] as? String
                        Authorization.shared.userCredentials.refillWalletAmount = parameters["refillWalletAmount"] as? String
                        Authorization.shared.synchronize()
                        return completion(true, message, status)
                    }
                case .failure(let error):
                    completion(false, error.localizedDescription, "")
                }
            })
    }
}

struct UserDetail {
    let requestId: String
    let toUserId: String
    let amount: String
    let refillAmount: String
    let message: String
    let paymentMethod: String
    let cardId: String
    let cardType: String
    let cardNumber: String
    let nameOnCard: String
    let month: String
    let year: String
    let cvv: String
    let saveCard: String
    let isUserRequestPayMoney: Bool
    let bankId: String
    let parentId: String
}
