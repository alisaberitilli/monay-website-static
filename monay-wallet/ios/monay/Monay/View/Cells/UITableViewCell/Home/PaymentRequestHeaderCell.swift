//
//  PaymentRequestHeaderCell.swift
//  Monay
//
//  Created by WFH on 11/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class PaymentRequestHeaderCell: UITableViewCell {

    static let identifier = "PaymentRequestHeaderCell"
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var titleLabel: UILabel!
    @IBOutlet weak var viewAllButton: UIButton!
    @IBOutlet weak var bgView: UIView!
    
    // MARK: - Instance properties
    
    var callbackViewAll: (() -> Void)?
    
    // MARK: - IBAction methods
    
    @IBAction func viewAllButtonAction(_ sender: Any) {
        callbackViewAll?()
    }
}
