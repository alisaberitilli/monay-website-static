//
//  PlaceholderDataSourceDelegate.swift
//  PlaceHolderDemo
//
//  Created by Ashish Shah on 23/08/17.
//  Copyright © 2017 Codiant. All rights reserved.
//

import Foundation
import UIKit

class PlaceholderDataSourceDelegate: NSObject {
    
    var placeholder: Placeholder
    public var currentApiPath: String?
    
    init(placeholder: Placeholder) {
        self.placeholder = placeholder
    }
    
    func fill(cell: CellPlaceholding, to placeholder: Placeholder, tintColor: UIColor?) {
        
        // apply style
        if let style = placeholder.style {
            cell.apply(style: style, tintColor: tintColor)
        }
        
        // apply data
        if let data = placeholder.data {
            cell.apply(data: data)
        }
    }
    
    func animate(cell: CellPlaceholding) {
        
        guard let imageView = cell.placeholderImageView else {
            return
        }
        
        let rotate = CGAffineTransform(rotationAngle: -0.2)
        let stretchAndRotate = rotate.scaledBy(x: 0.5, y: 0.5)
        imageView.transform = stretchAndRotate
        imageView.alpha = 0.5
        
        UIView.animate(withDuration: 1.5, delay: 0.0, usingSpringWithDamping:  0.35, initialSpringVelocity: 4.0, options:[.curveEaseOut], animations: {
            imageView.alpha = 1.0
            let rotate = CGAffineTransform(rotationAngle: 0.0)
            let stretchAndRotate = rotate.scaledBy(x: 1.0, y: 1.0)
            imageView.transform = stretchAndRotate
            
        }, completion: nil)
        
        guard let button = cell.actionButton else {
            return
        }
        
        let stretch = CGAffineTransform(scaleX: 0.5, y: 0.5)
        button.transform = stretch
        button.alpha = 0.5
        
        UIView.animate(withDuration: 1.5, delay: 0.0, usingSpringWithDamping:  0.35, initialSpringVelocity: 4.0, options:[.curveEaseOut], animations: {
            button.alpha = 1.0
            let stretch = CGAffineTransform(scaleX: 1.0, y: 1.0)
            button.transform = stretch
            
        }, completion: nil)
        
    }
}

extension PlaceholderDataSourceDelegate: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return placeholder.cellIdentifier != nil ? 3 : 1
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let reuseIdentifier = placeholder.cellIdentifier ?? TableViewCell.reuseIdentifier
        
        guard let cell = tableView.dequeueReusableCell(withIdentifier: reuseIdentifier) else {
            fatalError(
              "\(LocalizedKey.failedToDequeue.value) \(reuseIdentifier). "
                + "\(LocalizedKey.messageCheckReuseIdentifier.value) "
                + "\(LocalizedKey.messageRegisterCellBeforehand.value)"
            )
        }
        
        cell.selectionStyle = .none
        
        // If the cell does not inherit from PlaceholderTableViewCell, the data and the style can't be applied
        guard let placeholderTableViewCell = (cell as? TableViewCell) else {
            return cell
        }
        
        fill(cell: placeholderTableViewCell, to: placeholder, tintColor: tableView.tintColor)
        
        // forward action to placeholder delegate
        placeholderTableViewCell.onActionButtonTap = { [weak self] in
            guard let strongSelf = self, let placeholderTableView = (tableView as? TableView) else {
                return
            }
            //placeholderTableView.showDefault()
            placeholderTableView.placeholderDelegate?.placeHolderActionOn(strongSelf,
                                                                          placeholder: strongSelf.placeholder,
                                                                          requestedApiPath: strongSelf.currentApiPath)
        }
        return cell
    }
}


// MARK: - table view delegate methods 
extension PlaceholderDataSourceDelegate: UITableViewDelegate {
    
    // the placeholder cell takes always the size of the table view
    func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        
        var height = tableView.bounds.height
        /*if #available(iOS 10, *) {
         height -= tableView.refreshControl?.bounds.height ?? 0
         } */
        height -= (tableView.contentInset.top +  tableView.contentInset.bottom)
      
      if let header = tableView.tableHeaderView {
        height -= header.bounds.height
      }
        return height
    }
    
    // animate the cell
    func tableView(_ tableView: UITableView, willDisplay cell: UITableViewCell, forRowAt indexPath: IndexPath) {
        tableView.scrollRectToVisible(CGRect(x: 0, y: 0, width: 1, height: 1), animated: false)
        
        guard let placeholderTableViewCell = cell as? TableViewCell else {
            return
        }
        
        animate(cell: placeholderTableViewCell)
    }
}


// MARK: - collection view data source methods
extension PlaceholderDataSourceDelegate: UICollectionViewDataSource {
    
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return placeholder.cellIdentifier != nil ? 3 : 1
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let reuseIdentifier = placeholder.cellIdentifier ?? CollectionViewCell.reuseIdentifier
        let cell = collectionView.dequeueReusableCell(withReuseIdentifier: reuseIdentifier, for: indexPath)
        
        // If the cell does not inherit from PlaceholderTableViewCell, the data and the style can't be applied
        guard let placeholderCollectionViewCell = (cell as? CollectionViewCell) else {
            return cell
        }
        
        fill(cell: placeholderCollectionViewCell, to: placeholder, tintColor: collectionView.tintColor)
        
        // forward action to placeholder delegate
        placeholderCollectionViewCell.onActionButtonTap = { [unowned self] in
            guard let placeholderCollectionView = (collectionView as? CollectionView) else { return }
            
            placeholderCollectionView.showDefault()
            placeholderCollectionView
              .placeholderDelegate?
              .placeHolderActionOn(self, placeholder: self.placeholder, requestedApiPath: self.currentApiPath)
        }
        
        return cell
    }
}

extension PlaceholderDataSourceDelegate: UICollectionViewDelegateFlowLayout {
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
        
        var height = collectionView.bounds.height
        if #available(iOS 10, *) {
            height -= collectionView.refreshControl?.bounds.height ?? 0
        }
        height -= (collectionView.contentInset.top +  collectionView.contentInset.bottom)
        return CGSize(width: collectionView.bounds.width, height: height)
    }
}

