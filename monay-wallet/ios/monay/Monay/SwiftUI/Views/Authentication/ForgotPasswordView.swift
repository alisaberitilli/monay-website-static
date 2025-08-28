//
//  ForgotPasswordView.swift
//  Monay
//
//  SwiftUI Forgot Password View
//

import SwiftUI

struct ForgotPasswordView: View {
    @Environment(\.presentationMode) var presentationMode
    @EnvironmentObject private var authViewModel: AuthenticationViewModel
    
    @State private var email = ""
    @State private var isLoading = false
    @State private var showSuccessAlert = false
    @State private var errorMessage: String?
    
    var body: some View {
        NavigationView {
            VStack(spacing: 24) {
                // Icon
                Image(systemName: "lock.circle.fill")
                    .font(.system(size: 80))
                    .foregroundColor(Color("blue"))
                    .padding(.top, 40)
                
                // Title
                VStack(spacing: 8) {
                    Text("Forgot Password?")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                    
                    Text("Enter your email address and we'll send you instructions to reset your password")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }
                
                // Email field
                VStack(alignment: .leading, spacing: 8) {
                    Text("Email Address")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    HStack {
                        Image(systemName: "envelope")
                            .foregroundColor(.secondary)
                        
                        TextField("Enter your email", text: $email)
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)
                            .disableAutocorrection(true)
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                }
                .padding(.horizontal)
                
                // Error message
                if let error = errorMessage {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.red)
                        .padding(.horizontal)
                }
                
                // Submit button
                Button(action: resetPassword) {
                    HStack {
                        if isLoading {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                .scaleEffect(0.8)
                        } else {
                            Text("Reset Password")
                                .fontWeight(.semibold)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(isValidEmail ? Color("blue") : Color.gray.opacity(0.3))
                    .foregroundColor(.white)
                    .cornerRadius(12)
                }
                .disabled(!isValidEmail || isLoading)
                .padding(.horizontal)
                
                Spacer()
                
                // Back to login
                Button("Back to Login") {
                    presentationMode.wrappedValue.dismiss()
                }
                .foregroundColor(Color("blue"))
                .padding(.bottom, 20)
            }
            .navigationBarItems(
                trailing: Button("Cancel") {
                    presentationMode.wrappedValue.dismiss()
                }
            )
            .navigationBarTitle("", displayMode: .inline)
            .alert(isPresented: $showSuccessAlert) {
                Alert(
                    title: Text("Check Your Email"),
                    message: Text("We've sent password reset instructions to \(email)"),
                    dismissButton: .default(Text("OK")) {
                        presentationMode.wrappedValue.dismiss()
                    }
                )
            }
        }
    }
    
    private var isValidEmail: Bool {
        !email.isEmpty && email.contains("@") && email.contains(".")
    }
    
    private func resetPassword() {
        hideKeyboard()
        errorMessage = nil
        isLoading = true
        
        authViewModel.resetPassword(email: email) { success, error in
            isLoading = false
            if success {
                showSuccessAlert = true
            } else {
                errorMessage = error ?? "Failed to send reset email. Please try again."
            }
        }
    }
    
    private func hideKeyboard() {
        UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
    }
}

// MARK: - Preview

struct ForgotPasswordView_Previews: PreviewProvider {
    static var previews: some View {
        ForgotPasswordView()
            .environmentObject(AuthenticationViewModel())
    }
}