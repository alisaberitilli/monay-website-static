//
//  ContentView.swift
//  Monay
//
//  Main SwiftUI Content View - App Root
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var appState: AppState
    @EnvironmentObject private var authViewModel: AuthenticationViewModel
    
    var body: some View {
        ZStack {
            // Main app content
            if appState.showingSplash {
                SplashView()
            } else if appState.isLoggedIn {
                MainTabView()
            } else {
                AuthenticationFlow()
            }
        }
        .animation(.easeInOut(duration: 0.3), value: appState.showingSplash)
        .animation(.easeInOut(duration: 0.3), value: appState.isLoggedIn)
    }
}

// MARK: - Preview

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .environmentObject(AppState())
            .environmentObject(AuthenticationViewModel())
    }
}