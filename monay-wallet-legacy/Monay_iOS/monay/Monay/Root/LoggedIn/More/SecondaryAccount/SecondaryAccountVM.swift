//
//  SecondaryAccountVM.swift
//  Monay
//
//  Created by Aayushi Bhagat on 08/09/22.
//  Copyright © 2022 Codiant. All rights reserved.
//

import Foundation

class SecondaryAccountVM {
    
    // MARK: - Instance properties
    
    var secondaryUsers: [SecondaryUser] = []
        
    // MARK: - Helper methods
    
    func secondaryUserAPI(_ handler: @escaping ((PlaceholderState) -> Void), completion: @escaping (() -> Void)) {
        handler(.defaultState)

        handler(.loading)

        APIComponent
            .More
            .secondaryUser(result: { (result) in

                handler(.defaultState)

                switch result {
                case .success(let response):
                    if let data = response.serverResponse as? HTTPParameters,
                       let rows = data[APIKey.rows] as? [HTTPParameters] {

                        let secondaryUser = rows.compactMap { SecondaryUser(JSON: $0) }
                        self.secondaryUsers.append(contentsOf: secondaryUser)

                        if self.secondaryUsers.isEmpty {
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
