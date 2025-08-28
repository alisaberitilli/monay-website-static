//
//  FAQCell.swift
//  Monay
//
//  Created by Aayushi on 19/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class FAQCell: UITableViewCell {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var arrowButton: UIButton!
    @IBOutlet weak var questionLabel: UILabel!
    @IBOutlet weak var answerLabel: UILabel!
    @IBOutlet weak var separatorView: UIView!
    
    // MARK: - Type properties
    
    static let reuseIdentifier = "FAQCell"
    
    // MARK: - Instance properties
    
    var callback: ((FAQCell) -> Void)?
    
    // MARK: - Helper methods
    
    func configure(_ faq: FAQ) {
        questionLabel.text = faq.question
        answerLabel.text = faq.answer
        answerLabel.isHidden = faq.collapsed
        let image = faq.collapsed ? #imageLiteral(resourceName: "ic_drop_down") : #imageLiteral(resourceName: "ic_up_arrow")
        arrowButton.setImage( image, for: .normal)
    }
    
    // MARK: - IBAction methods
    
    @IBAction func arrowButton_Action(_ sender: UIButton) {
        if let callback = self.callback {
            callback(self)
        }
    }
}
