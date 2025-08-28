//
//  ContactSearchVM.swift
//  Monay
//
//  Created by WFH on 19/11/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

class ContactSearchVM {
    
    // MARK: - Instance properties
    
    var phoneContacts: [Contact] = []
    var searchPhoneContacts: [Contact] = []
    var user: User?
    var paymentType: PaymentType = .send
    
    // MARK: - Helper methods
    
    func checkPhoneAPI(parameters: HTTPParameters, completion: @escaping ((Bool, String) -> Void)) {
        
        HudView.show()
        
        APIComponent
            .home
            .checkPhone(parameters: parameters, result: { (result) in
                
                HudView.kill()
                
                switch result {
                case .success(let response):
                    if let data = response.fullServerResponse as? HTTPParameters,
                        let message = data[APIKey.message] as? String {
                        
                      if message == LocalizedKey.phoneNotFound.value {
                            return completion(true, message)
                        }
                    }
                    
                    if let data = response.serverResponse as? HTTPParameters {
                        self.user = User(JSON: data)
                        completion(true, "")
                    }
                    
                case .failure(let error):
                    completion(false, error.localizedDescription)
                }
            })
    }
    
    func userSearchAPI(parameters: HTTPParameters, completion: @escaping ((Bool, String) -> Void)) {
        
        HudView.show()
        
        APIComponent
            .home
            .userSearch(parameters: parameters, result: { (result) in
                
                HudView.kill()
                
                switch result {
                case .success(let response):
                    if let data = response.serverResponse as? HTTPParameters,
                       let rows = data[APIKey.rows] as? [HTTPParameters] {
                        let users = rows.compactMap { User(JSON: $0) }
                        
                        if !users.isEmpty {
                            self.user = users[0]
                            completion(true, "")
                        }
                    }
                case .failure(let error):
                    completion(false, error.localizedDescription)
                }
            })
    }
}
