//
//  DropDownTableViewCell.swift
//  DropDownList
//
//  Created by Arjun Hanswal on 17/02/20.
//  Copyright © 2020 Codiant technologies. All rights reserved.
//

import UIKit
import RxCocoa
import RxSwift

struct DropDownData {
    var title: String?
    var subtitle: String?
}

class DropDownTableViewCell: UITableViewCell, ConfigurableCell {

    @IBOutlet weak var lblSubTitle: UILabel!
    @IBOutlet weak var lblTitle: UILabel!
    
    var disposeBag = DisposeBag()

    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }

    override func prepareForReuse() {
        super.prepareForReuse()
        disposeBag = DisposeBag() // because life cicle of every cell ends on prepare for reuse
    }

    func configure(data item: DropDownData) {
        lblTitle.text = item.title
      lblSubTitle.text = "\(LocalizedKey.accountNumber.value) \(LocalizedKey.secureText.value) \(item.subtitle ?? "")"
    }
}
