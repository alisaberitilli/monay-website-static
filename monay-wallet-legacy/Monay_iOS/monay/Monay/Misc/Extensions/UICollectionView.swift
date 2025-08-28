//
//  UICollectionView.swift
//  Monay
//
//  Created by WFH on 16/10/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation

extension UICollectionView {
    func reloadDataInMain() {
        DispatchQueue.main.async {
            self.reloadData()
        }
    }
}
