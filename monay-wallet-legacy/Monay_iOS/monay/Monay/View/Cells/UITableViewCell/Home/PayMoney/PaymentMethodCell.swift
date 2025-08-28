//
//  PaymentMethodCell.swift
//  Monay
//
//  Created by WFH on 17/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class PaymentMethodCell: UITableViewCell {
    
    static let identifier = "PaymentMethodCell"
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var cardButton: UIButton!
    @IBOutlet weak var walletButton: UIButton!
    
    // MARK: - Instance properties
    
    var callbackCardButton: (() -> Void)?
    var callbackWalletButton: (() -> Void)?
    
    // MARK: - Helper methods
    
    func configure(paymentMethod: PaymentMethod) {
        selectionStyle = .none
        
        switch paymentMethod {
        case .card:
            cardButton.isSelected = true
            walletButton.isSelected = false
        case .wallet:
            walletButton.isSelected = true
            cardButton.isSelected = false
        }
    }
    
    // MARK: - IBAction methods
    
    @IBAction func cardButtonAction(_ sender: Any) {
        callbackCardButton?()
    }
    
    @IBAction func walletButtonAction(_ sender: Any) {
        callbackWalletButton?()
    }
}
