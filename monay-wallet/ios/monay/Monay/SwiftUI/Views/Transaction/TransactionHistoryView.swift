//
//  TransactionHistoryView.swift
//  Monay
//
//  Transaction History View Implementation
//

import SwiftUI
import Combine

struct TransactionHistoryView: View {
    @StateObject private var viewModel = TransactionHistoryViewModel()
    @Environment(\.presentationMode) var presentationMode
    @State private var selectedTransaction: Transaction?
    @State private var showingFilters = false
    
    var body: some View {
        NavigationView {
            ZStack {
                if viewModel.transactions.isEmpty && !viewModel.isLoading {
                    emptyStateView
                } else {
                    transactionsList
                }
                
                if viewModel.isLoading && viewModel.transactions.isEmpty {
                    ProgressView()
                        .scaleEffect(1.5)
                }
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Transactions")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Done") {
                        presentationMode.wrappedValue.dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingFilters = true }) {
                        Image(systemName: "line.horizontal.3.decrease.circle")
                    }
                }
            }
            .sheet(isPresented: $showingFilters) {
                TransactionFiltersView(filters: $viewModel.filters)
            }
            .sheet(item: $selectedTransaction) { transaction in
                NavigationView {
                    TransactionDetailView(transaction: transaction)
                }
            }
            .searchable(text: $viewModel.searchText, prompt: "Search transactions")
            .onAppear {
                viewModel.loadTransactions()
            }
        }
    }
    
    // MARK: - Transactions List
    
    private var transactionsList: some View {
        ScrollView {
            LazyVStack(spacing: 0) {
                // Month sections
                ForEach(viewModel.groupedTransactions, id: \.month) { group in
                    Section {
                        ForEach(group.transactions) { transaction in
                            TransactionRowView(transaction: transaction)
                                .padding(.horizontal)
                                .padding(.vertical, 6)
                                .onTapGesture {
                                    selectedTransaction = transaction
                                }
                        }
                    } header: {
                        HStack {
                            Text(group.month)
                                .font(.headline)
                                .foregroundColor(.primary)
                            
                            Spacer()
                            
                            Text(group.totalAmount)
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                        .padding(.horizontal)
                        .padding(.vertical, 8)
                        .background(Color(.systemGroupedBackground))
                    }
                }
                
                // Load more indicator
                if viewModel.hasMorePages {
                    ProgressView()
                        .padding()
                        .onAppear {
                            viewModel.loadMoreTransactions()
                        }
                }
            }
        }
        .refreshable {
            await viewModel.refreshTransactions()
        }
    }
    
    // MARK: - Empty State
    
    private var emptyStateView: some View {
        VStack(spacing: 20) {
            Image(systemName: "list.bullet.rectangle")
                .font(.system(size: 60))
                .foregroundColor(.secondary)
            
            Text("No Transactions")
                .font(.title2)
                .fontWeight(.semibold)
            
            Text("Your transaction history will appear here")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding()
    }
}

// MARK: - Transaction Filters View

struct TransactionFiltersView: View {
    @Binding var filters: TransactionFilters
    @Environment(\.presentationMode) var presentationMode
    @State private var tempFilters: TransactionFilters
    
    init(filters: Binding<TransactionFilters>) {
        self._filters = filters
        self._tempFilters = State(initialValue: filters.wrappedValue)
    }
    
    var body: some View {
        NavigationView {
            Form {
                Section("Transaction Type") {
                    Picker("Type", selection: $tempFilters.type) {
                        Text("All").tag(nil as TransactionType?)
                        Text("Sent").tag(TransactionType.sent as TransactionType?)
                        Text("Received").tag(TransactionType.received as TransactionType?)
                        Text("Add Money").tag(TransactionType.addMoney as TransactionType?)
                        Text("Withdrawal").tag(TransactionType.withdrawal as TransactionType?)
                    }
                    .pickerStyle(SegmentedPickerStyle())
                }
                
                Section("Status") {
                    Picker("Status", selection: $tempFilters.status) {
                        Text("All").tag(nil as TransactionStatus?)
                        Text("Completed").tag(TransactionStatus.completed as TransactionStatus?)
                        Text("Pending").tag(TransactionStatus.pending as TransactionStatus?)
                        Text("Failed").tag(TransactionStatus.failed as TransactionStatus?)
                    }
                    .pickerStyle(SegmentedPickerStyle())
                }
                
                Section("Date Range") {
                    Toggle("Custom Date Range", isOn: $tempFilters.useCustomDateRange)
                    
                    if tempFilters.useCustomDateRange {
                        DatePicker("From", selection: $tempFilters.startDate, displayedComponents: .date)
                        DatePicker("To", selection: $tempFilters.endDate, displayedComponents: .date)
                    }
                }
                
                Section("Amount Range") {
                    Toggle("Filter by Amount", isOn: $tempFilters.useAmountFilter)
                    
                    if tempFilters.useAmountFilter {
                        HStack {
                            Text("Min")
                            TextField("0", value: $tempFilters.minAmount, format: .currency(code: "USD"))
                                .keyboardType(.decimalPad)
                                .multilineTextAlignment(.trailing)
                        }
                        
                        HStack {
                            Text("Max")
                            TextField("0", value: $tempFilters.maxAmount, format: .currency(code: "USD"))
                                .keyboardType(.decimalPad)
                                .multilineTextAlignment(.trailing)
                        }
                    }
                }
            }
            .navigationTitle("Filters")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Reset") {
                        tempFilters = TransactionFilters()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Apply") {
                        filters = tempFilters
                        presentationMode.wrappedValue.dismiss()
                    }
                }
            }
        }
    }
}

// MARK: - Transaction History View Model

class TransactionHistoryViewModel: ObservableObject {
    @Published var transactions: [Transaction] = []
    @Published var groupedTransactions: [TransactionGroup] = []
    @Published var isLoading = false
    @Published var searchText = ""
    @Published var filters = TransactionFilters()
    @Published var hasMorePages = true
    
    private var currentPage = 1
    private let pageSize = 20
    private let transactionService = TransactionService()
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        setupBindings()
    }
    
    private func setupBindings() {
        // Search text debounce
        $searchText
            .debounce(for: .milliseconds(500), scheduler: RunLoop.main)
            .sink { [weak self] _ in
                self?.filterTransactions()
            }
            .store(in: &cancellables)
        
        // Filters change
        $filters
            .sink { [weak self] _ in
                self?.resetAndReload()
            }
            .store(in: &cancellables)
    }
    
    func loadTransactions() {
        guard !isLoading else { return }
        
        isLoading = true
        
        // Mock data - replace with actual API call
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) { [weak self] in
            self?.transactions = self?.generateMockTransactions() ?? []
            self?.groupTransactions()
            self?.isLoading = false
        }
    }
    
    func loadMoreTransactions() {
        guard !isLoading && hasMorePages else { return }
        
        isLoading = true
        currentPage += 1
        
        // Mock pagination - replace with actual API call
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) { [weak self] in
            let newTransactions = self?.generateMockTransactions() ?? []
            self?.transactions.append(contentsOf: newTransactions)
            self?.groupTransactions()
            self?.isLoading = false
            
            // Check if there are more pages
            if newTransactions.count < self?.pageSize ?? 20 {
                self?.hasMorePages = false
            }
        }
    }
    
    @MainActor
    func refreshTransactions() async {
        currentPage = 1
        hasMorePages = true
        
        // Mock refresh - replace with actual API call
        try? await Task.sleep(nanoseconds: 1_000_000_000)
        transactions = generateMockTransactions()
        groupTransactions()
    }
    
    private func resetAndReload() {
        transactions = []
        currentPage = 1
        hasMorePages = true
        loadTransactions()
    }
    
    private func filterTransactions() {
        // Apply search filter
        if searchText.isEmpty {
            groupTransactions()
        } else {
            let filtered = transactions.filter { transaction in
                transaction.description.localizedCaseInsensitiveContains(searchText) ||
                transaction.recipientName?.localizedCaseInsensitiveContains(searchText) ?? false
            }
            groupTransactionsByMonth(filtered)
        }
    }
    
    private func groupTransactions() {
        groupTransactionsByMonth(transactions)
    }
    
    private func groupTransactionsByMonth(_ transactions: [Transaction]) {
        let grouped = Dictionary(grouping: transactions) { transaction in
            let formatter = DateFormatter()
            formatter.dateFormat = "MMMM yyyy"
            return formatter.string(from: transaction.date)
        }
        
        groupedTransactions = grouped.map { month, transactions in
            let total = transactions.reduce(0) { sum, transaction in
                if transaction.type == .sent || transaction.type == .withdrawal {
                    return sum - transaction.amount
                } else {
                    return sum + transaction.amount
                }
            }
            
            return TransactionGroup(
                month: month,
                transactions: transactions.sorted { $0.date > $1.date },
                totalAmount: String(format: "$%.2f", abs(total))
            )
        }.sorted { group1, group2 in
            // Sort by date descending
            let formatter = DateFormatter()
            formatter.dateFormat = "MMMM yyyy"
            let date1 = formatter.date(from: group1.month) ?? Date()
            let date2 = formatter.date(from: group2.month) ?? Date()
            return date1 > date2
        }
    }
    
    private func generateMockTransactions() -> [Transaction] {
        // Generate mock transactions for testing
        var transactions: [Transaction] = []
        let types: [TransactionType] = [.sent, .received, .addMoney, .withdrawal]
        let names = ["John Doe", "Jane Smith", "Bob Johnson", "Alice Williams", "Charlie Brown"]
        
        for i in 0..<pageSize {
            let type = types.randomElement()!
            let amount = Double.random(in: 10...500)
            let daysAgo = Int.random(in: 0...90)
            
            transactions.append(Transaction(
                id: UUID().uuidString,
                type: type,
                amount: amount,
                currency: "USD",
                date: Date().addingTimeInterval(-Double(daysAgo * 86400)),
                description: "Payment \(type == .sent ? "to" : "from") \(names.randomElement()!)",
                recipientName: names.randomElement(),
                status: [.completed, .pending].randomElement()!
            ))
        }
        
        return transactions
    }
}

// MARK: - Supporting Types

struct TransactionGroup {
    let month: String
    let transactions: [Transaction]
    let totalAmount: String
}

struct TransactionFilters {
    var type: TransactionType?
    var status: TransactionStatus?
    var useCustomDateRange = false
    var startDate = Date().addingTimeInterval(-30 * 86400) // 30 days ago
    var endDate = Date()
    var useAmountFilter = false
    var minAmount: Double = 0
    var maxAmount: Double = 10000
}

// MARK: - Preview

struct TransactionHistoryView_Previews: PreviewProvider {
    static var previews: some View {
        TransactionHistoryView()
    }
}