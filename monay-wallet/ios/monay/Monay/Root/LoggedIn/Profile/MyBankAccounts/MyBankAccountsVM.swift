//
//  MyBankAccountsVM.swift
//  Monay
//
//  Created by WFH on 21/10/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

class MyBankAccountsVM {
    
    // MARK: - Instance properties
    
    var banks: [Bank] = []
    
    // MARK: - Helper methods
    
    func getBanksAPI(_ handler: @escaping ((PlaceholderState) -> Void), completion: @escaping (() -> Void)) {
        
        handler(.loading)

        APIComponent
            .Profile
            .getBanks(result: { (result) in
                
                handler(.defaultState)

                switch result {
                case .success(let response):
                    if let data = response.serverResponse as? [HTTPParameters] {
                        
                        if data.isEmpty {
                            handler(.noResult(message: PlaceholderStateData.noBankAccount.title))
                        } else {
                            let banks = data.compactMap { Bank(JSON: $0) }
                            self.banks.append(contentsOf: banks)
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
    
    func deleteBankAPI(bankId: Int, completion: @escaping ((Bool, String) -> Void)) {
        
        HudView.show()
        
        APIComponent
            .Profile
            .deleteBank(bankId: bankId, result: { (result) in
                
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
