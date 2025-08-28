//
//  DeclineDetailVC.swift
//  Monay
//
//  Created by WFH on 19/01/21.
//  Copyright © 2021 Codiant. All rights reserved.
//

import UIKit

class DeclineDetailVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var userImageView: UIImageView!
    @IBOutlet weak var amountLabel: UILabel!
    @IBOutlet weak var statusLabel: UILabel!
    @IBOutlet weak var userNameLabel: UILabel!
    @IBOutlet weak var declineAmountLabel: UILabel!
    @IBOutlet weak var dateLabel: UILabel!
    @IBOutlet weak var messageLabel: UILabel!
    @IBOutlet weak var transactionIdLabel: UILabel!
    @IBOutlet weak var paymentMethodLabel: UILabel!
    @IBOutlet weak var successFailedImageView: UIImageView!
    @IBOutlet weak var scrollView: UIScrollView!
    
    // MARK: - Instance properties
    
    let declineDetailVM = DeclineDetailVM()
    
    // MARK: - View controller lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        initalSetup()
    }
    
    // MARK: - Helper methods
    
    private func initalSetup() {
        setupData()
    }
    
    private func setupData() {
        
        guard let request = declineDetailVM.request else {
            return
        }
        
        let user = declineDetailVM.comeFromMyRequest ? request.toUser : request.fromUser
        
        let profileString = user?.profilePictureUrl ?? ""
        if let profileUrl = URL(string: profileString) {
            userImageView.setImage(with: profileUrl)
        }
        
        let status = request.status?.capitalized ?? ""
        statusLabel.text = status
        userNameLabel.text = "\(user?.firstName ?? "") \(user?.lastName ?? "")"
        
        if let amount = request.amount {
            let currency = Authorization.shared.userCredentials.country?.currencyCode ?? ""
            amountLabel.text = "\(currency) \(amount)"
            declineAmountLabel.text = "\(status) \(currency) \(amount)"
        }
        
      let createdAt = request.createdAt?.UTCToLocal(format: DateFormate.ddMMMyyyyhhmma.rawValue, sourceFormat: DateFormate.yyyyMMddT.rawValue)
        dateLabel.text = createdAt
      messageLabel.text = status == LocalizedKey.declined.value.capitalized ? (request.declineReason ?? "-") : (request.message ?? "-")
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
