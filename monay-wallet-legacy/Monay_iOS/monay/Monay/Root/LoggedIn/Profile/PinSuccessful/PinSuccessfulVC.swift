//
//  PinSuccessfulVC.swift
//  Monay
//
//  Created by Aayushi on 05/11/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class PinSuccessfulVC: UIViewController {

    // MARK: - Instance properties

    var onProceed: (() -> Void)?

    override func viewDidLoad() {
        super.viewDidLoad()
    }
  
    // MARK: - IBAction methods
    
    @IBAction func proceedButtonAction(_ sender: Any) {
        dismiss()
        onProceed?()
    }

}
