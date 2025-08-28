//
//  PaymentRequestDetailVC.swift
//  Monay
//
//  Created by WFH on 21/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class PaymentRequestDetailVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var userImageView: UIImageView!
    @IBOutlet weak var userNameLabel: UILabel!
    @IBOutlet weak var numberLabel: UILabel!
    @IBOutlet weak var amountTextField: UITextField!
    @IBOutlet weak var messageTextView: UITextView!
    
    // MARK: - View controller lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
    }
    
    // MARK: - IBAction methods
    
    @IBAction func payButtonAction(_ sender: Any) {
    }
    
    @IBAction func declineButtonAction(_ sender: Any) {
    }
}
