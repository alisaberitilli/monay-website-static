//
//  Collection.swift
//  DropDownList
//
//  Created by Arjun Hanswal on 17/02/20.
//  Copyright © 2020 Codiant technologies. All rights reserved.
//

import UIKit

extension Collection where Indices.Iterator.Element == Index {
   public subscript(safe index: Index) -> Iterator.Element? {
     return (startIndex <= index && index < endIndex) ? self[index] : nil
   }
}
