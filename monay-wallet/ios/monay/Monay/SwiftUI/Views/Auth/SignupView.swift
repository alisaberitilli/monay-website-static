//
//  SignupView.swift
//  Monay
//
//  SwiftUI Signup View
//

import SwiftUI

struct SignupView: View {
    @Environment(\.presentationMode) var presentationMode
    @EnvironmentObject var appState: AppState
    @State private var fullName = ""
    @State private var email = ""
    @State private var phone = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var agreeToTerms = false
    @State private var isLoading = false
    @State private var showError = false
    @State private var errorMessage = ""
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 25) {
                    // Header
                    VStack(spacing: 10) {
                        Image(systemName: "person.badge.plus")
                            .font(.system(size: 60))
                            .foregroundColor(Color("blue"))
                        
                        Text("Create Account")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                        
                        Text("Join Monay and start managing your money")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.top, 20)
                    
                    // Form Fields
                    VStack(spacing: 20) {
                        CustomTextField(
                            title: "Full Name",
                            text: $fullName,
                            placeholder: "Enter your full name",
                            icon: "person"
                        )
                        
                        CustomTextField(
                            title: "Email",
                            text: $email,
                            placeholder: "Enter your email",
                            icon: "envelope",
                            keyboardType: .emailAddress
                        )
                        
                        CustomTextField(
                            title: "Phone Number",
                            text: $phone,
                            placeholder: "Enter your phone number",
                            icon: "phone",
                            keyboardType: .phonePad
                        )
                        
                        CustomSecureField(
                            title: "Password",
                            text: $password,
                            placeholder: "Create a password",
                            icon: "lock"
                        )
                        
                        CustomSecureField(
                            title: "Confirm Password",
                            text: $confirmPassword,
                            placeholder: "Confirm your password",
                            icon: "lock.fill"
                        )
                        
                        // Terms and Conditions
                        HStack {
                            Button(action: {
                                agreeToTerms.toggle()
                            }) {
                                Image(systemName: agreeToTerms ? "checkmark.square.fill" : "square")
                                    .foregroundColor(Color("blue"))
                            }
                            
                            Text("I agree to the ")
                                .font(.caption)
                            +
                            Text("Terms & Conditions")
                                .font(.caption)
                                .foregroundColor(Color("blue"))
                                .underline()
                            +
                            Text(" and ")
                                .font(.caption)
                            +
                            Text("Privacy Policy")
                                .font(.caption)
                                .foregroundColor(Color("blue"))
                                .underline()
                        }
                        
                        // Sign Up Button
                        Button(action: {
                            signUp()
                        }) {
                            if isLoading {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            } else {
                                Text("Sign Up")
                                    .fontWeight(.semibold)
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: 50)
                        .background(isFormValid ? Color("blue") : Color.gray)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                        .disabled(!isFormValid || isLoading)
                        
                        // Already have account
                        HStack {
                            Text("Already have an account?")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                            
                            Button(action: {
                                presentationMode.wrappedValue.dismiss()
                            }) {
                                Text("Login")
                                    .font(.subheadline)
                                    .fontWeight(.semibold)
                                    .foregroundColor(Color("blue"))
                            }
                        }
                    }
                    .padding(.horizontal)
                }
                .padding(.bottom, 30)
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        presentationMode.wrappedValue.dismiss()
                    }
                }
            }
            .alert("Error", isPresented: $showError) {
                Button("OK") { }
            } message: {
                Text(errorMessage)
            }
        }
    }
    
    // MARK: - Computed Properties
    
    private var isFormValid: Bool {
        !fullName.isEmpty &&
        !email.isEmpty &&
        !phone.isEmpty &&
        !password.isEmpty &&
        password == confirmPassword &&
        password.count >= 8 &&
        agreeToTerms
    }
    
    // MARK: - Functions
    
    private func signUp() {
        guard isFormValid else { return }
        
        isLoading = true
        
        // Simulate API call
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            isLoading = false
            
            // For demo, always succeed
            appState.login()
            presentationMode.wrappedValue.dismiss()
        }
    }
}

// MARK: - Custom Text Field

struct CustomTextField: View {
    let title: String
    @Binding var text: String
    let placeholder: String
    let icon: String
    var keyboardType: UIKeyboardType = .default
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
            
            HStack {
                Image(systemName: icon)
                    .foregroundColor(.secondary)
                    .frame(width: 20)
                
                TextField(placeholder, text: $text)
                    .keyboardType(keyboardType)
                    .autocapitalization(keyboardType == .emailAddress ? .none : .words)
            }
            .padding()
            .background(Color(.secondarySystemBackground))
            .cornerRadius(10)
        }
    }
}

// MARK: - Custom Secure Field

struct CustomSecureField: View {
    let title: String
    @Binding var text: String
    let placeholder: String
    let icon: String
    @State private var isSecure = true
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
            
            HStack {
                Image(systemName: icon)
                    .foregroundColor(.secondary)
                    .frame(width: 20)
                
                if isSecure {
                    SecureField(placeholder, text: $text)
                } else {
                    TextField(placeholder, text: $text)
                }
                
                Button(action: {
                    isSecure.toggle()
                }) {
                    Image(systemName: isSecure ? "eye.slash" : "eye")
                        .foregroundColor(.secondary)
                }
            }
            .padding()
            .background(Color(.secondarySystemBackground))
            .cornerRadius(10)
        }
    }
}

// MARK: - Forgot Password View

struct ForgotPasswordView: View {
    @Environment(\.presentationMode) var presentationMode
    @State private var email = ""
    @State private var isLoading = false
    @State private var showSuccess = false
    
    var body: some View {
        NavigationView {
            VStack(spacing: 30) {
                // Icon
                Image(systemName: "key.horizontal")
                    .font(.system(size: 60))
                    .foregroundColor(Color("blue"))
                    .padding(.top, 40)
                
                // Title
                VStack(spacing: 10) {
                    Text("Forgot Password?")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                    
                    Text("Enter your email and we'll send you instructions to reset your password")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }
                
                // Email Field
                CustomTextField(
                    title: "Email",
                    text: $email,
                    placeholder: "Enter your email",
                    icon: "envelope",
                    keyboardType: .emailAddress
                )
                .padding(.horizontal)
                
                // Send Button
                Button(action: {
                    sendResetLink()
                }) {
                    if isLoading {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    } else {
                        Text("Send Reset Link")
                            .fontWeight(.semibold)
                    }
                }
                .frame(maxWidth: .infinity)
                .frame(height: 50)
                .background(!email.isEmpty ? Color("blue") : Color.gray)
                .foregroundColor(.white)
                .cornerRadius(12)
                .padding(.horizontal)
                .disabled(email.isEmpty || isLoading)
                
                Spacer()
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        presentationMode.wrappedValue.dismiss()
                    }
                }
            }
            .alert("Success", isPresented: $showSuccess) {
                Button("OK") {
                    presentationMode.wrappedValue.dismiss()
                }
            } message: {
                Text("Password reset link has been sent to your email")
            }
        }
    }
    
    private func sendResetLink() {
        isLoading = true
        
        // Simulate API call
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            isLoading = false
            showSuccess = true
        }
    }
}

// MARK: - Preview

struct SignupView_Previews: PreviewProvider {
    static var previews: some View {
        SignupView()
            .environmentObject(AppState())
    }
}