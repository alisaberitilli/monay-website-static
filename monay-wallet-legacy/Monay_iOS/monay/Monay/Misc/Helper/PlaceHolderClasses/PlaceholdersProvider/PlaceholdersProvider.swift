//
//  PlaceholdersProvider.swift
//  PlaceHolderDemo
//
//  Created by Ashish Shah on 23/08/17.
//  Copyright © 2017 Codiant. All rights reserved.
//

import Foundation

final public class PlaceholdersProvider {
    
    var placeholdersDictionary = [PlaceholderKey: PlaceholderDataSourceDelegate]()
    
    public init(loading: Placeholder, noSearchResults: Placeholder, noResults: Placeholder, noConnection: Placeholder, error : Placeholder, custom: Placeholder) {
        
        placeholdersDictionary = [loading.key: PlaceholderDataSourceDelegate(placeholder: loading),
                                  noSearchResults.key: PlaceholderDataSourceDelegate(placeholder: noSearchResults),
                                  noResults.key: PlaceholderDataSourceDelegate(placeholder: noResults),
                                  noConnection.key: PlaceholderDataSourceDelegate(placeholder: noConnection),
                                  error.key: PlaceholderDataSourceDelegate(placeholder: error),
                                  custom.key: PlaceholderDataSourceDelegate(placeholder: custom)]
    }
    
    public init(placeholders: Placeholder...) {
        placeholders.forEach {
            placeholdersDictionary[$0.key] = PlaceholderDataSourceDelegate(placeholder: $0)
        }
    }
    
    /// Allows you to add new placeholders
    public func add(placeholders: Placeholder...) {
        placeholders.forEach {
            placeholdersDictionary[$0.key] = PlaceholderDataSourceDelegate(placeholder: $0)
        }
    }
    
    func loadingDataSource() -> PlaceholderDataSourceDelegate?  {
        return dataSourceAndDelegate(with: .loadingKey)!
    }
    
    func noResultsDataSource() -> PlaceholderDataSourceDelegate?  {
        return dataSourceAndDelegate(with: .noResultsKey)!
    }
    
    func noSearchResultsDataSource() -> PlaceholderDataSourceDelegate?  {
        return dataSourceAndDelegate(with: .noSearchResult)!
    }
    
    func noConnectionDataSource() -> PlaceholderDataSourceDelegate?  {
        return dataSourceAndDelegate(with: .noConnectionKey)
    }
    
    func errorDataSource() -> PlaceholderDataSourceDelegate?  {
        return dataSourceAndDelegate(with: .errorKey)!
    }
    
    func customDataSource() -> PlaceholderDataSourceDelegate?  {
        return dataSourceAndDelegate(with: .custom)!
    }
    
    func dataSourceAndDelegate(with key: PlaceholderKey) -> PlaceholderDataSourceDelegate? {
        return placeholdersDictionary[key]
    }
}

