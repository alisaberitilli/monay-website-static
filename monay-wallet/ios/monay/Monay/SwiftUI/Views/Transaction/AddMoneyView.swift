//
//  AddMoneyView.swift
//  Monay
//
//  Add Money Flow Implementation
//

import SwiftUI
import Combine

struct AddMoneyView: View {
    @StateObject private var viewModel = AddMoneyViewModel()
    @Environment(\.presentationMode) var presentationMode
    @State private var showingPaymentMethodPicker = false
    @State private var showingBankPicker = false
    @FocusState private var focusedField: Field?
    
    enum Field {
        case amount
        case accountNumber
        case routingNumber
    }
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Amount Section
                    amountSection
                    
                    // Payment Method Section
                    paymentMethodSection
                    
                    // Bank Account Section (if bank transfer selected)
                    if viewModel.selectedPaymentMethod == .bankTransfer {
                        bankAccountSection
                    }
                    
                    // Card Section (if card selected)
                    if viewModel.selectedPaymentMethod == .debitCard || viewModel.selectedPaymentMethod == .creditCard {
                        cardSection
                    }
                    
                    // Fee Information
                    if viewModel.showFeeInfo {
                        feeInfoSection
                    }
                    
                    // Add Money Button
                    addMoneyButton
                    
                    // Security Note
                    securityNote
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Add Money")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        presentationMode.wrappedValue.dismiss()
                    }
                }
            }
            .sheet(isPresented: $showingPaymentMethodPicker) {
                PaymentMethodPicker { method in
                    viewModel.selectPaymentMethod(method)
                    showingPaymentMethodPicker = false
                }
            }
            .sheet(isPresented: $showingBankPicker) {
                BankPicker { bank in
                    viewModel.selectBank(bank)
                    showingBankPicker = false
                }
            }
            .alert("Transaction Result", isPresented: $viewModel.showResult) {
                Button("OK") {
                    if viewModel.transactionSuccess {
                        presentationMode.wrappedValue.dismiss()
                    }
                }
            } message: {
                Text(viewModel.resultMessage)
            }
        }
    }
    
    // MARK: - Amount Section
    
    private var amountSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Amount to Add")
                .font(.headline)
                .foregroundColor(.primary)
            
            HStack {
                Text(viewModel.currency)
                    .font(.title2)
                    .foregroundColor(.secondary)
                
                TextField("0.00", text: $viewModel.amountInput)
                    .keyboardType(.decimalPad)
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .focused($focusedField, equals: .amount)
                    .multilineTextAlignment(.center)
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(12)
            
            // Quick amount buttons
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach([25, 50, 100, 250, 500, 1000], id: \.self) { amount in
                        Button(action: { viewModel.setQuickAmount(Double(amount)) }) {
                            Text("$\(amount)")
                                .font(.subheadline)
                                .fontWeight(.medium)
                                .padding(.horizontal, 16)
                                .padding(.vertical, 8)
                                .background(Color("lightBlue").opacity(0.2))
                                .foregroundColor(Color("blue"))
                                .cornerRadius(20)
                        }
                    }
                }
            }
            
            if let error = viewModel.amountError {
                Text(error)
                    .font(.caption)
                    .foregroundColor(.red)
            }
        }
    }
    
    // MARK: - Payment Method Section
    
    private var paymentMethodSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Payment Method")
                .font(.headline)
                .foregroundColor(.primary)
            
            Button(action: { showingPaymentMethodPicker = true }) {
                HStack {
                    Image(systemName: viewModel.selectedPaymentMethod.iconName)
                        .font(.title2)
                        .foregroundColor(Color("blue"))
                        .frame(width: 30)
                    
                    VStack(alignment: .leading, spacing: 4) {
                        Text(viewModel.selectedPaymentMethod.displayName)
                            .font(.subheadline)
                            .fontWeight(.medium)
                            .foregroundColor(.primary)
                        
                        Text(viewModel.selectedPaymentMethod.description)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                    
                    Image(systemName: "chevron.right")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(12)
            }
            
            // Saved payment methods
            if !viewModel.savedPaymentMethods.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Saved Methods")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    ForEach(viewModel.savedPaymentMethods) { method in
                        SavedPaymentMethodRow(method: method) {
                            viewModel.selectSavedMethod(method)
                        }
                    }
                }
            }
        }
    }
    
    // MARK: - Bank Account Section
    
    private var bankAccountSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Bank Account")
                .font(.headline)
                .foregroundColor(.primary)
            
            // Bank Selection
            Button(action: { showingBankPicker = true }) {
                HStack {
                    Image(systemName: "building.columns")
                        .foregroundColor(Color("blue"))
                    
                    Text(viewModel.selectedBank?.name ?? "Select Bank")
                        .foregroundColor(viewModel.selectedBank != nil ? .primary : .secondary)
                    
                    Spacer()
                    
                    Image(systemName: "chevron.right")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding()
                .background(Color(.secondarySystemBackground))
                .cornerRadius(8)
            }
            
            // Account Number
            TextField("Account Number", text: $viewModel.accountNumber)
                .keyboardType(.numberPad)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .focused($focusedField, equals: .accountNumber)
            
            // Routing Number
            TextField("Routing Number", text: $viewModel.routingNumber)
                .keyboardType(.numberPad)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .focused($focusedField, equals: .routingNumber)
            
            Toggle("Save this account", isOn: $viewModel.saveAccount)
                .font(.subheadline)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
    }
    
    // MARK: - Card Section
    
    private var cardSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Card Details")
                .font(.headline)
                .foregroundColor(.primary)
            
            // Card Number
            TextField("Card Number", text: $viewModel.cardNumber)
                .keyboardType(.numberPad)
                .textFieldStyle(RoundedBorderTextFieldStyle())
            
            HStack(spacing: 12) {
                // Expiry Date
                TextField("MM/YY", text: $viewModel.expiryDate)
                    .keyboardType(.numberPad)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                
                // CVV
                TextField("CVV", text: $viewModel.cvv)
                    .keyboardType(.numberPad)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
            }
            
            // Cardholder Name
            TextField("Cardholder Name", text: $viewModel.cardholderName)
                .textFieldStyle(RoundedBorderTextFieldStyle())
            
            Toggle("Save this card", isOn: $viewModel.saveCard)
                .font(.subheadline)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
    }
    
    // MARK: - Fee Information
    
    private var feeInfoSection: some View {
        VStack(spacing: 12) {
            HStack {
                Text("Amount")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                Spacer()
                Text(viewModel.formattedAmount)
                    .font(.subheadline)
                    .fontWeight(.medium)
            }
            
            HStack {
                Text("Processing Fee")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                Spacer()
                Text(viewModel.formattedFee)
                    .font(.subheadline)
                    .fontWeight(.medium)
            }
            
            Divider()
            
            HStack {
                Text("You'll Receive")
                    .font(.headline)
                Spacer()
                Text(viewModel.formattedTotal)
                    .font(.headline)
                    .fontWeight(.bold)
                    .foregroundColor(Color("blue"))
            }
            
            Text("Funds will be available in \(viewModel.selectedPaymentMethod.processingTime)")
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
    }
    
    // MARK: - Add Money Button
    
    private var addMoneyButton: some View {
        Button(action: {
            viewModel.addMoney()
        }) {
            if viewModel.isProcessing {
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
            } else {
                Text("Add Money")
                    .fontWeight(.semibold)
            }
        }
        .frame(maxWidth: .infinity)
        .frame(height: 50)
        .background(viewModel.canAddMoney ? Color("blue") : Color.gray)
        .foregroundColor(.white)
        .cornerRadius(12)
        .disabled(!viewModel.canAddMoney || viewModel.isProcessing)
    }
    
    // MARK: - Security Note
    
    private var securityNote: some View {
        HStack(spacing: 8) {
            Image(systemName: "lock.shield")
                .font(.caption)
                .foregroundColor(.secondary)
            
            Text("Your payment information is encrypted and secure")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding(.top, 8)
    }
}

// MARK: - Payment Method Picker

struct PaymentMethodPicker: View {
    let onSelect: (PaymentMethod) -> Void
    
    var body: some View {
        NavigationView {
            List(PaymentMethod.allCases) { method in
                Button(action: { onSelect(method) }) {
                    HStack(spacing: 16) {
                        Image(systemName: method.iconName)
                            .font(.title2)
                            .foregroundColor(Color("blue"))
                            .frame(width: 30)
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text(method.displayName)
                                .font(.headline)
                                .foregroundColor(.primary)
                            
                            Text(method.description)
                                .font(.caption)
                                .foregroundColor(.secondary)
                            
                            Text("Fee: \(method.feeDescription) • \(method.processingTime)")
                                .font(.caption2)
                                .foregroundColor(.secondary)
                        }
                        
                        Spacer()
                    }
                    .padding(.vertical, 8)
                }
                .buttonStyle(PlainButtonStyle())
            }
            .navigationTitle("Select Payment Method")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

// MARK: - Bank Picker

struct BankPicker: View {
    let onSelect: (Bank) -> Void
    @State private var searchText = ""
    
    let banks = [
        Bank(id: "1", name: "Bank of America", code: "BOFA"),
        Bank(id: "2", name: "Chase", code: "CHASE"),
        Bank(id: "3", name: "Wells Fargo", code: "WF"),
        Bank(id: "4", name: "Citibank", code: "CITI"),
        Bank(id: "5", name: "US Bank", code: "USB")
    ]
    
    var filteredBanks: [Bank] {
        if searchText.isEmpty {
            return banks
        }
        return banks.filter {
            $0.name.localizedCaseInsensitiveContains(searchText)
        }
    }
    
    var body: some View {
        NavigationView {
            List(filteredBanks) { bank in
                Button(action: { onSelect(bank) }) {
                    HStack {
                        Image(systemName: "building.columns")
                            .foregroundColor(Color("blue"))
                        
                        Text(bank.name)
                            .foregroundColor(.primary)
                        
                        Spacer()
                    }
                }
                .buttonStyle(PlainButtonStyle())
            }
            .searchable(text: $searchText)
            .navigationTitle("Select Bank")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

// MARK: - Saved Payment Method Row

struct SavedPaymentMethodRow: View {
    let method: SavedPaymentMethod
    let onSelect: () -> Void
    
    var body: some View {
        Button(action: onSelect) {
            HStack {
                Image(systemName: method.type.iconName)
                    .foregroundColor(Color("blue"))
                
                VStack(alignment: .leading) {
                    Text(method.displayName)
                        .font(.subheadline)
                        .foregroundColor(.primary)
                    
                    Text(method.lastFourDigits)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                if method.isDefault {
                    Text("Default")
                        .font(.caption)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color("lightBlue").opacity(0.2))
                        .foregroundColor(Color("blue"))
                        .cornerRadius(4)
                }
            }
            .padding(.vertical, 8)
            .padding(.horizontal, 12)
            .background(Color(.secondarySystemBackground))
            .cornerRadius(8)
        }
    }
}

// MARK: - Add Money View Model

class AddMoneyViewModel: ObservableObject {
    @Published var amountInput = ""
    @Published var selectedPaymentMethod: PaymentMethod = .bankTransfer
    @Published var selectedBank: Bank?
    @Published var accountNumber = ""
    @Published var routingNumber = ""
    @Published var cardNumber = ""
    @Published var expiryDate = ""
    @Published var cvv = ""
    @Published var cardholderName = ""
    @Published var saveAccount = false
    @Published var saveCard = false
    @Published var isProcessing = false
    @Published var showResult = false
    @Published var resultMessage = ""
    @Published var transactionSuccess = false
    @Published var amountError: String?
    @Published var showFeeInfo = false
    @Published var savedPaymentMethods: [SavedPaymentMethod] = []
    
    let currency = "USD"
    private var cancellables = Set<AnyCancellable>()
    
    var amount: Double {
        Double(amountInput) ?? 0
    }
    
    var fee: Double {
        return amount * selectedPaymentMethod.feePercentage
    }
    
    var total: Double {
        return amount - fee
    }
    
    var formattedAmount: String {
        return String(format: "$%.2f", amount)
    }
    
    var formattedFee: String {
        return String(format: "$%.2f", fee)
    }
    
    var formattedTotal: String {
        return String(format: "$%.2f", total)
    }
    
    var canAddMoney: Bool {
        guard amount > 0 && amountError == nil else { return false }
        
        switch selectedPaymentMethod {
        case .bankTransfer:
            return selectedBank != nil && !accountNumber.isEmpty && !routingNumber.isEmpty
        case .debitCard, .creditCard:
            return !cardNumber.isEmpty && !expiryDate.isEmpty && !cvv.isEmpty && !cardholderName.isEmpty
        case .applePay, .googlePay:
            return true
        }
    }
    
    init() {
        setupBindings()
        loadSavedPaymentMethods()
    }
    
    private func setupBindings() {
        $amountInput
            .debounce(for: .milliseconds(500), scheduler: RunLoop.main)
            .sink { [weak self] _ in
                self?.validateAmount()
            }
            .store(in: &cancellables)
    }
    
    func selectPaymentMethod(_ method: PaymentMethod) {
        selectedPaymentMethod = method
    }
    
    func selectBank(_ bank: Bank) {
        selectedBank = bank
    }
    
    func selectSavedMethod(_ method: SavedPaymentMethod) {
        // Populate fields with saved method details
    }
    
    func setQuickAmount(_ amount: Double) {
        amountInput = String(format: "%.2f", amount)
    }
    
    func validateAmount() {
        guard !amountInput.isEmpty else {
            amountError = nil
            showFeeInfo = false
            return
        }
        
        guard let amount = Double(amountInput) else {
            amountError = "Invalid amount"
            showFeeInfo = false
            return
        }
        
        if amount <= 0 {
            amountError = "Amount must be greater than zero"
            showFeeInfo = false
        } else if amount < 10 {
            amountError = "Minimum amount is $10"
            showFeeInfo = false
        } else if amount > 10000 {
            amountError = "Maximum amount is $10,000"
            showFeeInfo = false
        } else {
            amountError = nil
            showFeeInfo = true
        }
    }
    
    func addMoney() {
        isProcessing = true
        
        // Simulate API call
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) { [weak self] in
            self?.isProcessing = false
            self?.transactionSuccess = true
            self?.resultMessage = "Successfully added \(self?.formattedTotal ?? "") to your wallet"
            self?.showResult = true
        }
    }
    
    private func loadSavedPaymentMethods() {
        // Load saved payment methods from storage/API
        savedPaymentMethods = [
            SavedPaymentMethod(
                id: "1",
                type: .debitCard,
                displayName: "Visa Debit",
                lastFourDigits: "•••• 4242",
                isDefault: true
            )
        ]
    }
}

// MARK: - Supporting Types

enum PaymentMethod: String, CaseIterable, Identifiable {
    case bankTransfer = "bank_transfer"
    case debitCard = "debit_card"
    case creditCard = "credit_card"
    case applePay = "apple_pay"
    case googlePay = "google_pay"
    
    var id: String { rawValue }
    
    var displayName: String {
        switch self {
        case .bankTransfer: return "Bank Transfer"
        case .debitCard: return "Debit Card"
        case .creditCard: return "Credit Card"
        case .applePay: return "Apple Pay"
        case .googlePay: return "Google Pay"
        }
    }
    
    var iconName: String {
        switch self {
        case .bankTransfer: return "building.columns"
        case .debitCard: return "creditcard"
        case .creditCard: return "creditcard.fill"
        case .applePay: return "applelogo"
        case .googlePay: return "g.circle"
        }
    }
    
    var description: String {
        switch self {
        case .bankTransfer: return "Transfer from bank account"
        case .debitCard: return "Use your debit card"
        case .creditCard: return "Use your credit card"
        case .applePay: return "Quick payment with Apple Pay"
        case .googlePay: return "Quick payment with Google Pay"
        }
    }
    
    var feePercentage: Double {
        switch self {
        case .bankTransfer: return 0.0
        case .debitCard: return 0.015
        case .creditCard: return 0.029
        case .applePay, .googlePay: return 0.015
        }
    }
    
    var feeDescription: String {
        switch self {
        case .bankTransfer: return "Free"
        case .debitCard: return "1.5%"
        case .creditCard: return "2.9%"
        case .applePay, .googlePay: return "1.5%"
        }
    }
    
    var processingTime: String {
        switch self {
        case .bankTransfer: return "3-5 business days"
        case .debitCard, .applePay, .googlePay: return "Instant"
        case .creditCard: return "Instant"
        }
    }
}

struct Bank: Identifiable {
    let id: String
    let name: String
    let code: String
}

struct SavedPaymentMethod: Identifiable {
    let id: String
    let type: PaymentMethod
    let displayName: String
    let lastFourDigits: String
    let isDefault: Bool
}

// MARK: - Preview

struct AddMoneyView_Previews: PreviewProvider {
    static var previews: some View {
        AddMoneyView()
    }
}