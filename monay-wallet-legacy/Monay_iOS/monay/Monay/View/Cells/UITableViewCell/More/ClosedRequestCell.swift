//
//  ClosedRequestCell.swift
//  Monay
//
//  Created by Aayushi on 19/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class ClosedRequestCell: UITableViewCell {

     // MARK: - IBOutlet properties
    
    @IBOutlet weak var arrowButton: UIButton!
    @IBOutlet weak var questionLabel: UILabel!
    @IBOutlet weak var answerLabel: UILabel!
    @IBOutlet weak var timeLabel: UILabel!
    @IBOutlet weak var statusLabel: UILabel!
    @IBOutlet weak var timeAndCloseStackView: UIStackView!
    
    // MARK: - Type properties
    
    static let reuseIdentifier = "ClosedRequestCell"
    
    // MARK: - Instance properties
    
    var callback: ((ClosedRequestCell) -> Void)?
    
    // MARK: - Helper methods

    func configure(_ closeRequest: SupportRequest) {
        questionLabel.text = closeRequest.message
        answerLabel.text = closeRequest.response
      let createdAt = closeRequest.createdAt?.UTCToLocal(format: DateFormate.hhmma .rawValue, sourceFormat: DateFormate.yyyyMMddT.rawValue)
        timeLabel.text = createdAt
        answerLabel.isHidden = closeRequest.collapsed
        timeAndCloseStackView.isHidden = closeRequest.collapsed
        let image = closeRequest.collapsed ? #imageLiteral(resourceName: "ic_add") : #imageLiteral(resourceName: "ic_minus")
        arrowButton.setImage(image, for: .normal)
    }
    
    // MARK: - IBAction methods

    @IBAction func arrowButton_Action(_ sender: UIButton) {
        if let callback = self.callback {
            callback(self)
        }
    }
}
