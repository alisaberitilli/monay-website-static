//
//  Document.swift
//  Monay
//
//  Created by Aayushi Bhagat on 08/09/22.
//  Copyright © 2022 Codiant. All rights reserved.
//

import Foundation
import ObjectMapper

struct DocumentData: Mappable {
    
    var picture: [Document]?
    var address: [Document]?
    
    init?(map: Map) {}
    
    mutating func mapping(map: Map) {
      picture <- map["picture"]
      address <- map["address"]
    }
}

struct Document: Mappable {
  
  var id: String? 
  var requiredDocumentName: String?
  var documentKey: String?
  var countryCode: String?
  var type: String?
  var uploadImageCount: Int?

  init?(map: Map) {}
  
  mutating func mapping(map: Map) {
    id <- (map["id"], intToStringTransform)
    requiredDocumentName <- map["requiredDocumentName"]
    documentKey <- map["documentKey"]
    countryCode <- map["countryCode"]
    type <- map["type"]
    uploadImageCount <- map["uploadImageCount"]
  }

}

struct DataSource {
    let headerTitle: String
    var options: [Option]
    let type: OptionType
    let idType: IdentificationType
    var imageCount: Int = 0
}

struct Option {
    let name: String
    var selectedOption = ""
  
    var isPickedImage = false
    var isFrontImagePicked = false // for image
    var isBackImagePicked = false // for image
  
    var pickedImage: UIImage? // image
    var pickedFrontImage: UIImage? // image
    var pickedBackImage: UIImage? // imag
    var uploadImageCount: Int?
    var isSelected: Bool = false
    var documentFront = ""
    var documentBack = ""
    var documentFrontData: Data?
    var documentBackData: Data?
    var extFront: String?
    var extBack: String?
    var mediaTypeFront: String?
    var mediaTypeBack: String?
}

enum OptionType {
    case title
    case image
}

enum IdentificationType {
    case idProof
    case addressProof
}
