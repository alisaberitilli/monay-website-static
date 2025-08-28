//
//  AddCardCell.swift
//  Monay
//
//  Created by WFH on 17/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class AddCardCell: UITableViewCell {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var cardNumberTextField: CustomTextField!
    @IBOutlet weak var nameOnCardTextField: CustomTextField!
    @IBOutlet weak var monthButton: UIButton!
    @IBOutlet weak var yearButton: UIButton!
    @IBOutlet weak var cvvTextField: UITextField!
    
    // MARK: - Instance properties
    
    var callBackSelectMonth: (() -> Void)?
    var callBackSelectYear: (() -> Void)?
    var callBackInfo: (() -> Void)?
    
    // MARK: - Helper methods
    
    func configureCardTypeAndLengthValidation() {
        creditCardInput().groupSeparater = " "
        creditCardInput().initWithCardNumber(cardNumberTextField, expDateField: nil, cvvField: cvvTextField, cardLogo: nil)
    }
    
    // MARK: - IBAction methods
    
    @IBAction func monthButtonAction(_ sender: Any) {
        callBackSelectMonth?()
    }
    
    @IBAction func yearButtonAction(_ sender: Any) {
        callBackSelectYear?()
    }
    
    @IBAction func infoAction(_ sender: Any) {
        callBackInfo?()
    }
}
