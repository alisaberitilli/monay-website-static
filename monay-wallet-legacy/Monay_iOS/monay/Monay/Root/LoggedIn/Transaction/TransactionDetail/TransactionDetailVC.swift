//
//  TransactionDetailVC.swift
//  Monay
//
//  Created by WFH on 20/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class TransactionDetailVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var userImageView: UIImageView!
    @IBOutlet weak var userNameLabel: UILabel!
    @IBOutlet weak var amountLabel: UILabel!
    @IBOutlet weak var statusLabel: UILabel!
    @IBOutlet weak var messageLabel: UILabel!
    @IBOutlet weak var cardNumberLabel: UILabel!
    @IBOutlet weak var transactionIdLabel: UILabel!
    @IBOutlet weak var dateLabel: UILabel!
    @IBOutlet weak var paidAmountLabel: UILabel!
    @IBOutlet weak var successFailedImageView: UIImageView!
    @IBOutlet weak var scrollView: UIScrollView!
    
    // MARK: - Instance properties
    
    let transactionDetailVM = TransactionDetailVM()
    
    // MARK: - View controller lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        initalSetup()
    }
    
    // MARK: - Helper methods
    
    private func initalSetup() {
        callTransactionDetailAPI()
    }
    
    private func setupData() {
        
        guard let transaction = transactionDetailVM.transaction else {
            return
        }
        
        var user: User?
        let actionType = transaction.actionType
        
        if actionType == .deposit {
            user = transaction.toUser
          statusLabel.text = LocalizedKey.added.value
        } else if actionType == .withdrawal {
            user = transaction.fromUser
          statusLabel.text = LocalizedKey.withdrawal.value
        } else {
            
            let selfUserId = Authorization.shared.userCredentials.id ?? ""
            
            if selfUserId != transaction.toUser?.id {
                user = transaction.toUser
              statusLabel.text = LocalizedKey.paidTo.value
            } else {
                user = transaction.fromUser
                statusLabel.text = LocalizedKey.added.value
            }
        }
        
        let profileString = user?.profilePictureUrl ?? ""
        if let profileUrl = URL(string: profileString) {
            userImageView.setImage(with: profileUrl)
        }
        
      let status = transaction.status == LocalizedKey.failed.value ? LocalizedKey.failed.value.capitalized : statusLabel.text
        statusLabel.text = status
        userNameLabel.text = "\(user?.firstName ?? "") \(user?.lastName ?? "")"
        
        if let amount = transaction.amount {
            let currency = Authorization.shared.userCredentials.country?.currencyCode ?? ""
            amountLabel.text = "\(currency) \(amount)"
            let status = transaction.status == LocalizedKey.failed.value ? LocalizedKey.failed.value.capitalized : statusLabel.text ?? ""
            paidAmountLabel.text = "\(status) \(currency) \(amount)"
            successFailedImageView.image = transaction.status == LocalizedKey.failed.value ? #imageLiteral(resourceName: "ic_how_it_work") : #imageLiteral(resourceName: "ic_t_&_c_check")
        }
        
      let createdAt = transaction.createdAt?.UTCToLocal(format: DateFormate.ddMMMyyyyhhmma.rawValue, sourceFormat: DateFormate.yyyyMMddT.rawValue)
        dateLabel.text = createdAt
        
        messageLabel.text = transaction.message ?? "-"
        
        let paymentMethod = (transaction.paymentMethod ?? "").capitalized
        cardNumberLabel.text = Authorization.shared.userCredentials.userType == .secondaryUser ? "\(transaction.toUser?.firstName ?? "") \(transaction.toUser?.lastName ?? "") - \(paymentMethod)" : paymentMethod

        if let last4Digit = transaction.last4Digit {
          cardNumberLabel.text = "\(paymentMethod), \(LocalizedKey.ending.value) \(last4Digit)"
        }
        
        transactionIdLabel.text = "\(transaction.transactionId ?? "-")"
    }
    
    // MARK: - IBAction methods
    
    @IBAction func shareReceiptButtonAction(_ sender: Any) {
        let image = scrollView.screenshot() ?? UIImage()
        
        let receiptMessage = LocalizedKey.receipt.value
        let shareAll: [Any] = [receiptMessage, image]
        let activityViewController = UIActivityViewController(activityItems: shareAll, applicationActivities: nil)
        activityViewController.popoverPresentationController?.sourceView = self.view
        activityViewController.completionWithItemsHandler = { (_, success, _, _) in
          print(success ? APIKey.success : APIKey.failure)
        }
        
        present(activityViewController, animated: true, completion: nil)
    }
}

// MARK: - API Call

extension TransactionDetailVC {
    private func callTransactionDetailAPI() {
        
        guard let transactionId = transactionDetailVM.transactionId else {
            return
        }
        
        transactionDetailVM.transactionDetailAPI(transactionId: transactionId) { [weak self] (success, message) in
            
            guard let `self` = self else {
                return
            }
            
            if success {
                self.setupData()
            } else {
                self.showAlertWith(message: message)
            }
        }
    }
}
