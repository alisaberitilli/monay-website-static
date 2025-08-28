//
//  MonayApp.swift
//  Monay
//
//  SwiftUI App Entry Point
//  Migrated from UIKit AppDelegate
//

import SwiftUI
import Firebase

@main
struct MonayApp: App {
    
    // MARK: - App State
    @StateObject private var appState = AppState()
    @StateObject private var authenticationViewModel = AuthenticationViewModel()
    
    init() {
        // Configure Firebase
        FirebaseApp.configure()
        
        // Configure app-wide settings
        configureAppearance()
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appState)
                .environmentObject(authenticationViewModel)
                .onOpenURL { url in
                    handleDeepLink(url)
                }
        }
    }
    
    // MARK: - Private Methods
    
    private func configureAppearance() {
        // Configure global app appearance
        UINavigationBar.appearance().largeTitleTextAttributes = [
            .foregroundColor: UIColor(named: "blue") ?? UIColor.systemBlue
        ]
    }
    
    private func handleDeepLink(_ url: URL) {
        // Handle deep links
        appState.handleDeepLink(url)
    }
}

// MARK: - App State Management

class AppState: ObservableObject {
    @Published var isLoggedIn = false
    @Published var showingSplash = true
    @Published var deepLinkData: [String: Any]?
    
    private let userDefaults = UserDefaults.standard
    private let kIsLoggedInKey = "kIsLoggedIn"
    
    init() {
        self.isLoggedIn = userDefaults.bool(forKey: kIsLoggedInKey)
        
        // Hide splash after delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            self.showingSplash = false
        }
    }
    
    func login() {
        isLoggedIn = true
        userDefaults.set(true, forKey: kIsLoggedInKey)
    }
    
    func logout() {
        isLoggedIn = false
        userDefaults.set(false, forKey: kIsLoggedInKey)
        // Clear user data
        clearUserData()
    }
    
    func handleDeepLink(_ url: URL) {
        // Parse and handle deep links
        print("Handling deep link: \(url)")
        // TODO: Implement deep link handling logic
    }
    
    private func clearUserData() {
        // Clear sensitive user data on logout
        // TODO: Clear keychain, local storage, etc.
    }
}