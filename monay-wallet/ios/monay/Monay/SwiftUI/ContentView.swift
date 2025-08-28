//
//  ContentView.swift
//  Monay
//
//  Main Content View with Navigation
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject var appState: AppState
    
    var body: some View {
        ZStack {
            if appState.showOnboarding {
                OnboardingView()
            } else if appState.isLoggedIn {
                MainTabView()
            } else {
                LoginNavigationView()
            }
        }
        .animation(.easeInOut, value: appState.isLoggedIn)
        .animation(.easeInOut, value: appState.showOnboarding)
    }
}

// MARK: - Main Tab View

struct MainTabView: View {
    @EnvironmentObject var appState: AppState
    
    var body: some View {
        TabView(selection: $appState.selectedTab) {
            NavigationView {
                HomeView()
            }
            .tabItem {
                Image(systemName: "house.fill")
                Text("Home")
            }
            .tag(AppState.Tab.home)
            
            NavigationView {
                ScanView()
            }
            .tabItem {
                Image(systemName: "qrcode.viewfinder")
                Text("Scan")
            }
            .tag(AppState.Tab.scan)
            
            NavigationView {
                TransactionHistoryView()
            }
            .tabItem {
                Image(systemName: "arrow.left.arrow.right")
                Text("Transactions")
            }
            .tag(AppState.Tab.transaction)
            
            NavigationView {
                ProfileView()
            }
            .tabItem {
                Image(systemName: "person.fill")
                Text("Profile")
            }
            .tag(AppState.Tab.profile)
            
            NavigationView {
                MoreView()
            }
            .tabItem {
                Image(systemName: "ellipsis")
                Text("More")
            }
            .tag(AppState.Tab.more)
        }
        .accentColor(Color("blue"))
    }
}

// MARK: - Login Navigation

struct LoginNavigationView: View {
    var body: some View {
        NavigationView {
            LoginView()
        }
    }
}

// MARK: - Scan View

struct ScanView: View {
    @State private var showingScanner = false
    @State private var scannedCode = ""
    
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "qrcode.viewfinder")
                .font(.system(size: 100))
                .foregroundColor(Color("blue"))
                .padding()
            
            Text("Scan QR Code")
                .font(.title)
                .fontWeight(.bold)
            
            Text("Scan a QR code to send or receive money")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
            
            Button(action: {
                showingScanner = true
            }) {
                Text("Open Scanner")
                    .fontWeight(.semibold)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color("blue"))
                    .cornerRadius(12)
            }
            .padding(.horizontal)
            
            if !scannedCode.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Last Scanned:")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Text(scannedCode)
                        .font(.footnote)
                        .padding()
                        .background(Color(.secondarySystemBackground))
                        .cornerRadius(8)
                }
                .padding()
            }
        }
        .navigationTitle("Scan")
        .sheet(isPresented: $showingScanner) {
            QRScannerView { code in
                scannedCode = code
                showingScanner = false
                handleScannedCode(code)
            }
        }
    }
    
    private func handleScannedCode(_ code: String) {
        // Handle the scanned QR code
        print("Scanned: \(code)")
    }
}

// MARK: - Profile View

struct ProfileView: View {
    @EnvironmentObject var appState: AppState
    @State private var showingEditProfile = false
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Profile Header
                profileHeader
                
                // Profile Menu Items
                profileMenuItems
                
                // Logout Button
                logoutButton
            }
            .padding()
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("Profile")
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("Edit") {
                    showingEditProfile = true
                }
            }
        }
        .sheet(isPresented: $showingEditProfile) {
            EditProfileView()
        }
    }
    
    private var profileHeader: some View {
        VStack(spacing: 12) {
            Image(systemName: "person.circle.fill")
                .font(.system(size: 80))
                .foregroundColor(Color("blue"))
            
            Text(appState.user?.name ?? "User Name")
                .font(.title2)
                .fontWeight(.semibold)
            
            Text(appState.user?.email ?? "user@example.com")
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            HStack(spacing: 20) {
                VStack {
                    Text("Wallet Balance")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text("$1,234.56")
                        .font(.headline)
                        .fontWeight(.bold)
                }
                
                Divider()
                    .frame(height: 30)
                
                VStack {
                    Text("Points")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text("500")
                        .font(.headline)
                        .fontWeight(.bold)
                }
            }
            .padding()
            .background(Color(.tertiarySystemBackground))
            .cornerRadius(12)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
    }
    
    private var profileMenuItems: some View {
        VStack(spacing: 0) {
            ProfileMenuItem(icon: "creditcard", title: "Payment Methods", action: {})
            ProfileMenuItem(icon: "building.columns", title: "Bank Accounts", action: {})
            ProfileMenuItem(icon: "lock", title: "Security", action: {})
            ProfileMenuItem(icon: "bell", title: "Notifications", action: {})
            ProfileMenuItem(icon: "questionmark.circle", title: "Help & Support", action: {})
            ProfileMenuItem(icon: "doc.text", title: "Terms & Privacy", action: {})
        }
        .background(Color(.systemBackground))
        .cornerRadius(12)
    }
    
    private var logoutButton: some View {
        Button(action: {
            appState.logout()
        }) {
            Text("Logout")
                .fontWeight(.semibold)
                .foregroundColor(.red)
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(12)
        }
    }
}

// MARK: - Profile Menu Item

struct ProfileMenuItem: View {
    let icon: String
    let title: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack {
                Image(systemName: icon)
                    .font(.title3)
                    .foregroundColor(Color("blue"))
                    .frame(width: 30)
                
                Text(title)
                    .foregroundColor(.primary)
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding()
        }
        
        Divider()
            .padding(.leading, 60)
    }
}

// MARK: - More View

struct MoreView: View {
    @EnvironmentObject var appState: AppState
    
    var body: some View {
        List {
            Section("Account") {
                NavigationLink(destination: Text("Settings")) {
                    Label("Settings", systemImage: "gearshape")
                }
                NavigationLink(destination: Text("Privacy")) {
                    Label("Privacy", systemImage: "lock.shield")
                }
            }
            
            Section("Features") {
                NavigationLink(destination: Text("Rewards")) {
                    Label("Rewards", systemImage: "gift")
                }
                NavigationLink(destination: Text("Invite Friends")) {
                    Label("Invite Friends", systemImage: "person.2")
                }
            }
            
            Section("Support") {
                NavigationLink(destination: Text("FAQ")) {
                    Label("FAQ", systemImage: "questionmark.circle")
                }
                NavigationLink(destination: Text("Contact Us")) {
                    Label("Contact Us", systemImage: "envelope")
                }
            }
            
            Section("About") {
                NavigationLink(destination: Text("About Monay")) {
                    Label("About", systemImage: "info.circle")
                }
                NavigationLink(destination: Text("Version 1.0.0")) {
                    Label("Version", systemImage: "app.badge")
                }
            }
        }
        .navigationTitle("More")
        .listStyle(InsetGroupedListStyle())
    }
}

// MARK: - Edit Profile View

struct EditProfileView: View {
    @Environment(\.presentationMode) var presentationMode
    @State private var name = ""
    @State private var email = ""
    @State private var phone = ""
    
    var body: some View {
        NavigationView {
            Form {
                Section("Personal Information") {
                    TextField("Full Name", text: $name)
                    TextField("Email", text: $email)
                        .keyboardType(.emailAddress)
                    TextField("Phone", text: $phone)
                        .keyboardType(.phonePad)
                }
                
                Section("Address") {
                    TextField("Street Address", text: .constant(""))
                    TextField("City", text: .constant(""))
                    TextField("State", text: .constant(""))
                    TextField("Zip Code", text: .constant(""))
                }
            }
            .navigationTitle("Edit Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        presentationMode.wrappedValue.dismiss()
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        // Save profile changes
                        presentationMode.wrappedValue.dismiss()
                    }
                }
            }
        }
    }
}

// MARK: - Preview

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .environmentObject(AppState())
    }
}