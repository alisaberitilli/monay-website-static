//
//  CardType.swift
//  Monay
//
//  Created by WFH on 17/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

class CardType {  // Credit card and Debit card
    var title: String!
    var isSelected = false

    init(title: String, isCheck: Bool) {
        self.title = title
        self.isSelected = isCheck
    }
}
