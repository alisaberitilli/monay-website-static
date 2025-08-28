//
//  PlaceholderDelegate.swift
//  PlaceHolderDemo
//
//  Copyright © 2017 Codiant. All rights reserved.
//

import UIKit

public protocol PlaceholderDelegate: AnyObject {
    func placeHolderActionOn(_ view: Any, placeholder: Placeholder, requestedApiPath: String?)
    func placeholderViewInsets() -> UIEdgeInsets
}


extension PlaceholderDelegate {
  public func placeholderViewInsets() -> UIEdgeInsets {
    return UIEdgeInsets()
  }
}
