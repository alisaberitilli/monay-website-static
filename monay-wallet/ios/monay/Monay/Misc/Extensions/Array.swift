//
//  Array.swift
//  Monay
//
//  Created by WFH on 25/02/21.
//  Copyright © 2021 Codiant. All rights reserved.
//

import Foundation

extension Array {
    func unique<T: Hashable>(map: ((Element) -> (T))) -> [Element] {
        var set = Set<T>()
        var arrayOrdered = [Element]()
        
        for value in self {
            if !set.contains(map(value)) {
                set.insert(map(value))
                arrayOrdered.append(value)
            }
        }

        return arrayOrdered
    }
}
