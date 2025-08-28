//
//  SignupFlowView.swift
//  Monay
//
//  SwiftUI Signup Flow with Multiple Steps
//

import SwiftUI

struct SignupFlowView: View {
    @EnvironmentObject private var authViewModel: AuthenticationViewModel
    @Environment(\.presentationMode) var presentationMode
    @State private var currentStep: SignupStep = .userType
    
    enum SignupStep: Int, CaseIterable {
        case userType = 0
        case phoneNumber = 1
        case verification = 2
        case personalInfo = 3
        case password = 4
        
        var title: String {
            switch self {
            case .userType: return "Select Account Type"
            case .phoneNumber: return "Phone Number"
            case .verification: return "Verification"
            case .personalInfo: return "Personal Information"
            case .password: return "Create Password"
            }
        }
    }
    
    var body: some View {
        NavigationView {
            VStack {
                // Progress indicator
                ProgressBar(currentStep: currentStep.rawValue, totalSteps: SignupStep.allCases.count)
                    .padding()
                
                // Step title
                Text(currentStep.title)
                    .font(.title2)
                    .fontWeight(.bold)
                    .padding(.bottom)
                
                // Step content
                Group {
                    switch currentStep {
                    case .userType:
                        UserTypeSelectionView(onNext: {
                            withAnimation {
                                currentStep = .phoneNumber
                            }
                        })
                    case .phoneNumber:
                        PhoneNumberInputView(onNext: {
                            withAnimation {
                                currentStep = .verification
                            }
                        })
                    case .verification:
                        VerificationCodeView(onNext: {
                            withAnimation {
                                currentStep = .personalInfo
                            }
                        })
                    case .personalInfo:
                        PersonalInfoView(onNext: {
                            withAnimation {
                                currentStep = .password
                            }
                        })
                    case .password:
                        CreatePasswordView(onComplete: completeSignup)
                    }
                }
                
                Spacer()
            }
            .navigationBarItems(
                leading: Button("Cancel") {
                    presentationMode.wrappedValue.dismiss()
                },
                trailing: currentStep.rawValue > 0 ?
                    AnyView(Button("Back") {
                        withAnimation {
                            currentStep = SignupStep(rawValue: currentStep.rawValue - 1) ?? .userType
                        }
                    }) : AnyView(EmptyView())
            )
        }
    }
    
    private func completeSignup() {
        authViewModel.completeSignup { success, error in
            if success {
                presentationMode.wrappedValue.dismiss()
            }
        }
    }
}

// MARK: - Progress Bar

struct ProgressBar: View {
    let currentStep: Int
    let totalSteps: Int
    
    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .leading) {
                RoundedRectangle(cornerRadius: 4)
                    .fill(Color.gray.opacity(0.2))
                    .frame(height: 8)
                
                RoundedRectangle(cornerRadius: 4)
                    .fill(Color("blue"))
                    .frame(width: geometry.size.width * CGFloat(currentStep + 1) / CGFloat(totalSteps), height: 8)
                    .animation(.easeInOut(duration: 0.3), value: currentStep)
            }
        }
        .frame(height: 8)
    }
}

// MARK: - User Type Selection

struct UserTypeSelectionView: View {
    @EnvironmentObject private var authViewModel: AuthenticationViewModel
    let onNext: () -> Void
    
    var body: some View {
        VStack(spacing: 20) {
            Text("How will you use Monay?")
                .font(.headline)
                .foregroundColor(.secondary)
            
            VStack(spacing: 16) {
                UserTypeCard(
                    type: .user,
                    isSelected: authViewModel.selectedUserType == .user
                ) {
                    authViewModel.selectedUserType = .user
                }
                
                UserTypeCard(
                    type: .merchant,
                    isSelected: authViewModel.selectedUserType == .merchant
                ) {
                    authViewModel.selectedUserType = .merchant
                }
            }
            .padding()
            
            Button(action: onNext) {
                Text("Continue")
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(authViewModel.selectedUserType != nil ? Color("blue") : Color.gray.opacity(0.3))
                    .foregroundColor(.white)
                    .cornerRadius(12)
            }
            .disabled(authViewModel.selectedUserType == nil)
            .padding(.horizontal)
        }
    }
}

struct UserTypeCard: View {
    let type: UserType
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack {
                Image(systemName: type == .user ? "person.circle.fill" : "building.2.circle.fill")
                    .font(.largeTitle)
                    .foregroundColor(isSelected ? Color("blue") : .gray)
                
                VStack(alignment: .leading) {
                    Text(type.displayName)
                        .font(.headline)
                        .foregroundColor(.primary)
                    
                    Text(type == .user ? "Personal account for payments" : "Business account for merchants")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(Color("blue"))
                }
            }
            .padding()
            .background(isSelected ? Color("blue").opacity(0.1) : Color(.systemGray6))
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? Color("blue") : Color.clear, lineWidth: 2)
            )
        }
    }
}

// MARK: - Phone Number Input

struct PhoneNumberInputView: View {
    @EnvironmentObject private var authViewModel: AuthenticationViewModel
    @State private var countryCode = "+1"
    @State private var phoneNumber = ""
    let onNext: () -> Void
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Enter your phone number")
                .font(.headline)
                .foregroundColor(.secondary)
            
            HStack {
                // Country code picker
                Menu {
                    Button("+1 USA") { countryCode = "+1" }
                    Button("+44 UK") { countryCode = "+44" }
                    Button("+91 India") { countryCode = "+91" }
                } label: {
                    HStack {
                        Text(countryCode)
                        Image(systemName: "chevron.down")
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(8)
                }
                
                // Phone number field
                TextField("Phone number", text: $phoneNumber)
                    .keyboardType(.phonePad)
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(8)
            }
            .padding(.horizontal)
            
            Text("We'll send you a verification code")
                .font(.caption)
                .foregroundColor(.secondary)
            
            Button(action: {
                authViewModel.phoneNumber = countryCode + phoneNumber
                authViewModel.sendVerificationCode()
                onNext()
            }) {
                Text("Send Code")
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(phoneNumber.count >= 10 ? Color("blue") : Color.gray.opacity(0.3))
                    .foregroundColor(.white)
                    .cornerRadius(12)
            }
            .disabled(phoneNumber.count < 10)
            .padding(.horizontal)
        }
    }
}

// MARK: - Verification Code

struct VerificationCodeView: View {
    @EnvironmentObject private var authViewModel: AuthenticationViewModel
    @State private var code = ""
    @State private var timeRemaining = 60
    @State private var canResend = false
    let onNext: () -> Void
    
    let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Enter verification code")
                .font(.headline)
                .foregroundColor(.secondary)
            
            Text("Code sent to \(authViewModel.phoneNumber ?? "")")
                .font(.caption)
                .foregroundColor(.secondary)
            
            // OTP input
            HStack(spacing: 10) {
                ForEach(0..<6) { index in
                    OTPDigitField(text: binding(for: index))
                }
            }
            .padding(.horizontal)
            
            if !canResend {
                Text("Resend code in \(timeRemaining)s")
                    .font(.caption)
                    .foregroundColor(.secondary)
            } else {
                Button("Resend Code") {
                    authViewModel.sendVerificationCode()
                    timeRemaining = 60
                    canResend = false
                }
                .foregroundColor(Color("blue"))
            }
            
            Button(action: {
                authViewModel.verificationCode = code
                authViewModel.verifyCode()
                onNext()
            }) {
                Text("Verify")
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(code.count == 6 ? Color("blue") : Color.gray.opacity(0.3))
                    .foregroundColor(.white)
                    .cornerRadius(12)
            }
            .disabled(code.count != 6)
            .padding(.horizontal)
        }
        .onReceive(timer) { _ in
            if timeRemaining > 0 {
                timeRemaining -= 1
            } else {
                canResend = true
            }
        }
    }
    
    private func binding(for index: Int) -> Binding<String> {
        Binding<String>(
            get: {
                if index < code.count {
                    return String(code[code.index(code.startIndex, offsetBy: index)])
                }
                return ""
            },
            set: { newValue in
                if newValue.count <= 1 {
                    if index < code.count {
                        code.remove(at: code.index(code.startIndex, offsetBy: index))
                    }
                    if !newValue.isEmpty {
                        code.insert(contentsOf: newValue, at: code.index(code.startIndex, offsetBy: index))
                    }
                }
            }
        )
    }
}

struct OTPDigitField: View {
    @Binding var text: String
    
    var body: some View {
        TextField("", text: $text)
            .keyboardType(.numberPad)
            .multilineTextAlignment(.center)
            .frame(width: 40, height: 50)
            .background(Color(.systemGray6))
            .cornerRadius(8)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(text.isEmpty ? Color.gray.opacity(0.3) : Color("blue"), lineWidth: 1)
            )
    }
}

// MARK: - Personal Information

struct PersonalInfoView: View {
    @EnvironmentObject private var authViewModel: AuthenticationViewModel
    let onNext: () -> Void
    
    var body: some View {
        VStack(spacing: 16) {
            Group {
                FloatingTextField(title: "First Name", text: $authViewModel.firstName)
                FloatingTextField(title: "Last Name", text: $authViewModel.lastName)
                FloatingTextField(title: "Email", text: $authViewModel.email)
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
            }
            .padding(.horizontal)
            
            Button(action: onNext) {
                Text("Continue")
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(isFormValid ? Color("blue") : Color.gray.opacity(0.3))
                    .foregroundColor(.white)
                    .cornerRadius(12)
            }
            .disabled(!isFormValid)
            .padding(.horizontal)
        }
    }
    
    private var isFormValid: Bool {
        !authViewModel.firstName.isEmpty &&
        !authViewModel.lastName.isEmpty &&
        !authViewModel.email.isEmpty &&
        authViewModel.email.contains("@")
    }
}

// MARK: - Create Password

struct CreatePasswordView: View {
    @EnvironmentObject private var authViewModel: AuthenticationViewModel
    @State private var confirmPassword = ""
    @State private var acceptTerms = false
    let onComplete: () -> Void
    
    var body: some View {
        VStack(spacing: 16) {
            SecureFloatingTextField(title: "Password", text: $authViewModel.password)
                .padding(.horizontal)
            
            SecureFloatingTextField(title: "Confirm Password", text: $confirmPassword)
                .padding(.horizontal)
            
            // Password requirements
            VStack(alignment: .leading, spacing: 4) {
                PasswordRequirement(text: "At least 8 characters", isMet: authViewModel.password.count >= 8)
                PasswordRequirement(text: "Contains uppercase letter", isMet: authViewModel.password.range(of: "[A-Z]", options: .regularExpression) != nil)
                PasswordRequirement(text: "Contains lowercase letter", isMet: authViewModel.password.range(of: "[a-z]", options: .regularExpression) != nil)
                PasswordRequirement(text: "Contains number", isMet: authViewModel.password.range(of: "[0-9]", options: .regularExpression) != nil)
            }
            .padding(.horizontal)
            
            // Terms and conditions
            HStack {
                Button(action: { acceptTerms.toggle() }) {
                    Image(systemName: acceptTerms ? "checkmark.square.fill" : "square")
                        .foregroundColor(acceptTerms ? Color("blue") : .gray)
                }
                
                Text("I accept the ")
                    .foregroundColor(.secondary) +
                Text("Terms and Conditions")
                    .foregroundColor(Color("blue"))
                    .underline()
                
                Spacer()
            }
            .padding(.horizontal)
            
            Button(action: onComplete) {
                Text("Create Account")
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(isFormValid ? Color("blue") : Color.gray.opacity(0.3))
                    .foregroundColor(.white)
                    .cornerRadius(12)
            }
            .disabled(!isFormValid)
            .padding(.horizontal)
        }
    }
    
    private var isFormValid: Bool {
        authViewModel.password.count >= 8 &&
        authViewModel.password == confirmPassword &&
        acceptTerms
    }
}

struct PasswordRequirement: View {
    let text: String
    let isMet: Bool
    
    var body: some View {
        HStack {
            Image(systemName: isMet ? "checkmark.circle.fill" : "circle")
                .foregroundColor(isMet ? .green : .gray)
                .font(.caption)
            
            Text(text)
                .font(.caption)
                .foregroundColor(isMet ? .primary : .secondary)
        }
    }
}

// MARK: - Custom Text Fields

struct FloatingTextField: View {
    let title: String
    @Binding var text: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
            
            TextField(title, text: $text)
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(8)
        }
    }
}

struct SecureFloatingTextField: View {
    let title: String
    @Binding var text: String
    @State private var showPassword = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
            
            HStack {
                if showPassword {
                    TextField(title, text: $text)
                } else {
                    SecureField(title, text: $text)
                }
                
                Button(action: { showPassword.toggle() }) {
                    Image(systemName: showPassword ? "eye.slash" : "eye")
                        .foregroundColor(.secondary)
                }
            }
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(8)
        }
    }
}

// MARK: - Preview

struct SignupFlowView_Previews: PreviewProvider {
    static var previews: some View {
        SignupFlowView()
            .environmentObject(AuthenticationViewModel())
    }
}