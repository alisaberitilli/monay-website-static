//
//  HomeComponent.swift
//  Monay
//
//  Created by WFH on 08/10/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

struct HomeComponent {
    
    // MARK: - Check phone
    
    static func checkPhone(parameters: HTTPParameters, result: @escaping HTTPResult) {
        do {
            let request = try HTTPRequest(uri: "/user/check/phone", method: .get, authorizationPolicy: .anonymous, dataTask: .request(parameters: parameters), encoding: .url)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
    
    // MARK: - home
    
    static func home(result: @escaping HTTPResult) {
        do {
            let request = try HTTPRequest(uri: "/home", method: .get, authorizationPolicy: .signedIn, dataTask: .request(parameters: [:]), encoding: .url)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
    
    // MARK: - Recent User
    
    static func recentPaymentUser(parameters: HTTPParameters, result: @escaping HTTPResult) {
        do {
            let request = try HTTPRequest(uri: "/user/recent-payment-users", method: .get, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .url)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
    
    // MARK: - Payment request
    
    static func paymentRequestMoney(parameters: HTTPParameters, result: @escaping HTTPResult) {
        do {
            let request = try HTTPRequest(uri: "/user/payment/request", method: .post, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .json)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
    
    // MARK: - Pay money
    
    static func payMoney(parameters: HTTPParameters, result: @escaping HTTPResult) {
        do {
            let request = try HTTPRequest(uri: "/user/pay-money", method: .post, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .json)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
    
    // MARK: - User Request Pay Money
    
    static func userRequestPayMoney(parameters: HTTPParameters, result: @escaping HTTPResult) {
        do {
            let request = try HTTPRequest(uri: "/user/payment/request/pay", method: .post, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .json)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
    
    // MARK: - get User Details
    
    static func getUserDetails(userId: String, result: @escaping HTTPResult) {
        
        do {
            
            let request = try HTTPRequest(uri: "/user/profile/\(userId)", method: .get, authorizationPolicy: .signedIn, dataTask: .request(parameters: [:]), encoding: .url)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
    
    // MARK: - Contact Sync
    
    static func contactSync(parameters: HTTPParameters, result: @escaping HTTPResult) {
        
        do {
            
            let request = try HTTPRequest(uri: "/contact/sync", method: .post, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .json)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
    
    // MARK: - User Search
    
    static func userSearch(parameters: HTTPParameters, result: @escaping HTTPResult) {
        
        do {
            
            let request = try HTTPRequest(uri: "/user/search", method: .get, authorizationPolicy: .signedIn, dataTask: .request(parameters: parameters), encoding: .url)
            let router = Router(request: request, resultHandler: result)
            
            router.perfom()
            
        } catch {
            result(.failure(error))
        }
    }
}
