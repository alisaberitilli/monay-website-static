//
//  SendMoneyView.swift
//  Monay
//
//  Send Money Flow Implementation
//

import SwiftUI
import Combine

struct SendMoneyView: View {
    @StateObject private var viewModel = SendMoneyViewModel()
    @Environment(\.presentationMode) var presentationMode
    @State private var showingContactPicker = false
    @State private var showingQRScanner = false
    @State private var showingConfirmation = false
    @FocusState private var focusedField: Field?
    
    enum Field {
        case recipient
        case amount
        case note
    }
    
    var body: some View {
        NavigationView {
            ZStack {
                Color(.systemGroupedBackground)
                    .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 20) {
                        // Recipient Section
                        recipientSection
                        
                        // Amount Section
                        amountSection
                        
                        // Note Section
                        noteSection
                        
                        // Fee Information
                        if viewModel.showFeeInfo {
                            feeInfoSection
                        }
                        
                        // Send Button
                        sendButton
                    }
                    .padding()
                }
            }
            .navigationTitle("Send Money")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        presentationMode.wrappedValue.dismiss()
                    }
                }
            }
            .sheet(isPresented: $showingContactPicker) {
                ContactPickerView { contact in
                    viewModel.selectContact(contact)
                    showingContactPicker = false
                }
            }
            .sheet(isPresented: $showingQRScanner) {
                QRScannerView { result in
                    viewModel.handleQRCode(result)
                    showingQRScanner = false
                }
            }
            .alert("Confirm Transaction", isPresented: $showingConfirmation) {
                Button("Cancel", role: .cancel) { }
                Button("Send") {
                    viewModel.sendMoney()
                }
            } message: {
                Text("Send \(viewModel.formattedAmount) to \(viewModel.recipientName)?")
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
    
    // MARK: - Recipient Section
    
    private var recipientSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Send To")
                .font(.headline)
                .foregroundColor(.primary)
            
            HStack(spacing: 12) {
                TextField("Enter phone, email, or username", text: $viewModel.recipientInput)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .focused($focusedField, equals: .recipient)
                    .autocapitalization(.none)
                    .disableAutocorrection(true)
                
                Button(action: { showingContactPicker = true }) {
                    Image(systemName: "person.crop.circle.badge.plus")
                        .font(.title2)
                        .foregroundColor(Color("blue"))
                }
                
                Button(action: { showingQRScanner = true }) {
                    Image(systemName: "qrcode.viewfinder")
                        .font(.title2)
                        .foregroundColor(Color("blue"))
                }
            }
            
            if let recipient = viewModel.selectedRecipient {
                recipientCard(recipient)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
    }
    
    private func recipientCard(_ recipient: Recipient) -> some View {
        HStack(spacing: 12) {
            AsyncImage(url: URL(string: recipient.profileImageURL ?? "")) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Image(systemName: "person.circle.fill")
                    .foregroundColor(.gray)
            }
            .frame(width: 40, height: 40)
            .clipShape(Circle())
            
            VStack(alignment: .leading, spacing: 2) {
                Text(recipient.name)
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                Text(recipient.identifier)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Button(action: { viewModel.clearRecipient() }) {
                Image(systemName: "xmark.circle.fill")
                    .foregroundColor(.secondary)
            }
        }
        .padding(8)
        .background(Color(.secondarySystemBackground))
        .cornerRadius(8)
    }
    
    // MARK: - Amount Section
    
    private var amountSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Amount")
                .font(.headline)
                .foregroundColor(.primary)
            
            HStack {
                Text(viewModel.currency)
                    .font(.title2)
                    .foregroundColor(.secondary)
                
                TextField("0.00", text: $viewModel.amountInput)
                    .keyboardType(.decimalPad)
                    .font(.title)
                    .fontWeight(.semibold)
                    .focused($focusedField, equals: .amount)
                    .multilineTextAlignment(.trailing)
            }
            .padding()
            .background(Color(.secondarySystemBackground))
            .cornerRadius(8)
            
            // Quick amount buttons
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach([10, 20, 50, 100, 200, 500], id: \.self) { amount in
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
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
    }
    
    // MARK: - Note Section
    
    private var noteSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Note (Optional)")
                .font(.headline)
                .foregroundColor(.primary)
            
            TextField("Add a note", text: $viewModel.note)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .focused($focusedField, equals: .note)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
    }
    
    // MARK: - Fee Information
    
    private var feeInfoSection: some View {
        VStack(spacing: 12) {
            HStack {
                Text("Transfer Amount")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                Spacer()
                Text(viewModel.formattedAmount)
                    .font(.subheadline)
                    .fontWeight(.medium)
            }
            
            HStack {
                Text("Service Fee")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                Spacer()
                Text(viewModel.formattedFee)
                    .font(.subheadline)
                    .fontWeight(.medium)
            }
            
            Divider()
            
            HStack {
                Text("Total Amount")
                    .font(.headline)
                Spacer()
                Text(viewModel.formattedTotal)
                    .font(.headline)
                    .fontWeight(.bold)
                    .foregroundColor(Color("blue"))
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
    }
    
    // MARK: - Send Button
    
    private var sendButton: some View {
        Button(action: {
            if viewModel.validateTransaction() {
                showingConfirmation = true
            }
        }) {
            if viewModel.isProcessing {
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
            } else {
                Text("Send Money")
                    .fontWeight(.semibold)
            }
        }
        .frame(maxWidth: .infinity)
        .frame(height: 50)
        .background(viewModel.canSend ? Color("blue") : Color.gray)
        .foregroundColor(.white)
        .cornerRadius(12)
        .disabled(!viewModel.canSend || viewModel.isProcessing)
    }
}

// MARK: - Contact Picker View

struct ContactPickerView: View {
    let onSelect: (Recipient) -> Void
    @State private var searchText = ""
    @State private var contacts: [Recipient] = []
    
    var filteredContacts: [Recipient] {
        if searchText.isEmpty {
            return contacts
        }
        return contacts.filter { 
            $0.name.localizedCaseInsensitiveContains(searchText) ||
            $0.identifier.localizedCaseInsensitiveContains(searchText)
        }
    }
    
    var body: some View {
        NavigationView {
            List(filteredContacts) { contact in
                Button(action: { onSelect(contact) }) {
                    HStack(spacing: 12) {
                        AsyncImage(url: URL(string: contact.profileImageURL ?? "")) { image in
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                        } placeholder: {
                            Image(systemName: "person.circle.fill")
                                .foregroundColor(.gray)
                        }
                        .frame(width: 40, height: 40)
                        .clipShape(Circle())
                        
                        VStack(alignment: .leading) {
                            Text(contact.name)
                                .font(.subheadline)
                                .fontWeight(.medium)
                            
                            Text(contact.identifier)
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        
                        Spacer()
                    }
                }
                .buttonStyle(PlainButtonStyle())
            }
            .searchable(text: $searchText)
            .navigationTitle("Select Contact")
            .navigationBarTitleDisplayMode(.inline)
            .onAppear {
                loadContacts()
            }
        }
    }
    
    func loadContacts() {
        // Mock data - replace with actual API call
        contacts = [
            Recipient(id: "1", name: "John Doe", identifier: "john.doe@email.com", profileImageURL: nil),
            Recipient(id: "2", name: "Jane Smith", identifier: "+1234567890", profileImageURL: nil),
            Recipient(id: "3", name: "Bob Johnson", identifier: "@bobjohnson", profileImageURL: nil)
        ]
    }
}

// MARK: - Send Money View Model

class SendMoneyViewModel: ObservableObject {
    @Published var recipientInput = ""
    @Published var selectedRecipient: Recipient?
    @Published var amountInput = ""
    @Published var note = ""
    @Published var isProcessing = false
    @Published var showResult = false
    @Published var resultMessage = ""
    @Published var transactionSuccess = false
    @Published var amountError: String?
    @Published var showFeeInfo = false
    
    let currency = "USD"
    private let transactionService = TransactionService()
    private var cancellables = Set<AnyCancellable>()
    
    var recipientName: String {
        selectedRecipient?.name ?? recipientInput
    }
    
    var amount: Double {
        Double(amountInput) ?? 0
    }
    
    var fee: Double {
        // Calculate fee based on amount (example: 2% fee)
        return amount * 0.02
    }
    
    var total: Double {
        return amount + fee
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
    
    var canSend: Bool {
        return (selectedRecipient != nil || !recipientInput.isEmpty) && 
               amount > 0 && 
               amountError == nil
    }
    
    init() {
        setupBindings()
    }
    
    private func setupBindings() {
        $amountInput
            .debounce(for: .milliseconds(500), scheduler: RunLoop.main)
            .sink { [weak self] _ in
                self?.validateAmount()
            }
            .store(in: &cancellables)
    }
    
    func selectContact(_ contact: Recipient) {
        selectedRecipient = contact
        recipientInput = contact.identifier
    }
    
    func clearRecipient() {
        selectedRecipient = nil
        recipientInput = ""
    }
    
    func handleQRCode(_ code: String) {
        // Parse QR code and extract recipient information
        recipientInput = code
        // TODO: Implement proper QR code parsing
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
        } else if amount > 10000 {
            amountError = "Amount exceeds maximum limit"
            showFeeInfo = false
        } else {
            amountError = nil
            showFeeInfo = true
        }
    }
    
    func validateTransaction() -> Bool {
        guard canSend else { return false }
        
        // Additional validation logic
        return true
    }
    
    func sendMoney() {
        isProcessing = true
        
        let recipientId = selectedRecipient?.id ?? recipientInput
        
        transactionService.sendMoney(to: recipientId, amount: amount, note: note.isEmpty ? nil : note)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isProcessing = false
                    if case .failure(let error) = completion {
                        self?.resultMessage = "Transaction failed: \(error.localizedDescription)"
                        self?.transactionSuccess = false
                        self?.showResult = true
                    }
                },
                receiveValue: { [weak self] result in
                    self?.resultMessage = "Successfully sent \(self?.formattedAmount ?? "") to \(self?.recipientName ?? "")"
                    self?.transactionSuccess = true
                    self?.showResult = true
                }
            )
            .store(in: &cancellables)
    }
}

// MARK: - Supporting Types

struct Recipient: Identifiable, Codable {
    let id: String
    let name: String
    let identifier: String
    let profileImageURL: String?
}

// MARK: - Preview

struct SendMoneyView_Previews: PreviewProvider {
    static var previews: some View {
        SendMoneyView()
    }
}