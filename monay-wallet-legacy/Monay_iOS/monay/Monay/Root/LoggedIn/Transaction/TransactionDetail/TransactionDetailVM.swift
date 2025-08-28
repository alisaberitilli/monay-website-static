//
//  TransactionDetailVM.swift
//  Monay
//
//  Created by WFH on 20/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

class TransactionDetailVM {
    
    // MARK: - Instance properties
    
    var transactionId: Int?
    var transaction: Transaction?
    
    // MARK: - Helper methods
    
    func transactionDetailAPI(transactionId: Int, completion: @escaping ((Bool, String) -> Void)) {
        
        HudView.show()
        
        APIComponent
            .transaction
            .userTransaction(id: transactionId, result: { [weak self] (result) in
                
                guard let `self` = self else {
                    return
                }
                
                HudView.kill()
                
                switch result {
                case .success(let response):
                    if let data = response.serverResponse as? HTTPParameters {
                        self.transaction = Transaction(JSON: data)
                        completion(true, "")
                    }
                    
                case .failure(let error):
                    completion(false, error.localizedDescription)
                }
            })
    }
}
