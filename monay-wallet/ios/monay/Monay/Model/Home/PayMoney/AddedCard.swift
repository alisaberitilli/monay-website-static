//
//  AddedCard.swift
//  Monay
//
//  Created by WFH on 17/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class AddedCard {
    var image: UIImage!
    var title: String!
    var cardNumber: String!
    var isCheck = false
    
    init(image: UIImage, title: String, cardNumber: String, isCheck: Bool) {
        self.image = image
        self.title = title
        self.cardNumber = cardNumber
        self.isCheck = isCheck
    }
}
