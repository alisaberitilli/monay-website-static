//
//  HomeView.swift
//  Monay
//
//  SwiftUI Home View (migrated from HomeVC)
//

import SwiftUI

struct HomeView: View {
    @StateObject private var viewModel = HomeViewModel()
    @State private var showingQRScanner = false
    @State private var showingNotifications = false
    @State private var selectedTransaction: Transaction?
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 0) {
                    // Header Section
                    headerSection
                    
                    // Wallet Balance Card
                    walletBalanceCard
                    
                    // Quick Actions
                    quickActionsSection
                    
                    // Recent Transactions
                    recentTransactionsSection
                    
                    Spacer()
                }
            }
            .refreshable {
                await viewModel.refreshData()
            }
            .navigationTitle("")
            .navigationBarHidden(true)
        }
        .onAppear {
            viewModel.loadData()
        }
        .sheet(isPresented: $showingQRScanner) {
            QRScannerView { result in
                viewModel.handleQRResult(result)
                showingQRScanner = false
            }
        }
        .sheet(isPresented: $viewModel.showSendMoney) {
            SendMoneyView()
        }
        .sheet(isPresented: $viewModel.showRequestMoney) {
            RequestMoneyView()
        }
        .sheet(isPresented: $viewModel.showAddMoney) {
            AddMoneyView()
        }
        .sheet(isPresented: $viewModel.showAllTransactions) {
            TransactionHistoryView()
        }
        .sheet(item: $selectedTransaction) { transaction in
            NavigationView {
                TransactionDetailView(transaction: transaction)
            }
        }
    }
    
    // MARK: - Header Section
    
    private var headerSection: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                gradient: Gradient(colors: [
                    Color("blue"),
                    Color("lightBlue")
                ]),
                startPoint: .leading,
                endPoint: .trailing
            )
            
            VStack(spacing: 16) {
                // Top row with greeting and notifications
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Good \(greetingText)")
                            .font(.subheadline)
                            .foregroundColor(.white.opacity(0.8))
                        
                        Text(viewModel.userName)
                            .font(.title2)
                            .fontWeight(.semibold)
                            .foregroundColor(.white)
                    }
                    
                    Spacer()
                    
                    Button(action: {
                        showingNotifications = true
                    }) {
                        Image(systemName: "bell")
                            .font(.title2)
                            .foregroundColor(.white)
                            .overlay(
                                // Notification badge
                                viewModel.unreadNotifications > 0 ?
                                Circle()
                                    .fill(Color.red)
                                    .frame(width: 8, height: 8)
                                    .offset(x: 8, y: -8)
                                : nil
                            )
                    }
                }
                
                // Profile image and KYC status
                HStack(spacing: 12) {
                    // Profile image
                    AsyncImage(url: URL(string: viewModel.profileImageURL)) { image in
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    } placeholder: {
                        Image(systemName: "person.circle.fill")
                            .foregroundColor(.white.opacity(0.7))
                    }
                    .frame(width: 60, height: 60)
                    .clipShape(Circle())
                    
                    VStack(alignment: .leading, spacing: 4) {
                        Text("KYC Status")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.8))
                        
                        HStack {
                            Circle()
                                .fill(viewModel.kycStatus.color)
                                .frame(width: 8, height: 8)
                            
                            Text(viewModel.kycStatus.displayText)
                                .font(.footnote)
                                .fontWeight(.medium)
                                .foregroundColor(.white)
                        }
                    }
                    
                    Spacer()
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
        }
        .frame(height: 140)
    }
    
    // MARK: - Wallet Balance Card
    
    private var walletBalanceCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Wallet Balance")
                    .font(.headline)
                    .foregroundColor(.primary)
                
                Spacer()
                
                Button(action: {
                    viewModel.toggleBalanceVisibility()
                }) {
                    Image(systemName: viewModel.isBalanceVisible ? "eye.slash" : "eye")
                        .foregroundColor(.secondary)
                }
            }
            
            HStack {
                Text(viewModel.isBalanceVisible ? viewModel.formattedBalance : "****")
                    .font(.title)
                    .fontWeight(.bold)
                    .foregroundColor(.primary)
                
                Spacer()
                
                Text(viewModel.currency)
                    .font(.headline)
                    .foregroundColor(.secondary)
            }
        }
        .padding(20)
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 4)
        .padding(.horizontal, 20)
        .offset(y: -20)
    }
    
    // MARK: - Quick Actions
    
    private var quickActionsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Quick Actions")
                .font(.headline)
                .padding(.horizontal, 20)
            
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 4), spacing: 20) {
                QuickActionButton(
                    icon: "qrcode.viewfinder",
                    title: "Scan",
                    action: { showingQRScanner = true }
                )
                
                QuickActionButton(
                    icon: "paperplane",
                    title: "Send",
                    action: viewModel.sendMoney
                )
                
                QuickActionButton(
                    icon: "arrow.down.circle",
                    title: "Request",
                    action: viewModel.requestMoney
                )
                
                QuickActionButton(
                    icon: "plus.circle",
                    title: "Add Money",
                    action: viewModel.addMoney
                )
            }
            .padding(.horizontal, 20)
        }
    }
    
    // MARK: - Recent Transactions
    
    private var recentTransactionsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Recent Transactions")
                    .font(.headline)
                
                Spacer()
                
                Button("View All") {
                    viewModel.viewAllTransactions()
                }
                .font(.subheadline)
                .foregroundColor(Color("blue"))
            }
            .padding(.horizontal, 20)
            
            if viewModel.recentTransactions.isEmpty {
                VStack(spacing: 12) {
                    Image(systemName: "list.bullet.rectangle")
                        .font(.system(size: 50))
                        .foregroundColor(.secondary)
                    
                    Text("No transactions yet")
                        .font(.headline)
                        .foregroundColor(.secondary)
                    
                    Text("Start by sending money or making a payment")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.vertical, 40)
            } else {
                LazyVStack(spacing: 12) {
                    ForEach(viewModel.recentTransactions) { transaction in
                        TransactionRowView(transaction: transaction)
                            .onTapGesture {
                                selectedTransaction = transaction
                            }
                    }
                }
                .padding(.horizontal, 20)
            }
        }
        .padding(.top, 20)
    }
    
    // MARK: - Computed Properties
    
    private var greetingText: String {
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 5..<12: return "Morning"
        case 12..<17: return "Afternoon"
        case 17..<21: return "Evening"
        default: return "Night"
        }
    }
}

// MARK: - Quick Action Button

struct QuickActionButton: View {
    let icon: String
    let title: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundColor(Color("blue"))
                
                Text(title)
                    .font(.caption)
                    .foregroundColor(.primary)
            }
            .frame(width: 70, height: 70)
            .background(Color("lightBlue").opacity(0.1))
            .cornerRadius(12)
        }
    }
}

// MARK: - Preview

struct HomeView_Previews: PreviewProvider {
    static var previews: some View {
        HomeView()
    }
}