//
//  TransactionComponent.swift
//  Monay
//
//  Created by WFH on 12/10/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

struct TransactionComponent {
    
    // MARK: - User Transaction List
    
    static func userTransactionList(parameters: HTTPParameters, result: @escaping HTTPResult) {
        do {
            let request = try HTTPRequest(uri: "/user/transaction", method: .get, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .url)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
    
    // MARK: - User Transaction
    
    static func userTransaction(id: Int, result: @escaping HTTPResult) { 
        do {
            let request = try HTTPRequest(uri: "/user/transaction/\(id)", method: .get, authorizationPolicy: .signedIn, dataTask: .request(parameters: [:]), encoding: .url)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
}
