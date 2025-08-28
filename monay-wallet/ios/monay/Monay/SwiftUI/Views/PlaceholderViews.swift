//
//  PlaceholderViews.swift
//  Monay
//
//  Placeholder views for tabs not yet fully implemented
//

import SwiftUI

// MARK: - Profile View

struct ProfileView: View {
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                Image(systemName: "person.circle")
                    .font(.system(size: 80))
                    .foregroundColor(Color("blue"))
                
                Text("Profile View")
                    .font(.title)
                    .fontWeight(.semibold)
                
                Text("SwiftUI Profile implementation coming soon")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
            .navigationTitle("Profile")
        }
    }
}

// MARK: - Scan View

struct ScanView: View {
    @State private var showingScanner = false
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                Image(systemName: "qrcode.viewfinder")
                    .font(.system(size: 80))
                    .foregroundColor(Color("blue"))
                
                Text("QR Scanner")
                    .font(.title)
                    .fontWeight(.semibold)
                
                Button("Open Scanner") {
                    showingScanner = true
                }
                .font(.headline)
                .foregroundColor(.white)
                .padding()
                .background(Color("blue"))
                .cornerRadius(12)
            }
            .navigationTitle("Scan")
            .sheet(isPresented: $showingScanner) {
                QRScannerView { result in
                    print("Scanned: \(result)")
                    showingScanner = false
                }
            }
        }
    }
}

// MARK: - Transaction View

struct TransactionView: View {
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                Image(systemName: "list.bullet.rectangle")
                    .font(.system(size: 80))
                    .foregroundColor(Color("blue"))
                
                Text("Transactions")
                    .font(.title)
                    .fontWeight(.semibold)
                
                Text("SwiftUI Transaction history coming soon")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
            .navigationTitle("Transactions")
        }
    }
}

// MARK: - More View

struct MoreView: View {
    @EnvironmentObject private var appState: AppState
    
    var body: some View {
        NavigationView {
            List {
                Section {
                    SettingsRow(
                        icon: "person.circle",
                        title: "Edit Profile",
                        action: { print("Edit Profile") }
                    )
                    
                    SettingsRow(
                        icon: "creditcard",
                        title: "My Cards",
                        action: { print("My Cards") }
                    )
                    
                    SettingsRow(
                        icon: "building.columns",
                        title: "Bank Accounts",
                        action: { print("Bank Accounts") }
                    )
                }
                
                Section {
                    SettingsRow(
                        icon: "shield.checkered",
                        title: "Security",
                        action: { print("Security") }
                    )
                    
                    SettingsRow(
                        icon: "bell",
                        title: "Notifications",
                        action: { print("Notifications") }
                    )
                    
                    SettingsRow(
                        icon: "questionmark.circle",
                        title: "Help & Support",
                        action: { print("Help") }
                    )
                }
                
                Section {
                    Button(action: {
                        appState.logout()
                    }) {
                        HStack {
                            Image(systemName: "arrow.right.square")
                                .foregroundColor(.red)
                            Text("Logout")
                                .foregroundColor(.red)
                        }
                    }
                }
            }
            .navigationTitle("More")
        }
    }
}

// MARK: - Settings Row Component

struct SettingsRow: View {
    let icon: String
    let title: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.title3)
                    .foregroundColor(Color("blue"))
                    .frame(width: 24)
                
                Text(title)
                    .foregroundColor(.primary)
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding(.vertical, 4)
        }
    }
}

// MARK: - Authentication Views Placeholders

struct IntroductionView: View {
    let onContinue: () -> Void
    
    var body: some View {
        VStack(spacing: 30) {
            Spacer()
            
            Image("ic_intro_logo")
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(width: 200, height: 200)
            
            VStack(spacing: 12) {
                Text("Welcome to Monay")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                Text("Your digital wallet solution")
                    .font(.headline)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Button("Get Started") {
                onContinue()
            }
            .font(.headline)
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color("blue"))
            .cornerRadius(12)
            .padding(.horizontal)
        }
        .padding()
    }
}

struct UserSelectionView: View {
    let onUserTypeSelected: (UserType) -> Void
    
    var body: some View {
        VStack(spacing: 30) {
            Text("Select Account Type")
                .font(.largeTitle)
                .fontWeight(.bold)
            
            VStack(spacing: 16) {
                UserTypeButton(
                    type: .user,
                    onSelect: onUserTypeSelected
                )
                
                UserTypeButton(
                    type: .merchant,
                    onSelect: onUserTypeSelected
                )
            }
        }
        .padding()
    }
}

struct UserTypeButton: View {
    let type: UserType
    let onSelect: (UserType) -> Void
    
    var body: some View {
        Button(action: { onSelect(type) }) {
            HStack {
                Image(systemName: type == .user ? "person" : "building.2")
                    .font(.title2)
                
                Text(type.displayName)
                    .font(.headline)
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.caption)
            }
            .foregroundColor(.primary)
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(12)
        }
    }
}

struct PhoneNumberView: View {
    let onPhoneEntered: () -> Void
    @State private var phoneNumber = ""
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Enter Phone Number")
                .font(.largeTitle)
                .fontWeight(.bold)
            
            TextField("Phone Number", text: $phoneNumber)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .keyboardType(.phonePad)
            
            Button("Continue") {
                onPhoneEntered()
            }
            .disabled(phoneNumber.isEmpty)
            .font(.headline)
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding()
            .background(phoneNumber.isEmpty ? Color.gray : Color("blue"))
            .cornerRadius(12)
        }
        .padding()
        .navigationTitle("Phone Number")
    }
}

struct VerificationView: View {
    let onVerified: () -> Void
    @State private var code = ""
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Enter Verification Code")
                .font(.largeTitle)
                .fontWeight(.bold)
            
            TextField("6-digit code", text: $code)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .keyboardType(.numberPad)
            
            Button("Verify") {
                onVerified()
            }
            .disabled(code.count != 6)
            .font(.headline)
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding()
            .background(code.count != 6 ? Color.gray : Color("blue"))
            .cornerRadius(12)
        }
        .padding()
        .navigationTitle("Verification")
    }
}

struct SignupView: View {
    let onSignupComplete: () -> Void
    @EnvironmentObject private var authViewModel: AuthenticationViewModel
    
    var body: some View {
        VStack(spacing: 16) {
            Text("Create Account")
                .font(.largeTitle)
                .fontWeight(.bold)
            
            VStack(spacing: 12) {
                TextField("First Name", text: $authViewModel.firstName)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                
                TextField("Last Name", text: $authViewModel.lastName)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                
                TextField("Email", text: $authViewModel.email)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
                
                SecureField("Password", text: $authViewModel.password)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                
                SecureField("Confirm Password", text: $authViewModel.confirmPassword)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
            }
            
            Toggle("I accept terms and conditions", isOn: $authViewModel.acceptedTerms)
            
            Button("Sign Up") {
                onSignupComplete()
            }
            .disabled(!authViewModel.isSignupValid)
            .font(.headline)
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding()
            .background(authViewModel.isSignupValid ? Color("blue") : Color.gray)
            .cornerRadius(12)
        }
        .padding()
        .navigationTitle("Sign Up")
    }
}

struct LoginView: View {
    let onLoginComplete: () -> Void
    @EnvironmentObject private var authViewModel: AuthenticationViewModel
    
    var body: some View {
        VStack(spacing: 16) {
            Text("Welcome Back")
                .font(.largeTitle)
                .fontWeight(.bold)
            
            VStack(spacing: 12) {
                TextField("Email", text: $authViewModel.email)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
                
                SecureField("Password", text: $authViewModel.password)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
            }
            
            Button("Login") {
                onLoginComplete()
            }
            .disabled(!authViewModel.isLoginValid)
            .font(.headline)
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding()
            .background(authViewModel.isLoginValid ? Color("blue") : Color.gray)
            .cornerRadius(12)
        }
        .padding()
        .navigationTitle("Login")
    }
}

struct ForgotPasswordView: View {
    let onBackToLogin: () -> Void
    @State private var email = ""
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Forgot Password")
                .font(.largeTitle)
                .fontWeight(.bold)
            
            TextField("Email", text: $email)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .keyboardType(.emailAddress)
                .autocapitalization(.none)
            
            Button("Reset Password") {
                // Handle password reset
            }
            .font(.headline)
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color("blue"))
            .cornerRadius(12)
            
            Button("Back to Login") {
                onBackToLogin()
            }
            .foregroundColor(Color("blue"))
        }
        .padding()
        .navigationTitle("Reset Password")
    }
}

// MARK: - Previews

struct PlaceholderViews_Previews: PreviewProvider {
    static var previews: some View {
        Group {
            ProfileView()
            ScanView()
            TransactionView()
            MoreView()
                .environmentObject(AppState())
        }
    }
}