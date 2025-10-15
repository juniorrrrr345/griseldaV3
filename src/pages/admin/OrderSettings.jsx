import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getAll, save } from '../../utils/api'

const AdminOrderSettings = () => {
  const [settings, setSettings] = useState({
    orderLink: '',
    orderButtonText: 'Commander'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const data = await getAll('settings')
      
      // Les settings sont stockées comme { key: value, key2: value2 }
      // Extraire orderLink et orderButtonText
      const orderLink = data.orderLink?.value || data.orderLink || ''
      const orderButtonText = data.orderButtonText?.value || data.orderButtonText || 'Commander'
      
      setSettings({
        orderLink: orderLink,
        orderButtonText: orderButtonText
      })
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://griselda-v3.calitek-junior.workers.dev'
      
      // Sauvegarder orderLink
      await fetch(`${API_URL}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'orderLink',
          value: settings.orderLink
        })
      })
      
      // Sauvegarder orderButtonText
      await fetch(`${API_URL}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'orderButtonText',
          value: settings.orderButtonText
        })
      })
      
      alert('✅ Paramètres de commande enregistrés avec succès !')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('❌ Erreur lors de la sauvegarde: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gradient glow-effect mb-2">
          Paramètres de Commande
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Configurez le lien et le texte du bouton de commande
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        {/* Lien de commande */}
        <div className="border border-gray-700 rounded-xl p-6 bg-slate-900/50">
          <h3 className="text-xl font-bold text-white mb-4">🔗 Lien de Commande</h3>
          <div>
            <label className="block text-gray-400 mb-2 text-sm">
              Lien externe (WhatsApp, Telegram, formulaire, etc.)
            </label>
            <input
              type="url"
              value={settings.orderLink}
              onChange={(e) => setSettings({ ...settings, orderLink: e.target.value })}
              className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500 transition-colors"
              placeholder="https://wa.me/123456789"
            />
            <p className="text-gray-500 text-xs mt-2">
              Exemple WhatsApp : https://wa.me/33123456789<br/>
              Exemple Telegram : https://t.me/username
            </p>
          </div>
        </div>

        {/* Texte du bouton */}
        <div className="border border-gray-700 rounded-xl p-6 bg-slate-900/50">
          <h3 className="text-xl font-bold text-white mb-4">💬 Texte du Bouton</h3>
          <div>
            <label className="block text-gray-400 mb-2 text-sm">
              Texte affiché sur le bouton de commande
            </label>
            <input
              type="text"
              value={settings.orderButtonText}
              onChange={(e) => setSettings({ ...settings, orderButtonText: e.target.value })}
              className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500 transition-colors"
              placeholder="Commander"
              maxLength="30"
            />
            <p className="text-gray-500 text-xs mt-2">
              Maximum 30 caractères
            </p>
          </div>
        </div>

        {/* Aperçu */}
        <div className="border border-gray-700 rounded-xl p-6 bg-slate-900/50">
          <h3 className="text-xl font-bold text-white mb-4">👁️ Aperçu</h3>
          <div className="flex items-center justify-center py-8">
            <button
              type="button"
              className="px-8 py-4 bg-gradient-to-r from-white to-gray-200 rounded-lg text-black font-bold text-lg hover:from-gray-200 hover:to-gray-400 transition-all transform hover:scale-105 flex items-center space-x-2"
            >
              <span>💬</span>
              <span>{settings.orderButtonText || 'Commander'}</span>
            </button>
          </div>
        </div>

        {/* Bouton Sauvegarder */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-4 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Enregistrement...' : '💾 Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminOrderSettings
