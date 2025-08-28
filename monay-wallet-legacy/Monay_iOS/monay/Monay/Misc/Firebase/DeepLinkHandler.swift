//
//  DeepLinkHandler.swift
//  ZingMe
//
//  Created by WFH on 18/01/21.
//  Copyright © 2021 Codiant Software Technologies Pvt ltd. All rights reserved.
//

import Foundation

protocol DeepLinkHandler: AnyObject {
  
  func handle(_ info: [String: Any]) 
  
}
