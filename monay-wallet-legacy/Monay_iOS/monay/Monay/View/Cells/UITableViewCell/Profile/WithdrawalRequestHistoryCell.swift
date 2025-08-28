//
//  WithdrawalRequestHistoryCell.swift
//  Monay
//
//  Created by WFH on 27/10/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class WithdrawalRequestHistoryCell: UITableViewCell {
    
  static let identifier = "WithdrawalRequestHistoryCell"
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var titleLabel: UILabel!
    @IBOutlet weak var last4DigitLabel: UILabel!
    @IBOutlet weak var dateLabel: UILabel!
    @IBOutlet weak var statusLabel: UILabel!
    @IBOutlet weak var amountLabel: UILabel!
    @IBOutlet weak var transactionIdLabel: UILabel!
    
    // MARK: - Helper methods
    
    func configure(transaction: Transaction) {
        
        titleLabel.text = transaction.bankName ?? "-"
        
        if let last4Digit = transaction.last4Digit {
          last4DigitLabel.text = "\(LocalizedKey.secureText.value) \(last4Digit)"
        }
        
      let createdAt = transaction.createdAt?.UTCToLocal(format: DateFormate.ddMMMyyyyhhmma.rawValue, sourceFormat: DateFormate.yyyyMMddT.rawValue)
        dateLabel.text = createdAt
        
        switch transaction.paymentStatus {
        case .pending:
          statusLabel.text = LocalizedKey.inProgress.value
            statusLabel.textColor = #colorLiteral(red: 0.9892008901, green: 0.8078440428, blue: 0.06671842188, alpha: 1)
        case .completed:
          statusLabel.text = LocalizedKey.completed.value
            statusLabel.textColor = #colorLiteral(red: 0.1629795432, green: 0.6008908749, blue: 0.3463993073, alpha: 1)
        case .cancelled:
          statusLabel.text = LocalizedKey.rejected.value
            statusLabel.textColor = #colorLiteral(red: 0.9695703387, green: 0.1313586831, blue: 0.1314304471, alpha: 1)
        case .failed:
          statusLabel.text = LocalizedKey.failed.value.capitalized
            statusLabel.textColor = #colorLiteral(red: 0.9695703387, green: 0.1313586831, blue: 0.1314304471, alpha: 1)
        default:
            statusLabel.text = transaction.paymentStatus?.rawValue.capitalized
            statusLabel.textColor = UIColor.black
        }
        
        if let amount = transaction.amount {
            let currencySymbol = Authorization.shared.userCredentials.country?.currencyCode ?? ""
            amountLabel.text = "\(currencySymbol) \(amount)"
        }
        
        transactionIdLabel.text = transaction.transactionId
    }
    
    // MARK: - IBAction methods
    
    @IBAction func viewDetailButtonAction(_ sender: Any) {
    }
}
