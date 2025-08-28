//
//  TransactionService.swift
//  Monay
//
//  Transaction Service using Combine
//

import Foundation
import Combine
import Alamofire

class TransactionService {
    
    // MARK: - Private Properties
    private let session = Session.default
    private let baseURL = Configuration.shared.apiBaseURL
    
    // MARK: - Public Methods
    
    func fetchRecentTransactions(limit: Int = 10) -> AnyPublisher<[Transaction], Error> {
        let url = "\(baseURL)/transactions/recent"
        let parameters = ["limit": limit]
        
        return session
            .request(url, method: .get, parameters: parameters, headers: authHeaders)
            .publishDecodable(type: APIResponse<[Transaction]>.self)
            .value()
            .map(\.data)
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
    
    func fetchTransactionHistory(
        page: Int = 1,
        limit: Int = 20,
        filter: TransactionFilter? = nil
    ) -> AnyPublisher<TransactionHistoryResponse, Error> {
        let url = "\(baseURL)/transactions"
        var parameters: [String: Any] = [
            "page": page,
            "limit": limit
        ]
        
        // Add filter parameters if provided
        if let filter = filter {
            if let type = filter.type {
                parameters["type"] = type.rawValue
            }
            if let status = filter.status {
                parameters["status"] = status.rawValue
            }
            if let startDate = filter.startDate {
                parameters["start_date"] = ISO8601DateFormatter().string(from: startDate)
            }
            if let endDate = filter.endDate {
                parameters["end_date"] = ISO8601DateFormatter().string(from: endDate)
            }
        }
        
        return session
            .request(url, method: .get, parameters: parameters, headers: authHeaders)
            .publishDecodable(type: APIResponse<TransactionHistoryResponse>.self)
            .value()
            .map(\.data)
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
    
    func sendMoney(to recipient: String, amount: Double, note: String?) -> AnyPublisher<TransactionResult, Error> {
        let url = "\(baseURL)/transactions/send"
        let parameters = SendMoneyRequest(
            recipientId: recipient,
            amount: amount,
            note: note
        )
        
        return session
            .request(url, method: .post, parameters: parameters, encoder: JSONParameterEncoder.default, headers: authHeaders)
            .publishDecodable(type: APIResponse<TransactionResult>.self)
            .value()
            .map(\.data)
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
    
    func requestMoney(from sender: String, amount: Double, note: String?) -> AnyPublisher<PaymentRequest, Error> {
        let url = "\(baseURL)/transactions/request"
        let parameters = RequestMoneyRequest(
            senderId: sender,
            amount: amount,
            note: note
        )
        
        return session
            .request(url, method: .post, parameters: parameters, encoder: JSONParameterEncoder.default, headers: authHeaders)
            .publishDecodable(type: APIResponse<PaymentRequest>.self)
            .value()
            .map(\.data)
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
    
    // MARK: - Private Properties
    
    private var authHeaders: HTTPHeaders {
        guard let token = TokenManager.shared.accessToken else {
            return HTTPHeaders()
        }
        
        return HTTPHeaders([
            "Authorization": "Bearer \(token)",
            "Content-Type": "application/json"
        ])
    }
}

// MARK: - Supporting Types

struct TransactionHistoryResponse: Codable {
    let transactions: [Transaction]
    let totalCount: Int
    let currentPage: Int
    let totalPages: Int
}

struct TransactionFilter: Codable {
    let type: TransactionType?
    let status: TransactionStatus?
    let startDate: Date?
    let endDate: Date?
}

struct SendMoneyRequest: Codable {
    let recipientId: String
    let amount: Double
    let note: String?
}

struct RequestMoneyRequest: Codable {
    let senderId: String
    let amount: Double
    let note: String?
}

struct TransactionResult: Codable {
    let transactionId: String
    let status: TransactionStatus
    let amount: Double
    let fee: Double
    let totalAmount: Double
    let recipient: TransactionParticipant
}

struct PaymentRequest: Codable {
    let requestId: String
    let amount: Double
    let note: String?
    let expiryDate: Date
    let recipient: TransactionParticipant
}

struct TransactionParticipant: Codable {
    let id: String
    let name: String
    let profileImageURL: String?
}