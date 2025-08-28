//
//  TransactionCell.swift
//  Monay
//
//  Created by WFH on 12/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class TransactionCell: UITableViewCell {
    
    static let reuseIdentifier = "TransactionCell"
  
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var userImageView: UIImageView!
    @IBOutlet weak var nameLabel: UILabel!
    @IBOutlet weak var dateLabel: UILabel!
    @IBOutlet weak var amountLabel: UILabel!
    @IBOutlet weak var seperatorView: UIView!
    @IBOutlet weak var statusLabel: UILabel!
    @IBOutlet weak var transactionLabel: UILabel!
    
    // MARK: - Type properties
        
    // MARK: - Helper methods
    
    func configure(transaction: Transaction) {

        var user: User?
        let actionType = transaction.actionType
      let currencySymbol = Authorization.shared.userCredentials.country?.currencyCode ?? ""

        if actionType == .deposit {
            user = transaction.toUser
            if let amount = transaction.amount {
                amountLabel.text = "+ \(currencySymbol) \(amount)"
            }
          statusLabel.text = LocalizedKey.added.value
            statusLabel.textColor = #colorLiteral(red: 0.1647058824, green: 0.6078431373, blue: 0.3607843137, alpha: 1)
        } else if actionType == .withdrawal {
            user = transaction.fromUser
            if let amount = transaction.amount {
                amountLabel.text = "- \(currencySymbol) \(amount)"
            }
          statusLabel.text = LocalizedKey.withdrawal.value
            statusLabel.textColor = #colorLiteral(red: 0.968627451, green: 0.1294117647, blue: 0.1333333333, alpha: 1)
        } else {
            
            let selfUserId = Authorization.shared.userCredentials.id ?? ""
            
            if selfUserId != transaction.toUser?.id {
                user = transaction.toUser
                
                if let amount = transaction.amount {
                    amountLabel.text = "- \(currencySymbol) \(amount)"
                }
              statusLabel.text = LocalizedKey.transfer.value
                statusLabel.textColor = #colorLiteral(red: 0.968627451, green: 0.1294117647, blue: 0.1333333333, alpha: 1)
            } else {
                
                user = transaction.fromUser
                
                if let amount = transaction.amount {
                    amountLabel.text = "+ \(currencySymbol) \(amount)"
                }
                
                statusLabel.text = LocalizedKey.added.value
                statusLabel.textColor = #colorLiteral(red: 0.1647058824, green: 0.6078431373, blue: 0.3607843137, alpha: 1)
                
            }
        }
        
        if transaction.status == LocalizedKey.failed.value {
          statusLabel.text = LocalizedKey.failed.value.capitalized
            statusLabel.textColor = #colorLiteral(red: 0.968627451, green: 0.1294117647, blue: 0.1333333333, alpha: 1)
        }
        
        let profileString = user?.profilePictureUrl ?? ""
        if let profileUrl = URL(string: profileString) {
            userImageView.setImage(with: profileUrl)
        }
        
        nameLabel.text = "\(user?.firstName ?? "") \(user?.lastName ?? "")"
      let createdAt = transaction.createdAt?.UTCToLocal(format: DateFormate.ddMMMyyyyhhmma.rawValue, sourceFormat: DateFormate.yyyyMMddT.rawValue)
        dateLabel.text = createdAt
        
        transactionLabel.text = transaction.transactionId
    }
}
