//
//  MyCardCell.swift
//  Monay
//
//  Created by WFH on 13/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class MyCardCell: UITableViewCell {
    
     static let identifier = "MyCardCell"
     // MARK: - IBOutlet properties
    
    @IBOutlet weak var cardTypeImageView: UIImageView!
    @IBOutlet weak var cardLast4DigitLabel: UILabel!
    @IBOutlet weak var cardNameLabel: UILabel!
    @IBOutlet weak var epiresLabel: UILabel!
    @IBOutlet weak var cardBackgroudView: UIView!
    
    // MARK: - Instance properties
    
    var callbackDelete: ((MyCardCell) -> Void)?
    
    // MARK: - Helper methods
    
    func configure(card: Card) {
        selectionStyle = .none
        
        let cardIconUrlString = card.cardIconUrl ?? ""
        if let profileUrl = URL(string: cardIconUrlString) {
            cardTypeImageView.setImage(with: profileUrl)
        }
        
        cardLast4DigitLabel.text = card.last4Digit
        cardNameLabel.text = card.nameOnCard
        
        if let year4Digit = card.year,
            let month = card.month {
            let yearLast2Digit = String(year4Digit.suffix(2))
            epiresLabel.text = "\(month)/\(yearLast2Digit)"
        }
        
        cardBackgroudView.backgroundColor = tag % 2 == 0 ? #colorLiteral(red: 0.02745098039, green: 0.3098039216, blue: 0.9960784314, alpha: 1) : #colorLiteral(red: 0.1725490196, green: 0.6666666667, blue: 1, alpha: 1)
    }
    
    // MARK: - IBAction methods
    
    @IBAction func deleteButtonAction(_ sender: Any) {
        callbackDelete?(self)
    }
}
