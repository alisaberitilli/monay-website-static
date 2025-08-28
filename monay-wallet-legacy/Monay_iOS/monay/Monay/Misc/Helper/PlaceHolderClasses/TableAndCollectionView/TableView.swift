//
//  TableView.swift
//  PlaceHolderDemo
//
//  Created by Ashish Shah on 22/08/17.
//  Copyright © 2017 Codiant. All rights reserved.
//

import UIKit

class TableView: UITableView {
  
  public weak var placeholderDelegate: PlaceholderDelegate?
  fileprivate weak var defaultHeaderView: UIView?
  fileprivate weak var defaultFooterView: UIView?
  fileprivate weak var defaultDataSource: UITableViewDataSource?
  fileprivate weak var defaultDelegate: UITableViewDelegate?
  internal var defaultSeparatorStyle: UITableViewCell.SeparatorStyle!
  fileprivate var defaultAlwaysBounceVertical: Bool!
  
  public var currentApiRequestPath: String?
  public var shouldHideHeaderView: Bool = true // default is true
  public var stateDidChange: ((PlaceholderKey) -> (Void))?
  public var currentState: PlaceholderKey = .stateDefault {
    didSet {
      stateDidChange?(currentState)
    }
  }
  
  final public var placeholdersProvider = PlaceholdersProvider.defaultProvider {
    willSet {
      showDefault()
    }
  }
  
  weak open override var dataSource: UITableViewDataSource? {
    didSet {
      if dataSource is PlaceholderDataSourceDelegate { return }
      defaultDataSource = dataSource
    }
  }
  
  open override weak var delegate: UITableViewDelegate? {
    didSet {
      if delegate is PlaceholderDataSourceDelegate { return }
      defaultDelegate = delegate
    }
  }
  
  override var tableHeaderView: UIView? {
    didSet {
      if tableHeaderView != nil {
        defaultHeaderView = tableHeaderView
      }
    }
  }
  
  override var tableFooterView: UIView? {
    didSet {
      if tableFooterView != nil {
        defaultFooterView = tableFooterView
      }
    }
  }
  
  required public init?(coder aDecoder: NSCoder) {
    super.init(coder: aDecoder)
    setup()
  }
  
  override init(frame: CGRect, style: UITableView.Style) {
    super.init(frame: frame, style: style)
    setup()
  }
  
  private func setup() {
    //register the placeholder view cell
    register(cellType: TableViewCell.self)
    
    defaultSeparatorStyle = separatorStyle
    defaultAlwaysBounceVertical = alwaysBounceVertical
  }
  
  fileprivate func switchTo(dataSource theDataSource: UITableViewDataSource?, delegate theDelegate: UITableViewDelegate? = nil) {
    
    // if the data source and delegate are already set, no need to switch
    if dataSource === theDataSource && delegate === theDelegate {
      return
    }
    
    dataSource = theDataSource
    delegate = theDelegate
    super.reloadData()
  }
  
  /// The total number of rows in all sections of the tableView
  private func numberOfRowsInAllSections() -> Int {
    let numberOfSections = defaultDataSource?.numberOfSections?(in: self) ?? 1
    var rows = 0
    for i in 0 ..< numberOfSections {
      rows += defaultDataSource?.tableView(self, numberOfRowsInSection: i) ?? 0
    }
    return rows
  }
  
  /// Retuen yes if The total number of rows in sections and number of the section is 0 in table view
  private func shouldShowNoResult() -> Bool {
    let numberOfSections = defaultDataSource?.numberOfSections?(in: self) ?? 1
    var rows = 0
    for i in 0 ..< numberOfSections {
      rows += defaultDataSource?.tableView(self, numberOfRowsInSection: i) ?? 0
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
extension TableView: PlaceholdersShowing {
  
  var provider: PlaceholdersProvider {
    return placeholdersProvider
  }
  
  func showPlaceholder(with dataSource: PlaceholderDataSourceDelegate) {
    
    dataSource.currentApiPath = currentApiRequestPath
    currentState = dataSource.placeholder.key
    separatorStyle = .none
    alwaysBounceVertical = false
    
    if shouldHideHeaderView {
      tableHeaderView = nil
    }
    
    tableFooterView = nil
    switchTo(dataSource: dataSource, delegate: dataSource)
  }
  
  public func showDefault() {
    separatorStyle  = defaultSeparatorStyle
    tableHeaderView = defaultHeaderView
    tableFooterView = defaultFooterView
    currentState    = .stateDefault
    alwaysBounceVertical = true
    switchTo(dataSource: defaultDataSource, delegate: defaultDelegate)
  }
}

extension UITableView {
  
  final func register<T: UITableViewCell>(cellType: T.Type)
    where T: Reusable & NibLoadable {
      self.register(cellType.nib, forCellReuseIdentifier: cellType.reuseIdentifier)
  }
}
