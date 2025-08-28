//
//  OnboardingView.swift
//  Monay
//
//  SwiftUI Onboarding View
//

import SwiftUI

struct OnboardingView: View {
    @EnvironmentObject var appState: AppState
    @State private var currentPage = 0
    
    let onboardingPages = [
        OnboardingPage(
            image: "wallet.pass",
            title: "Welcome to Monay",
            description: "Your all-in-one digital wallet for seamless money management",
            color: Color("blue")
        ),
        OnboardingPage(
            image: "paperplane.fill",
            title: "Send Money Instantly",
            description: "Transfer money to friends and family with just a few taps",
            color: Color("lightBlue")
        ),
        OnboardingPage(
            image: "qrcode.viewfinder",
            title: "Scan & Pay",
            description: "Use QR codes for quick and secure payments anywhere",
            color: Color.purple
        ),
        OnboardingPage(
            image: "shield.lefthalf.filled",
            title: "Secure & Private",
            description: "Your transactions are protected with bank-level security",
            color: Color.green
        )
    ]
    
    var body: some View {
        ZStack {
            // Background
            onboardingPages[currentPage].color
                .ignoresSafeArea()
                .animation(.easeInOut, value: currentPage)
            
            VStack {
                // Skip Button
                HStack {
                    Spacer()
                    Button("Skip") {
                        appState.completeOnboarding()
                    }
                    .foregroundColor(.white)
                    .padding()
                }
                
                // Content
                TabView(selection: $currentPage) {
                    ForEach(0..<onboardingPages.count, id: \.self) { index in
                        OnboardingPageView(page: onboardingPages[index])
                            .tag(index)
                    }
                }
                .tabViewStyle(PageTabViewStyle(indexDisplayMode: .never))
                
                // Page Indicator and Continue Button
                VStack(spacing: 30) {
                    // Custom Page Indicator
                    HStack(spacing: 8) {
                        ForEach(0..<onboardingPages.count, id: \.self) { index in
                            Circle()
                                .fill(currentPage == index ? Color.white : Color.white.opacity(0.5))
                                .frame(width: currentPage == index ? 12 : 8,
                                       height: currentPage == index ? 12 : 8)
                                .animation(.spring(), value: currentPage)
                        }
                    }
                    
                    // Continue/Get Started Button
                    Button(action: {
                        if currentPage < onboardingPages.count - 1 {
                            withAnimation {
                                currentPage += 1
                            }
                        } else {
                            appState.completeOnboarding()
                        }
                    }) {
                        Text(currentPage == onboardingPages.count - 1 ? "Get Started" : "Continue")
                            .fontWeight(.semibold)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.white)
                            .foregroundColor(onboardingPages[currentPage].color)
                            .cornerRadius(15)
                    }
                    .padding(.horizontal, 40)
                }
                .padding(.bottom, 50)
            }
        }
    }
}

// MARK: - Onboarding Page Model

struct OnboardingPage {
    let image: String
    let title: String
    let description: String
    let color: Color
}

// MARK: - Onboarding Page View

struct OnboardingPageView: View {
    let page: OnboardingPage
    
    var body: some View {
        VStack(spacing: 40) {
            Spacer()
            
            // Icon
            Image(systemName: page.image)
                .font(.system(size: 100))
                .foregroundColor(.white)
            
            // Title and Description
            VStack(spacing: 20) {
                Text(page.title)
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                    .multilineTextAlignment(.center)
                
                Text(page.description)
                    .font(.body)
                    .foregroundColor(.white.opacity(0.9))
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 40)
            }
            
            Spacer()
            Spacer()
        }
    }
}

// MARK: - Preview

struct OnboardingView_Previews: PreviewProvider {
    static var previews: some View {
        OnboardingView()
            .environmentObject(AppState())
    }
}