//
//  CollectionView.swift
//  PlaceHolderDemo
//
//  Copyright © 2017 Codiant. All rights reserved.
//

import UIKit

open class CollectionView: UICollectionView {
    
    fileprivate weak var defaultDataSource: UICollectionViewDataSource?
    fileprivate weak var defaultDelegate: UICollectionViewDelegate?
    fileprivate var defaultAlwaysBounceVertical: Bool!
    fileprivate var defaultLayout: UICollectionViewLayout!
    fileprivate var placeholderLayout = UICollectionViewFlowLayout()
    
    public weak var placeholderDelegate: PlaceholderDelegate?
    public var currentApiRequestPath: String?
    public var stateDidChange: ((PlaceholderKey) -> ())?
    public var currentState: PlaceholderKey = .stateDefault {
        didSet {
            stateDidChange?(currentState)
        }
    }
    
    open override var collectionViewLayout: UICollectionViewLayout {
        didSet {
            if collectionViewLayout === placeholderLayout {
                return
            }
            defaultLayout = collectionViewLayout
        }
    }
  
  
    
    final public var placeholdersProvider = PlaceholdersProvider.defaultProvider {
        willSet {
            showDefault()
        }
    }
    
    open override weak var dataSource: UICollectionViewDataSource? {
        didSet {
            if dataSource is PlaceholderDataSourceDelegate {
                return
            }
            defaultDataSource = dataSource
        }
    }
    
    open override weak var delegate: UICollectionViewDelegate? {
        didSet {
            if delegate is PlaceholderDataSourceDelegate {
                return
            }
            defaultDelegate = delegate
        }
    }
    
    // MARK: - init methods
    required public init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        setup()
    }
    
    public override init(frame: CGRect, collectionViewLayout layout: UICollectionViewLayout) {
        super.init(frame: frame, collectionViewLayout: layout)
        setup()
    }
    
    private func setup() {
        // register the placeholder view cell
        register(cellType: CollectionViewCell.self)
        defaultAlwaysBounceVertical = alwaysBounceVertical
        defaultLayout = collectionViewLayout
    }

    fileprivate func switchTo(dataSource theDataSource: UICollectionViewDataSource?, delegate theDelegate: UICollectionViewDelegate? = nil) {
        if dataSource === theDataSource && delegate === theDelegate {
            return
        }
        
        dataSource = theDataSource
        delegate = theDelegate
        super.reloadData()
    }
    
    private func numberOfRowsInAllSections() -> Int {
        let numberOfSections = defaultDataSource?.numberOfSections?(in: self) ?? 1
        var rows = 0
        for i in 0 ..< numberOfSections {
            rows += defaultDataSource?.collectionView(self, numberOfItemsInSection: i) ?? 0
        }
        return rows
    }
    
    /// Retuen yes if The total number of rows in sections and number of the section is 0 in collectionview
    private func shouldShowNoResult() -> Bool {
        let numberOfSections = defaultDataSource?.numberOfSections?(in: self) ?? 1
        var rows = 0
        for i in 0 ..< numberOfSections {
            rows += defaultDataSource?.collectionView(self, numberOfItemsInSection: i) ?? 0
        }
        return numberOfSections > 0 ? false : !(rows > 0)
    }
    
    open override func reloadData() {
        if dataSource is PlaceholderDataSourceDelegate {
            showDefault()
            return
        }
        super.reloadData()
    }
}

// MARK: Utilities methods to switch to placeholders
extension CollectionView: PlaceholdersShowing {
    
    var provider: PlaceholdersProvider {
        return placeholdersProvider
    }

    func showPlaceholder(with dataSource: PlaceholderDataSourceDelegate) {
        dataSource.currentApiPath = currentApiRequestPath
        alwaysBounceVertical = false
        currentState = dataSource.placeholder.key
        switchTo(dataSource: dataSource, delegate: dataSource)
        collectionViewLayout = placeholderLayout
    }
    
    public func showDefault() {
        alwaysBounceVertical = true
        currentState = .stateDefault
        switchTo(dataSource: defaultDataSource, delegate: defaultDelegate)
        collectionViewLayout = defaultLayout
    }
}

extension UICollectionView {
    
    final func register<T: UICollectionViewCell>(cellType: T.Type)
        where T: Reusable & NibLoadable {
            self.register(cellType.nib, forCellWithReuseIdentifier: cellType.reuseIdentifier)
    }
}

