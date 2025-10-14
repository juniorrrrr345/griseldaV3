#!/usr/bin/env node

const { execSync } = require('child_process')

// Bases de données
const OLD_DB_ID = 'b38148fa-7325-4c06-99a3-ebeed3c8ea6f'
const NEW_DB_NAME = 'gd33v3'  // Nom de la base

const TABLES = ['products', 'categories', 'farms', 'socials', 'settings']

function executeCommand(command) {
  try {
    return execSync(command, { encoding: 'utf-8', stdio: 'pipe' })
  } catch (error) {
    console.error('❌ Erreur:', error.message)
    return null
  }
}

function initNewDatabase() {
  console.log('🔧 Initialisation de la base gd33v3...\n')
  
  const schema = `CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, category TEXT, farm TEXT, photo TEXT, video TEXT, medias TEXT, variants TEXT, price TEXT, createdAt TEXT, updatedAt TEXT); CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY, name TEXT NOT NULL, icon TEXT, description TEXT); CREATE TABLE IF NOT EXISTS socials (id TEXT PRIMARY KEY, name TEXT NOT NULL, icon TEXT, description TEXT, url TEXT); CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT); CREATE TABLE IF NOT EXISTS farms (id TEXT PRIMARY KEY, name TEXT NOT NULL, image TEXT, description TEXT); CREATE TABLE IF NOT EXISTS admin_users (id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL, createdAt TEXT, updatedAt TEXT);`
  
  const cmd = `npx wrangler d1 execute ${NEW_DB_NAME} --remote --command "${schema}"`
  const result = executeCommand(cmd)
  
  if (result !== null) {
    console.log('✅ Base de données initialisée\n')
    return true
  }
  return false
}

function exportTable(tableName) {
  console.log(`📤 Export de "${tableName}"...`)
  
  const cmd = `npx wrangler d1 execute ${OLD_DB_ID} --remote --command "SELECT * FROM ${tableName}" --json`
  const output = executeCommand(cmd)
  
  if (!output) {
    console.log(`   ⚠️  Impossible d'exporter ${tableName}`)
    return []
  }
  
  try {
    const data = JSON.parse(output)
    console.log(`   ✅ ${data.length} ligne(s) exportée(s)`)
    return data
  } catch (error) {
    console.log(`   ⚠️  Aucune donnée dans ${tableName}`)
    return []
  }
}

function importTable(tableName, rows) {
  if (rows.length === 0) {
    console.log(`   ⏭️  Aucune donnée à importer\n`)
    return
  }
  
  console.log(`📥 Import de "${tableName}"...`)
  
  let imported = 0
  
  for (const row of rows) {
    const columns = Object.keys(row).join(', ')
    const values = Object.values(row).map(v => {
      if (v === null) return 'NULL'
      return `'${String(v).replace(/'/g, "''")}'`
    }).join(', ')
    
    const insertCmd = `npx wrangler d1 execute ${NEW_DB_NAME} --remote --command "INSERT OR REPLACE INTO ${tableName} (${columns}) VALUES (${values})"`
    
    if (executeCommand(insertCmd)) {
      imported++
    }
  }
  
  console.log(`   ✅ ${imported} ligne(s) importée(s)\n`)
}

function createDefaultAdmin() {
  console.log('👤 Création du compte admin...')
  
  const cmd = `npx wrangler d1 execute ${NEW_DB_NAME} --remote --command "INSERT OR IGNORE INTO admin_users (id, username, password, createdAt, updatedAt) VALUES ('default-admin', 'admin', 'admin123', datetime('now'), datetime('now'))"`
  
  if (executeCommand(cmd)) {
    console.log('   ✅ Compte admin créé (admin / admin123)\n')
  }
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════════╗')
  console.log('║                                                       ║')
  console.log('║  🔄 MIGRATION → GD33V3                               ║')
  console.log('║                                                       ║')
  console.log('╚═══════════════════════════════════════════════════════╝\n')
  
  console.log(`📍 Source : b38148fa...`)
  console.log(`📍 Cible  : gd33v3\n`)
  
  if (!initNewDatabase()) {
    console.error('❌ Erreur initialisation')
    process.exit(1)
  }
  
  console.log('🔄 Migration des données...\n')
  
  for (const table of TABLES) {
    const rows = exportTable(table)
    importTable(table, rows)
  }
  
  createDefaultAdmin()
  
  console.log('╔═══════════════════════════════════════════════════════╗')
  console.log('║                                                       ║')
  console.log('║  🎉 MIGRATION TERMINÉE !                             ║')
  console.log('║                                                       ║')
  console.log('╚═══════════════════════════════════════════════════════╝\n')
  
  console.log('✅ Base gd33v3 prête avec tous vos produits !')
  console.log('   Login : admin / admin123\n')
}

main().catch(error => {
  console.error('\n❌ Erreur:', error.message)
  process.exit(1)
})