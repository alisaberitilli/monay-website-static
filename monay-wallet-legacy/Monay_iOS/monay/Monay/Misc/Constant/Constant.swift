//
//  Constant.swift
//  Monay
//
//  Created by Aayushi on 08/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

let appDelegate = UIApplication.shared.delegate as! AppDelegate // swiftlint:disable:this force_cast
let userDefualt = UserDefaults.standard
let sharedCoreDataManager = CoreDataManager.sharedInstance

// MARK: - Environment Setup
enum Environment: String {
    case dev  = "development"
    case dist = "distribution"
}

var environmentType: Environment {
    #if DEBUG
    return .dev
    #else
    return .dist
    #endif
}

let kDeviceTypeIOS = "ios"
let kBundleIdentifier = Bundle.main.bundleIdentifier!
let deviceID = UIDevice.current.identifierForVendor!.uuidString
var systemVersion = String().getOSInfo()
let modelName = UIDevice.modelName
let kProductName = "Alert"
let appStoreId = ""
let bundleShortVersionString = "CFBundleShortVersionString"
let bundleVersion = "CFBundleVersion"

enum APIKey {
    static let success = "success"
    static let authorization = "Authorization"
    static let data = "data"
    static let failure = "failure"
    static let error = "error"
    static let message = "message"
    static let bearer = "Bearer"
    static let status = "status"
    static let token = "token"
    static let rows = "rows"
    static let total = "total"
    static let userId = "userId"
    static let user = "user"
    static let basePath = "basePath"
    static let profilePictureUrl = "profilePictureUrl"
    static let count = "count"
    static let blockUser = "blockUser"
    static let exp = "exp"
    static let jwt = "jwt"
    static let setting = "setting"
}

// MARK: - Screen size
struct Screen {
  static let width = UIScreen.main.bounds.size.width
  static let height = UIScreen.main.bounds.size.height
  static let bounds = UIScreen.main.bounds
  static let maxLength = max(width, height)
  static let minLength = min(width, height)
}

// MARK: - Device type
struct Device {
    ///
    static let iPhoneSE = UIDevice.current.userInterfaceIdiom == .phone && Screen.maxLength == 568.0
    static let iPhone6 = UIDevice.current.userInterfaceIdiom == .phone && Screen.maxLength == 667.0
    static let iPhone6p = UIDevice.current.userInterfaceIdiom == .phone && Screen.maxLength == 736.0
    
    static func needResizing() -> Bool {
        return Screen.height > 568.0
    }
}

extension UIDevice {
    
    var hasNotch: Bool {
        let bottom = UIApplication.shared.keyWindow?.safeAreaInsets.bottom ?? 0
        return bottom > 0
    }
    
    var bottomSafeAreaInsets: CGFloat {
        let bottomInset = UIApplication.shared.keyWindow?.safeAreaInsets.bottom ?? 0
        return bottomInset
    }
}

var appVersion: String? {
    let nsObject: AnyObject? = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as AnyObject?
    return  nsObject as? String
}

let alphabets = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLKMNOPQRSTUVWXYZ"
let maxLength = 30
let max25Length = 25
let max15Length = 15
let max50Length = 50

let kNotificationReadUnreadCountRefresh = "RefereshNotificationReadUnreadCount"
let kNotificationContactSync = "ContactSync"
let zendeskAppID = "5264f4063caef2434c8956fb2b2827d0c76036e7081ad02f"
let zendeskClientID = "mobile_sdk_client_f2caa526b4e0ad12fb16"
let zendeskURL = "https://rahulutilli.zendesk.com"
let appStoreBaseURL = "https://apps.apple.com/app/id"
let appLinkReplace = "{appLink}"
let iTunesURLBasePath  = "itms-apps://itunes.apple.com/app/"
let flagImagePath = "CountryPicker.bundle/Images/"
let countryCodeJsonFilePath = "CountryPicker.bundle/Data/countryCodes"
let googleServiceInfo = "GoogleService-Info"
let plist = "plist"
