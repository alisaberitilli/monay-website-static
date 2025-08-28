//
//  Monay_Misc_DeepLinking_FirebaseDeepLink.swift
//  Monay
//
//  Created by Aayushi Bhagat on 13/09/22.
//  Copyright © 2022 Codiant. All rights reserved.
//

import Foundation
// import Firebase // Temporarily disabled - Firebase not configured

struct FirebaseDeepLinkObject {
  var title: String
  var contentDescription: String
  var params: [String: String]
}

class FirebaseDeepLink {
  
  static func getShortUrl(with object: FirebaseDeepLinkObject,
                          _ handler: @escaping (URL?, URL?, Error?) -> Void) {
    // Firebase functionality temporarily disabled
    var components = URLComponents()
    components.scheme = "https"
    components.host = "monay.codiantdev.com"
    components.path = "/signup"
    
    var queryItems: [URLQueryItem] = []
    
    for (key, value) in object.params {
      queryItems.append(
        URLQueryItem(name: key, value: value)
      )
    }
    
    components.queryItems = queryItems
    
    // Return the URL without Firebase Dynamic Links
    handler(components.url, components.url, nil)
    
    /* Firebase code - temporarily disabled
    guard let url = components.url, let linkBuilder = DynamicLinkComponents(link: url, domainURIPrefix: "https://monay.page.link") else {
      return
    }
    
    linkBuilder.iOSParameters = dynamicLinkIOSParameters()
    linkBuilder.androidParameters = dynamicLinkAndroidParameters()
    
    // Social metadata
    let socialMetaTagParameters = DynamicLinkSocialMetaTagParameters()
    socialMetaTagParameters.title = object.title
    socialMetaTagParameters.descriptionText = object.contentDescription
    
    linkBuilder.socialMetaTagParameters = socialMetaTagParameters
    
    guard let longDynamicLink = linkBuilder.url else { return }
    
    linkBuilder.shorten { (url, _, error) in
      handler(longDynamicLink, url, error)
    }
    */
  }
}

/* Firebase-dependent code - temporarily disabled
extension FirebaseDeepLink {
  
  private static func dynamicLinkIOSParameters() -> DynamicLinkIOSParameters {
    let parameters = DynamicLinkIOSParameters(bundleID: Bundle.main.bundleIdentifier!)
    parameters.appStoreID = "123456789"
   // parameters.fallbackURL = URL(string: Constant.Application.appStoreURL)
    return parameters
  }
  
  private static func dynamicLinkAndroidParameters() -> DynamicLinkAndroidParameters {
    let parameters = DynamicLinkAndroidParameters(packageName: "com.monayuser")
    return parameters
  }
}
*/

extension FirebaseDeepLink {
  
  @discardableResult static func handleUniversalLink(_ url: URL,
                                                     _ handler: @escaping (URL?, [String: String], Error?) -> Void) -> Bool {
    // Firebase functionality temporarily disabled - return URL as-is
    handler(url, extractQueryParams(url: url), nil)
    return true
  }
  
  static func handleCustomURIScheme(_ url: URL) -> (URL?, [String: String]) {
    // Firebase functionality temporarily disabled - return URL as-is
    return (url, extractQueryParams(url: url))
  }
  
  private static func extractQueryParams(url: URL?) -> [String: String] {
    var params: [String: String] = [:]
    
    guard let url = url else { return params }
    
    if let components = URLComponents(url: url, resolvingAgainstBaseURL: false),
       let queryItems = components.queryItems {
      for queryItem in queryItems {
        if let value = queryItem.value {
          params[queryItem.name] = value
        }
      }
    }
    
    return params
  }
}
