//
//  RequestMoneyVM.swift
//  Monay
//
//  Created by WFH on 18/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

class RequestMoneyVM {
    
    // MARK: - Instance properties
    
    var user: User?
    
    // MARK: - Helper methods
    
    func isValidText(_ inputData: [String]) -> (Bool, String) {
        
        let amount = Double(inputData[0]) ?? 0.0
        
        if Validator.emptyString(inputData[0]) {
          return (false, LocalizedKey.messageEnterAmount.value)
        } else if amount < 1.0 {
          return (false, LocalizedKey.amountGreaterThanOne.value)
        }
        
        return (true, "")
    }
    
    func paymentRequestMoneyAPI(parameters: HTTPParameters, completion: @escaping ((Bool, String, String) -> Void)) {
        
        HudView.show()
        
        APIComponent
            .home
            .paymentRequestMoney(parameters: parameters, result: { (result) in
                
                HudView.kill()
                
                switch result {
                case .success(let response):
                    if let data = response.fullServerResponse as? HTTPParameters {
                      let status = (data[APIKey.status] as? String) ?? ""
                        let message = data[APIKey.message] as? String ?? ""
                        completion(true, message, status)
                    }
                    
                case .failure(let error):
                    completion(false, error.localizedDescription, "")
                }
            })
    }
}
