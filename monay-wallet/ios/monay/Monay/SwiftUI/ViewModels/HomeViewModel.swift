//
//  HomeViewModel.swift
//  Monay
//
//  SwiftUI Home View Model using Combine
//

import SwiftUI
import Combine
import Foundation

class HomeViewModel: ObservableObject {
    
    // MARK: - Published Properties
    @Published var userName = "User"
    @Published var profileImageURL = ""
    @Published var walletBalance: Double = 0.0
    @Published var currency = "USD"
    @Published var isBalanceVisible = true
    @Published var kycStatus: KYCStatus = .pending
    @Published var unreadNotifications = 0
    @Published var recentTransactions: [Transaction] = []
    @Published var isLoading = false
    @Published var errorMessage = ""
    @Published var showError = false
    @Published var showSendMoney = false
    @Published var showRequestMoney = false
    @Published var showAddMoney = false
    @Published var showAllTransactions = false
    
    // MARK: - Private Properties
    private var cancellables = Set<AnyCancellable>()
    private let homeService = HomeService()
    private let transactionService = TransactionService()
    
    // MARK: - Computed Properties
    
    var formattedBalance: String {
        return String(format: "%.2f", walletBalance)
    }
    
    // MARK: - Methods
    
    func loadData() {
        isLoading = true
        
        // Load user profile and wallet data
        Publishers.Zip3(
            homeService.fetchUserProfile(),
            homeService.fetchWalletBalance(),
            transactionService.fetchRecentTransactions(limit: 5)
        )
        .receive(on: DispatchQueue.main)
        .sink(
            receiveCompletion: { [weak self] completion in
                self?.isLoading = false
                if case .failure(let error) = completion {
                    self?.showError(error.localizedDescription)
                }
            },
            receiveValue: { [weak self] (profile, balance, transactions) in
                self?.updateData(profile: profile, balance: balance, transactions: transactions)
            }
        )
        .store(in: &cancellables)
    }
    
    @MainActor
    func refreshData() async {
        do {
            async let profileTask = homeService.fetchUserProfile()
            async let balanceTask = homeService.fetchWalletBalance()
            async let transactionsTask = transactionService.fetchRecentTransactions(limit: 5)
            
            let (profile, balance, transactions) = try await (profileTask, balanceTask, transactionsTask)
            updateData(profile: profile, balance: balance, transactions: transactions)
        } catch {
            showError(error.localizedDescription)
        }
    }
    
    func toggleBalanceVisibility() {
        withAnimation(.easeInOut(duration: 0.3)) {
            isBalanceVisible.toggle()
        }
        
        // Save preference
        UserDefaults.standard.set(isBalanceVisible, forKey: "showWalletBalance")
    }
    
    func handleQRResult(_ result: String) {
        // Parse QR code result and handle accordingly
        print("QR Result: \(result)")
        
        // TODO: Implement QR code handling logic
        // Could be payment request, user profile, etc.
    }
    
    func sendMoney() {
        // Navigation will be handled by the view
        showSendMoney = true
    }
    
    func requestMoney() {
        // Navigation will be handled by the view
        showRequestMoney = true
    }
    
    func addMoney() {
        // Navigation will be handled by the view
        showAddMoney = true
    }
    
    func viewAllTransactions() {
        // Navigation will be handled by the view
        showAllTransactions = true
    }
    
    // MARK: - Private Methods
    
    private func updateData(profile: UserProfile, balance: WalletBalance, transactions: [Transaction]) {
        self.userName = "\(profile.firstName) \(profile.lastName)"
        self.profileImageURL = profile.profileImageURL
        self.walletBalance = balance.amount
        self.currency = balance.currency
        self.kycStatus = profile.kycStatus
        self.unreadNotifications = profile.unreadNotifications
        self.recentTransactions = transactions
        
        // Load saved preference for balance visibility
        self.isBalanceVisible = UserDefaults.standard.bool(forKey: "showWalletBalance")
    }
    
    private func showError(_ message: String) {
        errorMessage = message
        showError = true
    }
    
    deinit {
        cancellables.removeAll()
    }
}

// MARK: - Supporting Types

enum KYCStatus {
    case verified
    case pending
    case rejected
    case notStarted
    
    var color: Color {
        switch self {
        case .verified:
            return .green
        case .pending:
            return .orange
        case .rejected:
            return .red
        case .notStarted:
            return .gray
        }
    }
    
    var displayText: String {
        switch self {
        case .verified:
            return "Verified"
        case .pending:
            return "Pending"
        case .rejected:
            return "Rejected"
        case .notStarted:
            return "Not Started"
        }
    }
}

struct UserProfile: Codable {
    let firstName: String
    let lastName: String
    let profileImageURL: String
    let kycStatus: KYCStatus
    let unreadNotifications: Int
}

struct WalletBalance: Codable {
    let amount: Double
    let currency: String
}

struct Transaction: Identifiable, Codable {
    let id: String
    let type: TransactionType
    let amount: Double
    let currency: String
    let date: Date
    let description: String
    let recipientName: String?
    let status: TransactionStatus
}

enum TransactionType: String, Codable {
    case sent = "sent"
    case received = "received"
    case addMoney = "add_money"
    case withdrawal = "withdrawal"
    
    var iconName: String {
        switch self {
        case .sent:
            return "arrow.up.circle.fill"
        case .received:
            return "arrow.down.circle.fill"
        case .addMoney:
            return "plus.circle.fill"
        case .withdrawal:
            return "minus.circle.fill"
        }
    }
    
    var color: Color {
        switch self {
        case .sent, .withdrawal:
            return .red
        case .received, .addMoney:
            return .green
        }
    }
}

enum TransactionStatus: String, Codable {
    case completed = "completed"
    case pending = "pending"
    case failed = "failed"
    case cancelled = "cancelled"
}

// Make KYCStatus conform to Codable
extension KYCStatus: Codable {
    enum CodingKeys: String, CodingKey {
        case rawValue
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let rawValue = try container.decode(String.self, forKey: .rawValue)
        
        switch rawValue {
        case "verified":
            self = .verified
        case "pending":
            self = .pending
        case "rejected":
            self = .rejected
        default:
            self = .notStarted
        }
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        let rawValue: String
        
        switch self {
        case .verified:
            rawValue = "verified"
        case .pending:
            rawValue = "pending"
        case .rejected:
            rawValue = "rejected"
        case .notStarted:
            rawValue = "not_started"
        }
        
        try container.encode(rawValue, forKey: .rawValue)
    }
}