//
//  TransactionRowView.swift
//  Monay
//
//  SwiftUI Transaction Row Component
//

import SwiftUI

struct TransactionRowView: View {
    let transaction: Transaction
    
    var body: some View {
        HStack(spacing: 12) {
            // Transaction icon
            Image(systemName: transaction.type.iconName)
                .font(.title2)
                .foregroundColor(transaction.type.color)
                .frame(width: 40, height: 40)
                .background(transaction.type.color.opacity(0.1))
                .clipShape(Circle())
            
            // Transaction details
            VStack(alignment: .leading, spacing: 4) {
                Text(transaction.description)
                    .font(.headline)
                    .foregroundColor(.primary)
                
                if let recipient = transaction.recipientName {
                    Text("To: \(recipient)")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                Text(transaction.date, style: .date)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            // Amount and status
            VStack(alignment: .trailing, spacing: 4) {
                Text("\(transaction.type == .sent || transaction.type == .withdrawal ? "-" : "+")\(String(format: "%.2f", transaction.amount))")
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(transaction.type.color)
                
                Text(transaction.currency)
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                // Status indicator
                HStack(spacing: 4) {
                    Circle()
                        .fill(transaction.status.color)
                        .frame(width: 6, height: 6)
                    
                    Text(transaction.status.displayText)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
    }
}

// MARK: - Supporting Extensions

extension TransactionStatus {
    var color: Color {
        switch self {
        case .completed:
            return .green
        case .pending:
            return .orange
        case .failed:
            return .red
        case .cancelled:
            return .gray
        }
    }
    
    var displayText: String {
        switch self {
        case .completed:
            return "Completed"
        case .pending:
            return "Pending"
        case .failed:
            return "Failed"
        case .cancelled:
            return "Cancelled"
        }
    }
}

// MARK: - Preview

struct TransactionRowView_Previews: PreviewProvider {
    static var previews: some View {
        VStack(spacing: 12) {
            TransactionRowView(transaction: Transaction(
                id: "1",
                type: .sent,
                amount: 150.00,
                currency: "USD",
                date: Date(),
                description: "Payment to John Doe",
                recipientName: "John Doe",
                status: .completed
            ))
            
            TransactionRowView(transaction: Transaction(
                id: "2",
                type: .received,
                amount: 75.50,
                currency: "USD",
                date: Date().addingTimeInterval(-86400),
                description: "Payment from Jane Smith",
                recipientName: "Jane Smith",
                status: .pending
            ))
            
            TransactionRowView(transaction: Transaction(
                id: "3",
                type: .addMoney,
                amount: 200.00,
                currency: "USD",
                date: Date().addingTimeInterval(-172800),
                description: "Added money from bank",
                recipientName: nil,
                status: .completed
            ))
        }
        .padding()
        .background(Color(.systemGroupedBackground))
    }
}