// scripts/fix-static-files.js
const fs = require('fs');
const path = require('path');

function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Création du répertoire: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
    return true;
  }
  return false;
}

function copyFile(source, target) {
  try {
    fs.copyFileSync(source, target);
    console.log(`Fichier copié: ${target}`);
  } catch (error) {
    console.error(`Erreur lors de la copie du fichier ${source} vers ${target}:`, error);
  }
}

function listFiles(dir) {
  try {
    return fs.readdirSync(dir);
  } catch (error) {
    console.error(`Erreur lors de la lecture du répertoire ${dir}:`, error);
    return [];
  }
}

// Fonction principale
function fixStaticFiles() {
  console.log('Début de la vérification et correction des fichiers statiques...');
  
  // Chemins des répertoires
  const publicDir = path.join(__dirname, '..', 'public');
  const assetsDir = path.join(publicDir, 'assets');
  const imgDir = path.join(assetsDir, 'img');
  const optionsDir = path.join(imgDir, 'options');
  
  // S'assurer que tous les répertoires existent
  ensureDirectoryExists(publicDir);
  ensureDirectoryExists(assetsDir);
  ensureDirectoryExists(imgDir);
  ensureDirectoryExists(optionsDir);
  
  // Vérifier les permissions des répertoires
  try {
    fs.accessSync(publicDir, fs.constants.R_OK | fs.constants.W_OK);
    fs.accessSync(assetsDir, fs.constants.R_OK | fs.constants.W_OK);
    fs.accessSync(imgDir, fs.constants.R_OK | fs.constants.W_OK);
    fs.accessSync(optionsDir, fs.constants.R_OK | fs.constants.W_OK);
    console.log('Tous les répertoires ont les permissions correctes');
  } catch (error) {
    console.error('Problème de permissions sur les répertoires:', error);
    
    // Tenter de corriger les permissions
    try {
      fs.chmodSync(publicDir, 0o755);
      fs.chmodSync(assetsDir, 0o755);
      fs.chmodSync(imgDir, 0o755);
      fs.chmodSync(optionsDir, 0o755);
      console.log('Permissions des répertoires corrigées');
    } catch (chmodError) {
      console.error('Impossible de corriger les permissions:', chmodError);
    }
  }
  
  // Lister les fichiers dans le répertoire des options
  const optionsFiles = listFiles(optionsDir);
  console.log(`Nombre de fichiers dans le répertoire des options: ${optionsFiles.length}`);
  
  if (optionsFiles.length === 0) {
    console.log('Aucun fichier trouvé dans le répertoire des options. Tentative de création de fichiers de test...');
    
    // Créer un fichier de test
    const testFilePath = path.join(optionsDir, 'test.txt');
    try {
      fs.writeFileSync(testFilePath, 'Ceci est un fichier de test');
      console.log(`Fichier de test créé: ${testFilePath}`);
    } catch (error) {
      console.error(`Erreur lors de la création du fichier de test:`, error);
    }
  } else {
    console.log('Fichiers trouvés dans le répertoire des options:');
    optionsFiles.forEach(file => {
      console.log(`- ${file}`);
    });
  }
  
  console.log('Vérification et correction des fichiers statiques terminée');
}

// Exécuter la fonction
fixStaticFiles();
