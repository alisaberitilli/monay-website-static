//
//  HomeService.swift
//  Monay
//
//  SwiftUI-compatible Home Service using Combine and Alamofire
//

import Foundation
import Combine
import Alamofire
import KeychainAccess

class HomeService {
    
    // MARK: - Private Properties
    private let session = Session.default
    private let baseURL = Configuration.shared.apiBaseURL
    
    // MARK: - Public Methods
    
    func fetchUserProfile() -> AnyPublisher<UserProfile, Error> {
        let url = "\(baseURL)/user/profile"
        
        return session
            .request(url, method: .get, headers: authHeaders)
            .publishDecodable(type: APIResponse<UserProfile>.self)
            .value()
            .map(\.data)
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
    
    func fetchWalletBalance() -> AnyPublisher<WalletBalance, Error> {
        let url = "\(baseURL)/wallet/balance"
        
        return session
            .request(url, method: .get, headers: authHeaders)
            .publishDecodable(type: APIResponse<WalletBalance>.self)
            .value()
            .map(\.data)
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
    
    // MARK: - Private Properties
    
    private var authHeaders: HTTPHeaders {
        guard let token = TokenManager.shared.accessToken else {
            return HTTPHeaders()
        }
        
        return HTTPHeaders([
            "Authorization": "Bearer \(token)",
            "Content-Type": "application/json"
        ])
    }
}

// MARK: - Supporting Types

struct APIResponse<T: Codable>: Codable {
    let success: Bool
    let message: String
    let data: T
}

class Configuration {
    static let shared = Configuration()
    
    private init() {}
    
    var apiBaseURL: String {
        return Bundle.main.object(forInfoDictionaryKey: "API_URL") as? String ?? ""
    }
}

class TokenManager {
    static let shared = TokenManager()
    
    private init() {}
    
    private let keychain = Keychain(service: "com.monay.app")
    
    var accessToken: String? {
        get {
            return try? keychain.get("access_token")
        }
        set {
            if let token = newValue {
                try? keychain.set(token, key: "access_token")
            } else {
                try? keychain.remove("access_token")
            }
        }
    }
    
    var refreshToken: String? {
        get {
            return try? keychain.get("refresh_token")
        }
        set {
            if let token = newValue {
                try? keychain.set(token, key: "refresh_token")
            } else {
                try? keychain.remove("refresh_token")
            }
        }
    }
    
    func clearTokens() {
        accessToken = nil
        refreshToken = nil
    }
}

