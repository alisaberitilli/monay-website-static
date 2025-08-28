//
//  DebitCardCell.swift
//  Monay
//
//  Created by WFH on 17/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class DebitCardCell: UITableViewCell {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var cardImageView: UIImageView!
    @IBOutlet weak var cardTitleLabel: UILabel!
    @IBOutlet weak var btnCheckUncheck: UIButton!
    @IBOutlet weak var seperatorView: UIView!
    
    // MARK: - Instance properties
    
    var callbackCheckUncheck: ((Int) -> Void)?
    
    // MARK: - Helper methods
    
    func configure(cardType: CardType) {
        selectionStyle = .none
        cardImageView.image = cardType.isSelected ? #imageLiteral(resourceName: "ic_credit-card_selected") : #imageLiteral(resourceName: "ic_credit_card_unselected")
        cardTitleLabel.text = cardType.title
        btnCheckUncheck.isSelected = cardType.isSelected
    }
    
    // MARK: - IBAction methods
    
    @IBAction func checkUncheckButtonAction(_ sender: Any) {
        callbackCheckUncheck?(tag)
    }
}
