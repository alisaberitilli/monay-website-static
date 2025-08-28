//
//  CompleteKYCVC.swift
//  Monay
//
//  Created by Aayushi on 28/11/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class CompleteKYCVC: UIViewController {

     // MARK: - IBOutlet properties
    
    @IBOutlet weak var messageLabel: UILabel!
    
    // MARK: - Instance properties
    
    let viewModel = CompleteKYCVM()
    var onComplete: (() -> Void)?
    var onCross: (() -> Void)?

    // MARK: - View controller lifecycle methods

    override func viewDidLoad() {
        super.viewDidLoad()
        initialSetup()
    }
    
    private func initialSetup() {
        messageLabel.text = viewModel.message
    }
    
    // MARK: - IBAction methods
    
    @IBAction func crossButtonAction(_ sender: UIButton) {
        dismiss()
        onCross?()
    }
    
    @IBAction func completeKYCButtonAction(_ sender: UIButton) {
      dismiss()
      onComplete?()
    }

}
