//
//  TransactionFilter.swift
//  Monay
//
//  Created by WFH on 10/11/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

final class TransactionFilter {
    
    static let `default` = TransactionFilter()
    
    var fromDate = ""
    var toDate = ""
    var name = ""
    var transactionType = ""
    var minPrice = ""
    var maxPrice = ""
    
    private init() { }
}
