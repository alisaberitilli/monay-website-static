
import Foundation
import UIKit

/// The Placeholder object, is used to create placeholders
public struct Placeholder {
    
    public var data: PlaceholderData?

    public var style: PlaceholderStyle?
    
    public let cellIdentifier: String?
    
    public let key: PlaceholderKey
    
    public init(cellIdentifier: String? = nil, data: PlaceholderData? = nil, style: PlaceholderStyle? = nil, key: PlaceholderKey) {
        
        self.key = key
        self.cellIdentifier = cellIdentifier
        self.style = style
        self.data = data
    }
}
