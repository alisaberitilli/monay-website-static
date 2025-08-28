//
//  TransactionDetailView.swift
//  Monay
//
//  Transaction Detail View Implementation
//

import SwiftUI

struct TransactionDetailView: View {
    let transaction: Transaction
    @StateObject private var viewModel = TransactionDetailViewModel()
    @Environment(\.presentationMode) var presentationMode
    @State private var showingShareSheet = false
    @State private var showingReportIssue = false
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Transaction Icon and Amount
                headerSection
                
                // Status Section
                statusSection
                
                // Transaction Details
                detailsSection
                
                // Participants Section
                participantsSection
                
                // Timeline Section
                timelineSection
                
                // Action Buttons
                actionButtons
            }
            .padding()
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("Transaction Details")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button(action: { showingShareSheet = true }) {
                    Image(systemName: "square.and.arrow.up")
                }
            }
        }
        .sheet(isPresented: $showingShareSheet) {
            ShareSheet(items: [viewModel.getReceiptText(for: transaction)])
        }
        .sheet(isPresented: $showingReportIssue) {
            ReportIssueView(transaction: transaction)
        }
        .onAppear {
            viewModel.loadTransactionDetails(transaction.id)
        }
    }
    
    // MARK: - Header Section
    
    private var headerSection: some View {
        VStack(spacing: 16) {
            // Transaction Icon
            Image(systemName: transaction.type.iconName)
                .font(.system(size: 50))
                .foregroundColor(transaction.type.color)
                .padding()
                .background(transaction.type.color.opacity(0.1))
                .clipShape(Circle())
            
            // Amount
            Text("\(transaction.type == .sent || transaction.type == .withdrawal ? "-" : "+")\(String(format: "%.2f", transaction.amount))")
                .font(.largeTitle)
                .fontWeight(.bold)
                .foregroundColor(transaction.type.color)
            
            Text(transaction.currency)
                .font(.headline)
                .foregroundColor(.secondary)
            
            // Description
            Text(transaction.description)
                .font(.headline)
                .multilineTextAlignment(.center)
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(Color(.systemBackground))
        .cornerRadius(12)
    }
    
    // MARK: - Status Section
    
    private var statusSection: some View {
        HStack {
            Label {
                Text("Status")
                    .foregroundColor(.secondary)
            } icon: {
                Image(systemName: "info.circle")
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            HStack(spacing: 6) {
                Circle()
                    .fill(transaction.status.color)
                    .frame(width: 8, height: 8)
                
                Text(transaction.status.displayText)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(transaction.status.color)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(transaction.status.color.opacity(0.1))
            .cornerRadius(20)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
    }
    
    // MARK: - Details Section
    
    private var detailsSection: some View {
        VStack(spacing: 16) {
            Text("Transaction Details")
                .font(.headline)
                .frame(maxWidth: .infinity, alignment: .leading)
            
            VStack(spacing: 12) {
                DetailRow(label: "Transaction ID", value: transaction.id)
                
                DetailRow(label: "Date", value: formatDate(transaction.date))
                
                DetailRow(label: "Time", value: formatTime(transaction.date))
                
                if let fee = viewModel.transactionFee {
                    DetailRow(label: "Service Fee", value: String(format: "$%.2f", fee))
                }
                
                if let exchangeRate = viewModel.exchangeRate {
                    DetailRow(label: "Exchange Rate", value: exchangeRate)
                }
                
                if !transaction.note.isEmpty {
                    DetailRow(label: "Note", value: transaction.note)
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
    }
    
    // MARK: - Participants Section
    
    private var participantsSection: some View {
        VStack(spacing: 16) {
            Text("Participants")
                .font(.headline)
                .frame(maxWidth: .infinity, alignment: .leading)
            
            VStack(spacing: 12) {
                // Sender
                if let sender = viewModel.sender {
                    ParticipantRow(
                        participant: sender,
                        role: "From",
                        isYou: transaction.type == .sent || transaction.type == .withdrawal
                    )
                }
                
                // Receiver
                if let receiver = viewModel.receiver {
                    ParticipantRow(
                        participant: receiver,
                        role: "To",
                        isYou: transaction.type == .received || transaction.type == .addMoney
                    )
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
    }
    
    // MARK: - Timeline Section
    
    private var timelineSection: some View {
        VStack(spacing: 16) {
            Text("Timeline")
                .font(.headline)
                .frame(maxWidth: .infinity, alignment: .leading)
            
            VStack(alignment: .leading, spacing: 0) {
                ForEach(viewModel.timelineEvents) { event in
                    TimelineRow(event: event)
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
            if transaction.status == .completed {
                Button(action: { viewModel.downloadReceipt(for: transaction) }) {
                    Label("Download Receipt", systemImage: "arrow.down.doc")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color("blue"))
                        .foregroundColor(.white)
                        .cornerRadius(12)
                }
                
                if transaction.type == .received {
                    Button(action: { viewModel.sendThankYou(for: transaction) }) {
                        Label("Send Thank You", systemImage: "heart")
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color("lightBlue").opacity(0.2))
                            .foregroundColor(Color("blue"))
                            .cornerRadius(12)
                    }
                }
            }
            
            if transaction.status == .pending {
                Button(action: { viewModel.cancelTransaction(transaction) }) {
                    Label("Cancel Transaction", systemImage: "xmark.circle")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.red.opacity(0.1))
                        .foregroundColor(.red)
                        .cornerRadius(12)
                }
            }
            
            Button(action: { showingReportIssue = true }) {
                Label("Report Issue", systemImage: "exclamationmark.triangle")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
        }
    }
    
    // MARK: - Helper Methods
    
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .long
        return formatter.string(from: date)
    }
    
    private func formatTime(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}

// MARK: - Detail Row

struct DetailRow: View {
    let label: String
    let value: String
    
    var body: some View {
        HStack {
            Text(label)
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            Spacer()
            
            Text(value)
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(.primary)
                .multilineTextAlignment(.trailing)
        }
    }
}

// MARK: - Participant Row

struct ParticipantRow: View {
    let participant: TransactionParticipant
    let role: String
    let isYou: Bool
    
    var body: some View {
        HStack(spacing: 12) {
            AsyncImage(url: URL(string: participant.profileImageURL ?? "")) { image in
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
                HStack {
                    Text(role)
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    if isYou {
                        Text("(You)")
                            .font(.caption)
                            .foregroundColor(Color("blue"))
                    }
                }
                
                Text(participant.name)
                    .font(.subheadline)
                    .fontWeight(.medium)
            }
            
            Spacer()
        }
    }
}

// MARK: - Timeline Row

struct TimelineRow: View {
    let event: TimelineEvent
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            // Timeline indicator
            VStack(spacing: 0) {
                Circle()
                    .fill(event.isCompleted ? Color.green : Color.gray)
                    .frame(width: 12, height: 12)
                
                if !event.isLast {
                    Rectangle()
                        .fill(Color.gray.opacity(0.3))
                        .frame(width: 2, height: 40)
                }
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(event.title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                Text(event.timestamp)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
        }
    }
}

// MARK: - Report Issue View

struct ReportIssueView: View {
    let transaction: Transaction
    @State private var issueType = ""
    @State private var description = ""
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        NavigationView {
            Form {
                Section("Issue Type") {
                    Picker("Type", selection: $issueType) {
                        Text("Transaction not received").tag("not_received")
                        Text("Wrong amount").tag("wrong_amount")
                        Text("Unauthorized transaction").tag("unauthorized")
                        Text("Other").tag("other")
                    }
                }
                
                Section("Description") {
                    TextEditor(text: $description)
                        .frame(height: 100)
                }
                
                Section {
                    Button("Submit Report") {
                        // Submit report
                        presentationMode.wrappedValue.dismiss()
                    }
                    .frame(maxWidth: .infinity)
                }
            }
            .navigationTitle("Report Issue")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        presentationMode.wrappedValue.dismiss()
                    }
                }
            }
        }
    }
}

// MARK: - Transaction Detail View Model

class TransactionDetailViewModel: ObservableObject {
    @Published var sender: TransactionParticipant?
    @Published var receiver: TransactionParticipant?
    @Published var transactionFee: Double?
    @Published var exchangeRate: String?
    @Published var timelineEvents: [TimelineEvent] = []
    
    func loadTransactionDetails(_ transactionId: String) {
        // Mock data - replace with actual API call
        sender = TransactionParticipant(id: "1", name: "John Doe", profileImageURL: nil)
        receiver = TransactionParticipant(id: "2", name: "Jane Smith", profileImageURL: nil)
        transactionFee = 2.50
        
        timelineEvents = [
            TimelineEvent(
                id: "1",
                title: "Transaction Initiated",
                timestamp: "Oct 25, 2024 at 2:30 PM",
                isCompleted: true,
                isLast: false
            ),
            TimelineEvent(
                id: "2",
                title: "Payment Processed",
                timestamp: "Oct 25, 2024 at 2:31 PM",
                isCompleted: true,
                isLast: false
            ),
            TimelineEvent(
                id: "3",
                title: "Funds Transferred",
                timestamp: "Oct 25, 2024 at 2:32 PM",
                isCompleted: true,
                isLast: true
            )
        ]
    }
    
    func getReceiptText(for transaction: Transaction) -> String {
        return """
        Monay Transaction Receipt
        
        Transaction ID: \(transaction.id)
        Amount: \(String(format: "$%.2f", transaction.amount))
        Date: \(transaction.date)
        Description: \(transaction.description)
        Status: \(transaction.status.displayText)
        """
    }
    
    func downloadReceipt(for transaction: Transaction) {
        // Implement receipt download
    }
    
    func sendThankYou(for transaction: Transaction) {
        // Implement thank you message
    }
    
    func cancelTransaction(_ transaction: Transaction) {
        // Implement transaction cancellation
    }
}

// MARK: - Supporting Types

struct TimelineEvent: Identifiable {
    let id: String
    let title: String
    let timestamp: String
    let isCompleted: Bool
    let isLast: Bool
}

extension Transaction {
    var note: String {
        // This would come from the actual transaction data
        return ""
    }
}

// MARK: - Preview

struct TransactionDetailView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationView {
            TransactionDetailView(transaction: Transaction(
                id: "TXN123456",
                type: .sent,
                amount: 150.00,
                currency: "USD",
                date: Date(),
                description: "Payment to John Doe",
                recipientName: "John Doe",
                status: .completed
            ))
        }
    }
}