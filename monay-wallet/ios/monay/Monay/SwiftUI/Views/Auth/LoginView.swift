//
//  LoginView.swift
//  Monay
//
//  SwiftUI Login View
//

import SwiftUI

struct LoginView: View {
    @EnvironmentObject var appState: AppState
    @State private var email = ""
    @State private var password = ""
    @State private var showingSignup = false
    @State private var showingForgotPassword = false
    @State private var isLoading = false
    @State private var showError = false
    @State private var errorMessage = ""
    
    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                gradient: Gradient(colors: [Color("blue"), Color("lightBlue")]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 30) {
                    // Logo and Title
                    VStack(spacing: 20) {
                        Image(systemName: "wallet.pass")
                            .font(.system(size: 80))
                            .foregroundColor(.white)
                        
                        Text("Monay")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                        
                        Text("Your Digital Wallet")
                            .font(.subheadline)
                            .foregroundColor(.white.opacity(0.8))
                    }
                    .padding(.top, 60)
                    
                    // Login Form
                    VStack(spacing: 20) {
                        // Email Field
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Email")
                                .font(.caption)
                                .foregroundColor(.white.opacity(0.8))
                            
                            TextField("Enter your email", text: $email)
                                .textFieldStyle(PlainTextFieldStyle())
                                .padding()
                                .background(Color.white.opacity(0.2))
                                .cornerRadius(10)
                                .foregroundColor(.white)
                                .keyboardType(.emailAddress)
                                .autocapitalization(.none)
                        }
                        
                        // Password Field
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Password")
                                .font(.caption)
                                .foregroundColor(.white.opacity(0.8))
                            
                            SecureField("Enter your password", text: $password)
                                .textFieldStyle(PlainTextFieldStyle())
                                .padding()
                                .background(Color.white.opacity(0.2))
                                .cornerRadius(10)
                                .foregroundColor(.white)
                        }
                        
                        // Forgot Password
                        HStack {
                            Spacer()
                            Button(action: {
                                showingForgotPassword = true
                            }) {
                                Text("Forgot Password?")
                                    .font(.caption)
                                    .foregroundColor(.white.opacity(0.8))
                            }
                        }
                        
                        // Login Button
                        Button(action: {
                            login()
                        }) {
                            if isLoading {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: Color("blue")))
                            } else {
                                Text("Login")
                                    .fontWeight(.semibold)
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: 50)
                        .background(Color.white)
                        .foregroundColor(Color("blue"))
                        .cornerRadius(10)
                        .disabled(isLoading || email.isEmpty || password.isEmpty)
                        
                        // Or divider
                        HStack {
                            Rectangle()
                                .frame(height: 1)
                                .foregroundColor(.white.opacity(0.3))
                            
                            Text("OR")
                                .font(.caption)
                                .foregroundColor(.white.opacity(0.8))
                            
                            Rectangle()
                                .frame(height: 1)
                                .foregroundColor(.white.opacity(0.3))
                        }
                        
                        // Social Login
                        VStack(spacing: 12) {
                            SocialLoginButton(
                                title: "Continue with Apple",
                                icon: "applelogo",
                                action: { loginWithApple() }
                            )
                            
                            SocialLoginButton(
                                title: "Continue with Google",
                                icon: "g.circle",
                                action: { loginWithGoogle() }
                            )
                        }
                        
                        // Sign Up
                        HStack {
                            Text("Don't have an account?")
                                .font(.subheadline)
                                .foregroundColor(.white.opacity(0.8))
                            
                            Button(action: {
                                showingSignup = true
                            }) {
                                Text("Sign Up")
                                    .font(.subheadline)
                                    .fontWeight(.semibold)
                                    .foregroundColor(.white)
                            }
                        }
                        .padding(.top)
                    }
                    .padding(.horizontal)
                    .padding(.vertical, 30)
                    .background(
                        Color.white.opacity(0.1)
                            .background(BlurView(style: .systemUltraThinMaterial))
                    )
                    .cornerRadius(20)
                    .padding(.horizontal)
                }
                .padding(.bottom, 50)
            }
        }
        .navigationBarHidden(true)
        .sheet(isPresented: $showingSignup) {
            SignupView()
        }
        .sheet(isPresented: $showingForgotPassword) {
            ForgotPasswordView()
        }
        .alert("Error", isPresented: $showError) {
            Button("OK") { }
        } message: {
            Text(errorMessage)
        }
    }
    
    // MARK: - Functions
    
    private func login() {
        isLoading = true
        
        // Simulate API call
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            isLoading = false
            
            // For demo, accept any non-empty credentials
            if !email.isEmpty && !password.isEmpty {
                appState.login()
            } else {
                errorMessage = "Invalid credentials"
                showError = true
            }
        }
    }
    
    private func loginWithApple() {
        // Implement Apple Sign In
        print("Login with Apple")
    }
    
    private func loginWithGoogle() {
        // Implement Google Sign In
        print("Login with Google")
    }
}

// MARK: - Social Login Button

struct SocialLoginButton: View {
    let title: String
    let icon: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack {
                Image(systemName: icon)
                    .font(.title3)
                
                Text(title)
                    .fontWeight(.medium)
            }
            .frame(maxWidth: .infinity)
            .frame(height: 44)
            .background(Color.white.opacity(0.2))
            .foregroundColor(.white)
            .cornerRadius(10)
        }
    }
}

// MARK: - Blur View

struct BlurView: UIViewRepresentable {
    let style: UIBlurEffect.Style
    
    func makeUIView(context: Context) -> UIVisualEffectView {
        UIVisualEffectView(effect: UIBlurEffect(style: style))
    }
    
    func updateUIView(_ uiView: UIVisualEffectView, context: Context) {}
}

// MARK: - Preview

struct LoginView_Previews: PreviewProvider {
    static var previews: some View {
        LoginView()
            .environmentObject(AppState())
    }
}