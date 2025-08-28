//
//  ScanVM.swift
//  Monay
//
//  Created by WFH on 21/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

class ScanVM {
    
    // MARK: - Instance properties
    
    var recentUsers: [User] = []
    var paymentType: PaymentType = .send
    
    // QRCode Scan
    var user: User?
    // end
    
    // MARK: - Helper methods
    
    func recentUsersAPI(completion: @escaping ((Bool, String) -> Void)) {
        
        let parameters: HTTPParameters = [
            "limit": 100,  // Showing 100 user
            "offset": 0,
            "name": ""
        ]
        
        HudView.show()
        
        APIComponent
            .home
            .recentPaymentUser(parameters: parameters, result: { (result) in
                
                HudView.kill()
                
                switch result {
                case .success(let response):
                    if let data = response.serverResponse as? HTTPParameters,
                       let rows = data[APIKey.rows] as? [HTTPParameters] {
                        self.recentUsers = rows.compactMap { User(JSON: $0) }
                        completion(true, "")
                    }
                    
                case .failure(let error):
                    completion(false, error.localizedDescription)
                }
            })
    }
    
    func getUserDetails(userId: String, completion: @escaping ((Bool, String) -> Void)) {
        
        HudView.show()
        
        APIComponent
            .home
            .getUserDetails(userId: userId, result: { (result) in
                
                HudView.kill()
                
                switch result {
                case .success(let response):
                    if let data = response.serverResponse as? HTTPParameters {
                        self.user = User(JSON: data)
                        completion(true, "")
                    }
                    
                case .failure(let error):
                    completion(false, error.localizedDescription)
                }
            })
    }
}
