//
//  PaymentRequestCell.swift
//  Monay
//
//  Created by WFH on 10/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class DashboardPaymentRequestCell: UITableViewCell {
    
    static let identifier = "DashboardPaymentRequestCell"
  
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var userImageView: UIImageView!
    @IBOutlet weak var userNameLabel: UILabel!
    @IBOutlet weak var dateLabel: UILabel!
    @IBOutlet weak var amountLabel: UILabel!
    @IBOutlet weak var declineButton: UIButton!
    @IBOutlet weak var payButton: UIButton!
    
    // MARK: - Instance properties
    
    var callbackPayButton: ((Int) -> Void)?
    var callbackDeclineButton: ((Int) -> Void)?
    
    // MARK: - Helper methods
    
    func configure(paymentRequest: PaymentRequest) {
        let profileString = paymentRequest.fromUser?.profilePictureUrl ?? ""
        if let profileUrl = URL(string: profileString) {
            userImageView.setImage(with: profileUrl)
        }
        
        userNameLabel.text = "\(paymentRequest.fromUser?.firstName ?? "") \(paymentRequest.fromUser?.lastName ?? "")"
        
      let createdAt = paymentRequest.createdAt?.UTCToLocal(format: DateFormate.ddMMMyyyyhhmma.rawValue, sourceFormat: DateFormate.yyyyMMddT.rawValue)
        dateLabel.text = createdAt
        
        if let amount = paymentRequest.amount {
            let currencySymbol = Authorization.shared.userCredentials.country?.currencyCode ?? ""
            amountLabel.text = "\(currencySymbol) \(amount)"
        }
    }
    
    // MARK: - IBAction methods
    
    @IBAction func declineButtonAction(_ sender: Any) {
        callbackDeclineButton?(tag)
    }
    
    @IBAction func payButtonAction(_ sender: Any) {
        callbackPayButton?(tag)
    }
}
