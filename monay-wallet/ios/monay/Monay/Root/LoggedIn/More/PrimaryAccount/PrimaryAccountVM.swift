//
//  PrimaryAccountVM.swift
//  Monay
//
//  Created by Aayushi Bhagat on 09/09/22.
//  Copyright © 2022 Codiant. All rights reserved.
//

import Foundation

class PrimaryAccountVM {
    
    // MARK: - Instance properties
    
    var primaryUsers: [SecondaryUser] = []
        
    // MARK: - Helper methods
    
    func primaryUser(_ handler: @escaping ((PlaceholderState) -> Void), completion: @escaping (() -> Void)) {
        handler(.defaultState)

        handler(.loading)

        APIComponent
            .More
            .primaryUser(result: { (result) in

                handler(.defaultState)

                switch result {
                case .success(let response):
                    if let data = response.serverResponse as? HTTPParameters,
                       let rows = data[APIKey.rows] as? [HTTPParameters] {

                        let user = rows.compactMap { SecondaryUser(JSON: $0, context: UserContext.primary) }
                        self.primaryUsers.append(contentsOf: user)

                        if self.primaryUsers.isEmpty {
                            handler(.noResult(message: PlaceholderStateData.noDataFound.title))
                        } else {
                            completion()
                        }
                    }

                case .failure(let error):
                    if (error as NSError).code == SessionSystemCode.internetOffline.rawValue {
                        handler(.noConnection)
                    } else {
                        handler(.error(message: error.localizedDescription, actionType: .tryAgain))
                    }
                }
            })
    }
    
}
