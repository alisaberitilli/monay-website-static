//
//  WalletBalanceCell.swift
//  Monay
//
//  Created by WFH on 17/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class WalletBalanceCell: UITableViewCell {
    
     static let identifier = "WalletBalanceCell"
     // MARK: - IBOutlet properties
    
    @IBOutlet weak var availableWalletLabel: UILabel!
    
    // MARK: - Instance properties
    
    var callbackAmountFieldValidation: (() -> Void)?
    var callbackPay: (() -> Void)?
    
    // MARK: - IBAction methods
    
    @IBAction func payButtonAction(_ sender: Any) {
        callbackAmountFieldValidation?()
        callbackPay?()
    }
}
