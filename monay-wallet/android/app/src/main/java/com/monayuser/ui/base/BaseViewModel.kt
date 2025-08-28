package com.monayuser.ui.base

import androidx.databinding.ObservableBoolean
import androidx.lifecycle.ViewModel
import io.reactivex.disposables.CompositeDisposable

/**
 * The type Base view model.
 *
 * @param <N> the type parameter
</N> */
/*Base VM for BaseViewModel classes*/
/**
 * Instantiates a  Base view model.
 */
abstract class BaseViewModel<N> : ViewModel() {


  /**
   * Get is loading.
   *
   * @return the is loading
   */
  val isLoading = ObservableBoolean(false)
  protected val disposable = CompositeDisposable()

  /**
   * Get navigator.
   *
   * @return the navigator
   */
  /**
   * Set navigator.
   *
   * @param navigator the navigator
   */
  var navigator: N? = null

  override fun onCleared() {
    super.onCleared()
  }

  /**
   * Set is loading.
   *
   * @param isLoading the is loading
   */
  fun setIsLoading(isLoading: Boolean) {
    this.isLoading.set(isLoading)
  }
}
