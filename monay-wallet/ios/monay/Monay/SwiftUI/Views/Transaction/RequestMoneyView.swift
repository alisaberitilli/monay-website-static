//
//  RequestMoneyView.swift
//  Monay
//
//  Request Money Flow Implementation
//

import SwiftUI
import Combine
import CoreImage.CIFilterBuiltins

struct RequestMoneyView: View {
    @StateObject private var viewModel = RequestMoneyViewModel()
    @Environment(\.presentationMode) var presentationMode
    @State private var showingContactPicker = false
    @State private var showingShareSheet = false
    @FocusState private var focusedField: Field?
    
    enum Field {
        case amount
        case note
        case requestFrom
    }
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Amount Section
                    amountSection
                    
                    // Request From Section
                    requestFromSection
                    
                    // Note Section
                    noteSection
                    
                    // QR Code Section
                    if viewModel.showQRCode {
                        qrCodeSection
                    }
                    
                    // Action Buttons
                    actionButtons
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Request Money")
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
            .sheet(isPresented: $showingShareSheet) {
                ShareSheet(items: viewModel.shareItems)
            }
            .alert("Request Sent", isPresented: $viewModel.showSuccess) {
                Button("OK") {
                    presentationMode.wrappedValue.dismiss()
                }
            } message: {
                Text(viewModel.successMessage)
            }
        }
    }
    
    // MARK: - Amount Section
    
    private var amountSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Amount to Request")
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
    }
    
    // MARK: - Request From Section
    
    private var requestFromSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Request From (Optional)")
                .font(.headline)
                .foregroundColor(.primary)
            
            HStack(spacing: 12) {
                TextField("Enter contact or leave empty", text: $viewModel.requestFromInput)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .focused($focusedField, equals: .requestFrom)
                    .autocapitalization(.none)
                    .disableAutocorrection(true)
                
                Button(action: { showingContactPicker = true }) {
                    Image(systemName: "person.crop.circle.badge.plus")
                        .font(.title2)
                        .foregroundColor(Color("blue"))
                }
            }
            
            if let recipient = viewModel.selectedRecipient {
                recipientCard(recipient)
            }
            
            Text("Leave empty to generate a shareable payment link")
                .font(.caption)
                .foregroundColor(.secondary)
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
    
    // MARK: - Note Section
    
    private var noteSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("What's it for?")
                .font(.headline)
                .foregroundColor(.primary)
            
            TextField("Add a note (optional)", text: $viewModel.note)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .focused($focusedField, equals: .note)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
    }
    
    // MARK: - QR Code Section
    
    private var qrCodeSection: some View {
        VStack(spacing: 16) {
            Text("Payment Request QR Code")
                .font(.headline)
            
            if let qrImage = viewModel.qrCodeImage {
                Image(uiImage: qrImage)
                    .interpolation(.none)
                    .resizable()
                    .scaledToFit()
                    .frame(width: 200, height: 200)
                    .padding()
                    .background(Color.white)
                    .cornerRadius(12)
            }
            
            VStack(spacing: 8) {
                Text("Request Amount")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                Text(viewModel.formattedAmount)
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(Color("blue"))
                
                if !viewModel.note.isEmpty {
                    Text(viewModel.note)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
            }
            
            HStack(spacing: 20) {
                Button(action: { viewModel.saveQRCode() }) {
                    Label("Save", systemImage: "square.and.arrow.down")
                        .font(.subheadline)
                        .foregroundColor(Color("blue"))
                }
                
                Button(action: { showingShareSheet = true }) {
                    Label("Share", systemImage: "square.and.arrow.up")
                        .font(.subheadline)
                        .foregroundColor(Color("blue"))
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
    }
    
    // MARK: - Action Buttons
    
    private var actionButtons: some View {
        VStack(spacing: 12) {
            if viewModel.selectedRecipient != nil {
                // Send Request Button
                Button(action: {
                    viewModel.sendRequest()
                }) {
                    if viewModel.isProcessing {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    } else {
                        Text("Send Request")
                            .fontWeight(.semibold)
                    }
                }
                .frame(maxWidth: .infinity)
                .frame(height: 50)
                .background(viewModel.canSendRequest ? Color("blue") : Color.gray)
                .foregroundColor(.white)
                .cornerRadius(12)
                .disabled(!viewModel.canSendRequest || viewModel.isProcessing)
            } else {
                // Generate QR/Link Button
                Button(action: {
                    viewModel.generatePaymentRequest()
                }) {
                    Text(viewModel.showQRCode ? "Update QR Code" : "Generate Payment Link")
                        .fontWeight(.semibold)
                }
                .frame(maxWidth: .infinity)
                .frame(height: 50)
                .background(viewModel.canGenerateLink ? Color("blue") : Color.gray)
                .foregroundColor(.white)
                .cornerRadius(12)
                .disabled(!viewModel.canGenerateLink)
            }
        }
    }
}

// MARK: - Request Money View Model

class RequestMoneyViewModel: ObservableObject {
    @Published var amountInput = ""
    @Published var requestFromInput = ""
    @Published var selectedRecipient: Recipient?
    @Published var note = ""
    @Published var isProcessing = false
    @Published var showSuccess = false
    @Published var successMessage = ""
    @Published var amountError: String?
    @Published var showQRCode = false
    @Published var qrCodeImage: UIImage?
    @Published var paymentLink = ""
    
    let currency = "USD"
    private let transactionService = TransactionService()
    private var cancellables = Set<AnyCancellable>()
    
    var amount: Double {
        Double(amountInput) ?? 0
    }
    
    var formattedAmount: String {
        return String(format: "$%.2f", amount)
    }
    
    var canSendRequest: Bool {
        return selectedRecipient != nil && amount > 0 && amountError == nil
    }
    
    var canGenerateLink: Bool {
        return amount > 0 && amountError == nil
    }
    
    var shareItems: [Any] {
        var items: [Any] = []
        
        if !paymentLink.isEmpty {
            let message = "Please pay \(formattedAmount)\(note.isEmpty ? "" : " for \(note)") using this link: \(paymentLink)"
            items.append(message)
        }
        
        if let qrImage = qrCodeImage {
            items.append(qrImage)
        }
        
        return items
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
        requestFromInput = contact.identifier
    }
    
    func clearRecipient() {
        selectedRecipient = nil
        requestFromInput = ""
    }
    
    func setQuickAmount(_ amount: Double) {
        amountInput = String(format: "%.2f", amount)
    }
    
    func validateAmount() {
        guard !amountInput.isEmpty else {
            amountError = nil
            return
        }
        
        guard let amount = Double(amountInput) else {
            amountError = "Invalid amount"
            return
        }
        
        if amount <= 0 {
            amountError = "Amount must be greater than zero"
        } else if amount > 10000 {
            amountError = "Amount exceeds maximum limit"
        } else {
            amountError = nil
        }
    }
    
    func generatePaymentRequest() {
        guard canGenerateLink else { return }
        
        // Generate payment link
        let requestId = UUID().uuidString
        paymentLink = "https://monay.app/pay/\(requestId)"
        
        // Generate QR code
        let qrData = "monay://payment?amount=\(amount)&note=\(note)&requestId=\(requestId)"
        qrCodeImage = generateQRCode(from: qrData)
        
        showQRCode = true
    }
    
    func sendRequest() {
        guard let recipient = selectedRecipient else { return }
        
        isProcessing = true
        
        transactionService.requestMoney(from: recipient.id, amount: amount, note: note.isEmpty ? nil : note)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isProcessing = false
                    if case .failure(let error) = completion {
                        self?.successMessage = "Request failed: \(error.localizedDescription)"
                        self?.showSuccess = true
                    }
                },
                receiveValue: { [weak self] result in
                    self?.successMessage = "Payment request of \(self?.formattedAmount ?? "") sent to \(recipient.name)"
                    self?.showSuccess = true
                }
            )
            .store(in: &cancellables)
    }
    
    func saveQRCode() {
        guard let image = qrCodeImage else { return }
        UIImageWriteToSavedPhotosAlbum(image, nil, nil, nil)
        // TODO: Add proper photo library permission handling and feedback
    }
    
    private func generateQRCode(from string: String) -> UIImage? {
        let context = CIContext()
        let filter = CIFilter.qrCodeGenerator()
        
        filter.setValue(Data(string.utf8), forKey: "inputMessage")
        
        if let outputImage = filter.outputImage {
            let transform = CGAffineTransform(scaleX: 10, y: 10)
            let scaledImage = outputImage.transformed(by: transform)
            
            if let cgImage = context.createCGImage(scaledImage, from: scaledImage.extent) {
                return UIImage(cgImage: cgImage)
            }
        }
        
        return nil
    }
}

// MARK: - Share Sheet

struct ShareSheet: UIViewControllerRepresentable {
    let items: [Any]
    
    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: items, applicationActivities: nil)
    }
    
    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}

// MARK: - Preview

struct RequestMoneyView_Previews: PreviewProvider {
    static var previews: some View {
        RequestMoneyView()
    }
}