//
//  String.swift
//  Monay
//
//  Created by WFH on 09/09/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

extension String {
    var bool: Bool? {
        switch self.lowercased() {
        case "true", "t", "yes", "y", "1":
            return true
        case "false", "f", "no", "n", "0":
            return false
        default:
            return nil
        }
    }
}

extension String {
  func UTCToLocal(format: String = DateFormate.ddMMMMyyyyhhmma.rawValue, sourceFormat: String = DateFormate.yyyyMMddhhmmsss.rawValue) -> String {
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = sourceFormat
        dateFormatter.timeZone = TimeZone(abbreviation: "UTC")
        
        let dt = dateFormatter.date(from: self)
        dateFormatter.timeZone = TimeZone.current
        dateFormatter.dateFormat = format
        
        guard dt != nil else {
            return ""
        }
        
        return dateFormatter.string(from: dt!)
    }
    
    func getJsonDataDict() -> NSDictionary {
        let data = self.data(using: String.Encoding.utf8, allowLossyConversion: false)
        let dict = [String: String]()
        if let jsonData = data {
            // Will return an object or nil if JSON decoding fails
            do {
                let jsonData = try JSONSerialization.jsonObject(with: jsonData, options: JSONSerialization.ReadingOptions.mutableContainers)
                let jsonDataDict = jsonData as! NSDictionary // swiftlint:disable:this force_cast
                return jsonDataDict
            } catch {
                return dict as NSDictionary
            }
            
        } else {
            return dict as NSDictionary
        }
    }
  
    func getOSInfo() -> String {
        let os = ProcessInfo().operatingSystemVersion 
        return String(os.majorVersion) + "." + String(os.minorVersion) + "." + String(os.patchVersion)
    }

}

extension StringProtocol {
    subscript(offset: Int) -> Character {
        self[index(startIndex, offsetBy: offset)]
    }
}

enum DateFormate: String {
    case ddMMMyyyy = "dd MMM yyyy"
    case ddMMMyyyyDate = "dd-MMM-yyyy"
    case yyyyMMdd   = "yyyy-MM-dd"
    case ddMMMyyyyhhmma = "dd MMM yyyy, hh:mm a"
    case ddMMMMyyyyhhmma = "dd MMMM yyyy hh:mm a"
    case yyyyMMddT = "yyyy-MM-dd'T'HH:mm:ss.SSSZ"
    case yyyyMMddhhmmsss = "yyyy-MM-dd HH:mm:ss"
    case yyyy = "yyyy"
    case hhmma = "hh:mm a"
}
