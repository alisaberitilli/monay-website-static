//
//  JWTVerifier.swift
//  DocLive
//
//  Created by WFH on 02/06/20.
//  Copyright © 2019 Codiant Software Technologies Pvt ltd. All rights reserved.
//

import Foundation

enum JWTTokenExpirationError: Error {
    case tokenExpired
    case expiredDateNotExists
    case incorrectExpiredDate    
}

extension Authorization {
    
    public func verifyExpirationDate() throws {
        if self.expiration == nil {
            throw JWTTokenExpirationError.expiredDateNotExists
        }

        guard let date = extractDate() else {
            throw JWTTokenExpirationError.incorrectExpiredDate
        }

        if date.compare(Date()) == ComparisonResult.orderedAscending {
            throw JWTTokenExpirationError.tokenExpired
        }
    }

    private func extractDate() -> Date? {
        return Date(timeIntervalSince1970: self.expiration)
    }
    
}
