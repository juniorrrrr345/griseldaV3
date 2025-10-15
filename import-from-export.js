#!/usr/bin/env node

/**
 * Script d'Import des Produits depuis export-gd33v2.json
 * Importe tous les produits avec leurs prix vers la nouvelle base
 */

import { readFileSync } from 'fs';

const API_URL = 'https://thegd33.calitek-junior.workers.dev';
const EXPORT_FILE = './export-gd33v2.json';

console.log('🚀 Import des produits depuis export-gd33v2.json\n');

// Lire le fichier export
let data;
try {
  const fileContent = readFileSync(EXPORT_FILE, 'utf8');
  data = JSON.parse(fileContent);
} catch (error) {
  console.error('❌ Erreur lors de la lecture du fichier:', error.message);
  process.exit(1);
}

const products = data.products || [];
console.log(`📦 ${products.length} produits trouvés dans l'export\n`);

// Import asynchrone
async function importerProduits() {
  let succes = 0;
  let erreurs = 0;
  
  for (const product of products) {
    console.log(`📦 Import: ${product.name} (ID: ${product.id})`);
    console.log(`   Prix: ${product.price}`);
    console.log(`   Variants: ${product.variants?.length || 0}`);
    
    try {
      // Vérifier que le produit a bien des prix/variants
      if (!product.price && (!product.variants || product.variants.length === 0)) {
        console.log(`⚠️  ${product.name} - Pas de prix défini, ajout de prix par défaut`);
        product.price = 'N/A';
        product.variants = [{ name: 'Standard', price: 'N/A' }];
      }
      
      // S'assurer que variants existe et est un tableau
      if (!product.variants || !Array.isArray(product.variants)) {
        product.variants = [];
      }
      
      // Si variants est vide mais qu'on a un prix, créer un variant par défaut
      if (product.variants.length === 0 && product.price) {
        product.variants = [{ name: 'Standard', price: product.price }];
      }
      
      const response = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      });
      
      if (response.ok) {
        console.log(`✅ ${product.name} - Importé avec succès`);
        succes++;
      } else {
        const error = await response.text();
        console.log(`❌ ${product.name} - Erreur: ${error}`);
        erreurs++;
      }
      
      // Pause de 200ms entre chaque requête pour éviter de surcharger
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.log(`❌ ${product.name} - Erreur: ${error.message}`);
      erreurs++;
    }
    
    console.log(''); // Ligne vide
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 RÉSULTAT FINAL:');
  console.log('='.repeat(50));
  console.log(`✅ Produits importés avec succès: ${succes}`);
  console.log(`❌ Erreurs: ${erreurs}`);
  console.log(`📦 Total: ${products.length}`);
  console.log('\n🎉 Import terminé !');
}

// Lancer l'import
importerProduits().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
