//
//  AuthenticationService.swift
//  Monay
//
//  Authentication Service using Combine
//

import Foundation
import Combine
import Alamofire

class AuthenticationService {
    
    // MARK: - Private Properties
    private let session = Session.default
    private let baseURL = Configuration.shared.apiBaseURL
    
    // MARK: - Public Methods
    
    func sendVerificationCode(to phoneNumber: String) -> AnyPublisher<VerificationResponse, Error> {
        let url = "\(baseURL)/auth/send-verification"
        let parameters = ["phone_number": phoneNumber]
        
        return session
            .request(url, method: .post, parameters: parameters, encoder: JSONParameterEncoder.default)
            .publishDecodable(type: APIResponse<VerificationResponse>.self)
            .value()
            .map(\.data)
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
    
    func verifyCode(_ code: String, for phoneNumber: String) -> AnyPublisher<CodeVerificationResponse, Error> {
        let url = "\(baseURL)/auth/verify-code"
        let parameters = [
            "phone_number": phoneNumber,
            "verification_code": code
        ]
        
        return session
            .request(url, method: .post, parameters: parameters, encoder: JSONParameterEncoder.default)
            .publishDecodable(type: APIResponse<CodeVerificationResponse>.self)
            .value()
            .map(\.data)
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
    
    func login(email: String, password: String) -> AnyPublisher<AuthenticationResult, Error> {
        let url = "\(baseURL)/auth/login"
        let parameters = [
            "email": email,
            "password": password
        ]
        
        return session
            .request(url, method: .post, parameters: parameters, encoder: JSONParameterEncoder.default)
            .publishDecodable(type: APIResponse<AuthenticationResult>.self)
            .value()
            .map(\.data)
            .handleEvents(receiveOutput: { [weak self] result in
                self?.storeTokens(result.accessToken, refreshToken: result.refreshToken)
            })
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
    
    func signup(_ signupData: SignupData) -> AnyPublisher<AuthenticationResult, Error> {
        let url = "\(baseURL)/auth/signup"
        let parameters: [String: Any] = [
            "first_name": signupData.firstName,
            "last_name": signupData.lastName,
            "email": signupData.email,
            "password": signupData.password,
            "phone_number": signupData.phoneNumber,
            "user_type": signupData.userType.rawValue
        ]
        
        return session
            .request(url, method: .post, parameters: parameters, encoder: JSONParameterEncoder.default)
            .publishDecodable(type: APIResponse<AuthenticationResult>.self)
            .value()
            .map(\.data)
            .handleEvents(receiveOutput: { [weak self] result in
                self?.storeTokens(result.accessToken, refreshToken: result.refreshToken)
            })
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
    
    func forgotPassword(email: String) -> AnyPublisher<ForgotPasswordResponse, Error> {
        let url = "\(baseURL)/auth/forgot-password"
        let parameters = ["email": email]
        
        return session
            .request(url, method: .post, parameters: parameters, encoder: JSONParameterEncoder.default)
            .publishDecodable(type: APIResponse<ForgotPasswordResponse>.self)
            .value()
            .map(\.data)
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
    
    func refreshToken() -> AnyPublisher<RefreshTokenResponse, Error> {
        guard let refreshToken = TokenManager.shared.refreshToken else {
            return Fail(error: AuthError.noRefreshToken)
                .eraseToAnyPublisher()
        }
        
        let url = "\(baseURL)/auth/refresh"
        let parameters = ["refresh_token": refreshToken]
        
        return session
            .request(url, method: .post, parameters: parameters, encoder: JSONParameterEncoder.default)
            .publishDecodable(type: APIResponse<RefreshTokenResponse>.self)
            .value()
            .map(\.data)
            .handleEvents(receiveOutput: { [weak self] result in
                self?.storeTokens(result.accessToken, refreshToken: result.refreshToken)
            })
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
    
    func logout() -> AnyPublisher<Void, Error> {
        let url = "\(baseURL)/auth/logout"
        
        guard let token = TokenManager.shared.accessToken else {
            // If no token, just clear local data
            TokenManager.shared.clearTokens()
            return Just(())
                .setFailureType(to: Error.self)
                .eraseToAnyPublisher()
        }
        
        let headers = HTTPHeaders(["Authorization": "Bearer \(token)"])
        
        return session
            .request(url, method: .post, headers: headers)
            .publishDecodable(type: APIResponse<EmptyResponse>.self)
            .value()
            .map { _ in () }
            .handleEvents(receiveOutput: { _ in
                TokenManager.shared.clearTokens()
            })
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
    
    // MARK: - Private Methods
    
    private func storeTokens(_ accessToken: String, refreshToken: String) {
        TokenManager.shared.accessToken = accessToken
        TokenManager.shared.refreshToken = refreshToken
    }
}

// MARK: - Supporting Types

struct VerificationResponse: Codable {
    let isNewUser: Bool
    let expiryTime: Int
}

struct CodeVerificationResponse: Codable {
    let isValid: Bool
    let message: String
}

struct AuthenticationResult: Codable {
    let user: User
    let accessToken: String
    let refreshToken: String
    let expiryTime: Int
}

struct RefreshTokenResponse: Codable {
    let accessToken: String
    let refreshToken: String
    let expiryTime: Int
}

struct ForgotPasswordResponse: Codable {
    let message: String
    let success: Bool
}

struct EmptyResponse: Codable {}

struct User: Codable {
    let id: String
    let firstName: String
    let lastName: String
    let email: String
    let phoneNumber: String
    let userType: String
    let profileImageURL: String?
    let isEmailVerified: Bool
    let isPhoneVerified: Bool
}

enum AuthError: Error, LocalizedError {
    case noRefreshToken
    case invalidCredentials
    case userNotFound
    case invalidVerificationCode
    
    var errorDescription: String? {
        switch self {
        case .noRefreshToken:
            return "No refresh token available"
        case .invalidCredentials:
            return "Invalid email or password"
        case .userNotFound:
            return "User not found"
        case .invalidVerificationCode:
            return "Invalid verification code"
        }
    }
}