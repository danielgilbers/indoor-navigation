'use strict'

import 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
import { products, map, loadedGraph } from './map.js'

/**
 * Class for products
 */
export class Product {
  /**
   * Create a product
   * @param {Object} Object containing nan, name and nodeIndex
   */
  constructor ({ nan, name, nodeIndex }) {
    this.nan = nan
    this.name = name
    this.nodeIndex = nodeIndex
    this.marker = new L.marker(loadedGraph[this.nodeIndex].latlng)
  }

  showMarker = () => {
    this.marker.addTo(map)
    this.marker.bindPopup(this.name).openPopup()
  }

  hideMarker = () => {
    this.marker.remove()
  }
}

/**
 * Load JSON data of products
 */
export function loadProducts () {
  fetch('./map/products.json')
    .then((response) => response.json())
    .then((jsonFeature) => {
      jsonFeature.forEach((element) => products.push(new Product(element)))
    })
}

/**
 * Search for product name
 * @param {String} query Search String
 * @returns {Product} found Product
 */
export function findProduct (query) {
  const found = products.find((element) => element.name === query)

  return found
}
