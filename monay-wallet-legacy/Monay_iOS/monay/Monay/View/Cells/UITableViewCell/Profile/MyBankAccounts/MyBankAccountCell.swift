//
//  MyBankAccountCell.swift
//  Monay
//
//  Created by WFH on 21/10/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class MyBankAccountCell: UITableViewCell {
    
    static let identifier = "MyBankAccountCell"
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var titleLabel: UILabel!
    @IBOutlet weak var bankAccountNumberLabel: UILabel!
    
    // MARK: - Instance properties
    
    var callbackDelete: ((MyBankAccountCell) -> Void)?
    
    // MARK: - Helper methods
    
    func configure(bank: Bank) {
        selectionStyle = .none
        
        titleLabel.text = bank.bankName
      bankAccountNumberLabel.text = "\(LocalizedKey.secureText.value) \(bank.last4Digit ?? "")"
    }
    
    // MARK: - IBAction methods
    
    @IBAction func deleteButtonAction(_ sender: Any) {
        callbackDelete?(self)
    }
}
