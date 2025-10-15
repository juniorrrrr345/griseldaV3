import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Footer from '../components/Footer'

const Products = () => {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedFarm, setSelectedFarm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [previewProduct, setPreviewProduct] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  // Lire les paramètres d'URL au chargement
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    const farmParam = searchParams.get('farm')
    
    if (categoryParam) {
      setSelectedCategory(categoryParam)
    }
    if (farmParam) {
      setSelectedFarm(farmParam)
    }
  }, [searchParams])

  useEffect(() => {
    filterProducts()
  }, [searchTerm, selectedCategory, selectedFarm, allProducts])

  const fetchData = async () => {
    try {
      const { getAll } = await import('../utils/api')
      const productsData = await getAll('products')
      const categoriesData = await getAll('categories')
      const farmsData = await getAll('farms')
      
      setAllProducts(productsData)
      setProducts(productsData)
      setCategories(categoriesData)
      setFarms(farmsData)
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = [...allProducts]

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtre par catégorie
    if (selectedCategory) {
      filtered = filtered.filter(product => String(product.category) === String(selectedCategory))
    }

    // Filtre par farm
    if (selectedFarm) {
      filtered = filtered.filter(product => String(product.farm) === String(selectedFarm))
    }

    setProducts(filtered)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setSelectedFarm('')
  }

  if (loading) {
    return (
      <div className="min-h-screen cosmic-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-theme text-lg">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen cosmic-bg">
      <div className="pt-20 pb-8 sm:pb-16 lg:pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 flex flex-col items-center"
          >
            <div className="inline-block bg-black/90 backdrop-blur-xl rounded-full px-16 py-10 border-2 border-white/30 shadow-[0_0_40px_rgba(0,0,0,0.8)] mb-8">
              <h1 className="text-5xl md:text-7xl font-bold mb-3 text-white">
                Notre Boutique
              </h1>
              <p className="text-lg text-gray-300">
                Découvrez notre sélection de produits choisis avec amour
              </p>
            </div>

            {/* Barre de recherche */}
            <div className="max-w-3xl mx-auto w-full">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher un produit..."
                  className="w-full px-6 py-4 pr-24 bg-slate-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-gray-500 transition-colors"
                />
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                >
                  <span>🔍</span>
                  <span className="hidden md:inline">Filtres</span>
                </button>
              </div>

              {/* Filtres déroulants */}
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-slate-900/50 border border-gray-700 rounded-xl"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Filtre catégorie */}
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Catégorie</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500"
                      >
                        <option value="">Toutes les catégories</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Filtre farm */}
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Farm</label>
                      <select
                        value={selectedFarm}
                        onChange={(e) => setSelectedFarm(e.target.value)}
                        className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500"
                      >
                        <option value="">Toutes les farms</option>
                        {farms.map((farm) => (
                          <option key={farm.id} value={farm.id}>
                            {farm.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Bouton réinitialiser */}
                    <div className="flex items-end">
                      <button
                        onClick={clearFilters}
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Réinitialiser
                      </button>
                    </div>
                  </div>

                  {/* Résumé des filtres */}
                  {(searchTerm || selectedCategory || selectedFarm) && (
                    <div className="mt-3 text-sm text-gray-400">
                      {products.length} produit(s) trouvé(s)
                      {searchTerm && ` pour "${searchTerm}"`}
                      {selectedCategory && ` dans ${selectedCategory}`}
                      {selectedFarm && ` de ${selectedFarm}`}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-xl">Aucun produit disponible pour le moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
              {products.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  index={index}
                  categories={categories}
                  farms={farms}
                  onPreview={() => setPreviewProduct(product)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Aperçu */}
      <AnimatePresence>
        {previewProduct && (
          <ProductPreview 
            product={previewProduct} 
            categories={categories}
            farms={farms}
            onClose={() => setPreviewProduct(null)} 
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}
