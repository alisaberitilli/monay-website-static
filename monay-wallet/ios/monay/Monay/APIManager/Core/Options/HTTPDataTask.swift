//
//  HTTPDataTask.swift
//  React
//
//  Created by Codiant on 4/27/19.
//  Copyright © 2019 Codiant Software Technologies Pvt ltd. All rights reserved.
//

import Foundation
import UIKit.UIImage

public enum HTTPDataTask {
    
    case request(parameters: HTTPParameters)
    
    /// Multi-part request.
    case requestFormData(parameters: HTTPParameters, files: [HTTPMultipartFile])
    
}
