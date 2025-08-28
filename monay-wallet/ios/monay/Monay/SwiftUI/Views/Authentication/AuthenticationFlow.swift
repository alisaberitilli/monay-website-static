//
//  AuthenticationFlow.swift
//  Monay
//
//  SwiftUI Authentication Flow Container
//

import SwiftUI

struct AuthenticationFlow: View {
    @State private var currentView: AuthView = .introduction
    @EnvironmentObject private var authViewModel: AuthenticationViewModel
    
    var body: some View {
        NavigationView {
            Group {
                switch currentView {
                case .introduction:
                    IntroductionView(onContinue: {
                        currentView = .userSelection
                    })
                case .userSelection:
                    UserSelectionView(onUserTypeSelected: { userType in
                        authViewModel.userType = userType
                        currentView = .phoneNumber
                    })
                case .phoneNumber:
                    PhoneNumberView(onPhoneEntered: {
                        currentView = .verification
                    })
                case .verification:
                    VerificationView(onVerified: {
                        if authViewModel.isNewUser {
                            currentView = .signup
                        } else {
                            currentView = .login
                        }
                    })
                case .signup:
                    SignupView(onSignupComplete: {
                        authViewModel.completeAuthentication()
                    })
                case .login:
                    LoginView(onLoginComplete: {
                        authViewModel.completeAuthentication()
                    })
                case .forgotPassword:
                    ForgotPasswordView(onBackToLogin: {
                        currentView = .login
                    })
                }
            }
        }
        .navigationViewStyle(StackNavigationViewStyle()) // Prevents split view on iPad
    }
}

// MARK: - Supporting Types

enum AuthView {
    case introduction
    case userSelection
    case phoneNumber
    case verification
    case signup
    case login
    case forgotPassword
}

// MARK: - Preview

struct AuthenticationFlow_Previews: PreviewProvider {
    static var previews: some View {
        AuthenticationFlow()
            .environmentObject(AuthenticationViewModel())
    }
}