//
//  TransactionFilterVM.swift
//  Monay
//
//  Created by WFH on 19/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

class TransactionFilterVM {
    
    // MARK: - Helper methods
    
    func isValidText(_ inputData: [String]) -> (Bool, String) {
        
        if Validator.emptyString(inputData[0]) {
          return(false, LocalizedKey.selectFromDate.value)
            
        }
        
        return(true, "")
    }
}
