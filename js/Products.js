/* global L */
'use strict'

import 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
import Fuse from 'https://unpkg.com/fuse.js@7.0.0/dist/fuse.basic.min.mjs'
import { map } from './map.js'
import { loadJSON } from './Graph.js'
import Astar from './Pathfinding.js'

const loadedGraph = await loadJSON()
const astar = new Astar(loadedGraph)

/**
 * Class for products
 */
class Product {
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

  /**
   * Show product on map
   */
  showMarker = () => {
    this.marker.addTo(map)
    this.marker.bindPopup(this.name).openPopup()
  }

  /**
   * Hide product on map
   */
  hideMarker = () => {
    this.marker.remove()
  }
}

/**
 * Load JSON data of products
 */
async function loadProducts () {
  const payload = []

  try {
    const response = await fetch('./map/products.json')
    const jsonFeature = await response.json()
    jsonFeature.forEach((element) => payload.push(new Product(element)))
    return payload
  } catch (error) {
    console.error('Fehler beim Laden der Produkte:', error)
  }
}

const products = await loadProducts()

/**
 * Search for product name
 * @param {String} query Search String
 * @returns {Product} found Product
 */
export function findProduct (query, userPosition) {
  const found = products.find((element) => element.name === query)

  const nearestNode = astar.nearestNode(userPosition, loadedGraph)
  astar.search(nearestNode, loadedGraph[found.nodeIndex])

  return { product: found, astar }
}

/**
 * Fuzzy search for products
 * @param {String} query Searchquery
 * @returns Array of more or less matching products
 */
export function searchProducts (query) {
  const fuse = new Fuse(products, {
    keys: ['name'],
    threshold: 0.3 // 0.0 = perfect match; 1.0 = no match at all
  })
  return fuse.search(query, { limit: 7 })
}
