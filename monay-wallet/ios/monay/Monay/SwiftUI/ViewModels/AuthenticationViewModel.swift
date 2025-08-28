//
//  AuthenticationViewModel.swift
//  Monay
//
//  SwiftUI Authentication View Model using Combine
//

import SwiftUI
import Combine
import Foundation

class AuthenticationViewModel: ObservableObject {
    
    // MARK: - Published Properties
    @Published var phoneNumber = ""
    @Published var verificationCode = ""
    @Published var userType: UserType = .user
    @Published var isNewUser = false
    @Published var isLoading = false
    @Published var errorMessage = ""
    @Published var showError = false
    
    // Login fields
    @Published var email = ""
    @Published var password = ""
    
    // Signup fields  
    @Published var firstName = ""
    @Published var lastName = ""
    @Published var confirmPassword = ""
    @Published var acceptedTerms = false
    
    // MARK: - Private Properties
    private var cancellables = Set<AnyCancellable>()
    private let authService = AuthenticationService()
    
    // MARK: - Computed Properties
    
    var isPhoneNumberValid: Bool {
        phoneNumber.count >= 10 && phoneNumber.allSatisfy { $0.isNumber }
    }
    
    var isVerificationCodeValid: Bool {
        verificationCode.count == 6 && verificationCode.allSatisfy { $0.isNumber }
    }
    
    var isLoginValid: Bool {
        !email.isEmpty && !password.isEmpty && email.contains("@")
    }
    
    var isSignupValid: Bool {
        !firstName.isEmpty && 
        !lastName.isEmpty && 
        !email.isEmpty && 
        email.contains("@") && 
        !password.isEmpty && 
        password == confirmPassword && 
        password.count >= 6 &&
        acceptedTerms
    }
    
    // MARK: - Methods
    
    func sendVerificationCode() {
        isLoading = true
        
        authService.sendVerificationCode(to: phoneNumber)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.showError(error.localizedDescription)
                    }
                },
                receiveValue: { [weak self] response in
                    self?.isNewUser = response.isNewUser
                    // Verification code sent successfully
                }
            )
            .store(in: &cancellables)
    }
    
    func verifyCode() {
        isLoading = true
        
        authService.verifyCode(verificationCode, for: phoneNumber)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.showError(error.localizedDescription)
                    }
                },
                receiveValue: { [weak self] _ in
                    // Verification successful
                    // Navigate to next screen based on isNewUser
                }
            )
            .store(in: &cancellables)
    }
    
    func login() {
        isLoading = true
        
        authService.login(email: email, password: password)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.showError(error.localizedDescription)
                    }
                },
                receiveValue: { [weak self] user in
                    self?.completeAuthentication()
                }
            )
            .store(in: &cancellables)
    }
    
    func signup() {
        isLoading = true
        
        let signupData = SignupData(
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
            phoneNumber: phoneNumber,
            userType: userType
        )
        
        authService.signup(signupData)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.showError(error.localizedDescription)
                    }
                },
                receiveValue: { [weak self] user in
                    self?.completeAuthentication()
                }
            )
            .store(in: &cancellables)
    }
    
    func forgotPassword() {
        isLoading = true
        
        authService.forgotPassword(email: email)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.showError(error.localizedDescription)
                    }
                },
                receiveValue: { [weak self] _ in
                    self?.showError("Password reset link sent to your email")
                }
            )
            .store(in: &cancellables)
    }
    
    func completeAuthentication() {
        // Mark user as logged in
        if let appState = AppState.shared {
            appState.login()
        }
    }
    
    private func showError(_ message: String) {
        errorMessage = message
        showError = true
    }
    
    func clearError() {
        showError = false
        errorMessage = ""
    }
}

// MARK: - Supporting Types

enum UserType: String, CaseIterable {
    case user = "user"
    case merchant = "merchant"
    
    var displayName: String {
        switch self {
        case .user:
            return "Individual User"
        case .merchant:
            return "Merchant"
        }
    }
}

struct SignupData {
    let firstName: String
    let lastName: String
    let email: String
    let password: String
    let phoneNumber: String
    let userType: UserType
}

// Extension to make AppState accessible
extension AppState {
    static var shared: AppState?
}