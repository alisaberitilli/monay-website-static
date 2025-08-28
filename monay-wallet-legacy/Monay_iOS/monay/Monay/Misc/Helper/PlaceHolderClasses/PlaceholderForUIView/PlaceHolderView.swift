//
//  StatefulView.swift
//
//  Created by Sadanand on 01/02/18.
//  Copyright © 2018 Codiant Software Technologies Pvt Ltd. All rights reserved.
//

import UIKit

class PlaceHolderView: UIView {
    static let identifier = "PlaceHolderView"
    var onActionButtonTap: (() -> Void)?
    
    // MARK: Properties
    @IBOutlet weak var titleLabel: UILabel?
    @IBOutlet weak var subtitleLabel: UILabel?
    @IBOutlet weak var placeholderImageView: UIImageView?
    @IBOutlet weak var actionButton: UIButton?
    @IBOutlet weak var activityIndicatorLoader: PlaceHolderLoader?
    
    var selfView: UIView {
        return self
    }
    
    @IBAction func btnRetry_Action(_ sender: Any) {
        onActionButtonTap?()
    }

  class func instantiateView() -> PlaceHolderView {
    let placeHolderView = UINib(nibName: PlaceHolderView.identifier, bundle: nil).instantiate(withOwner: nil, options: nil)[0] as! PlaceHolderView
    return placeHolderView
  }
}
