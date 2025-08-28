//
//  NewCardHeaderCell.swift
//  Monay
//
//  Created by WFH on 03/11/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class NewCardHeaderCell: UITableViewCell {
    
    static let identifier = "NewCardHeaderCell"
  
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var checkUncheckButton: UIButton!
    
    // MARK: - Instance properties
    
    var callBackCheckUncheck: (() -> Void)?
    
    // MARK: - Helper methods
    
    func configure(payBy: PayBy) {
        checkUncheckButton.isSelected = payBy == .newCard ? true : false
    }
    
    // MARK: - IBAction methods
    
    @IBAction func checkUncheckButtonAction(_ sender: UIButton) {
        callBackCheckUncheck?()
    }
}
