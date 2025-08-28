//
//  CollectionViewCell.swift
//  PlaceHolderDemo
//
//  Created by Ashish Shah on 23/08/17.
//  Copyright © 2017 Codiant. All rights reserved.
//

import UIKit

class CollectionViewCell: UICollectionViewCell {

    var onActionButtonTap: (() -> Void)?
    
    @IBOutlet weak var titleLabel: UILabel?
    @IBOutlet weak var subtitleLabel: UILabel?
    @IBOutlet weak var placeholderImageView: UIImageView?
    @IBOutlet weak var actionButton: UIButton?
    @IBOutlet weak var activityIndicatorLoader: PlaceHolderLoader?

    override func awakeFromNib() {
        super.awakeFromNib()
    }
    
    var cellView: UIView {
        return self
    }
    
    //  MARK: - User interaction
    @IBAction func btnRetry_Action(_ sender: Any) {
        onActionButtonTap?()
    }
}

extension CollectionViewCell: Reusable {}
extension CollectionViewCell: NibLoadable {}
extension CollectionViewCell: CellPlaceholding {}

