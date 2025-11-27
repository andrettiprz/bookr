# 🚀 INSTRUCCIONES DE DEPLOYMENT - LISTO PARA AZURE

## ✅ **CONFIGURACIÓN COMPLETADA**

El proyecto YA ESTÁ configurado para Azure:
- ✅ Modo Azure activado (`USE_LOCAL_MODE = false`)
- ✅ Frontend compilado exitosamente
- ✅ Backend listo para desplegar
- ✅ Infraestructura Bicep lista

## 📋 **SOLO NECESITAS 3 COMANDOS:**

### **1️⃣ Commit y Push**

```bash
cd /Users/andrettiprz/Documents/My\ Stuff/projects/bookr

git add .
git commit -m "feat: bookr app completa - lista para producción Azure"
git push origin main
```

### **2️⃣ Desplegar a Azure**

```bash
cd templates-params-scrips/bicep
./deploy.sh
```

**Esto desplegará TODO automáticamente:**
- ✅ Resource Group `bookr`
- ✅ Azure SQL Database (con schema)
- ✅ Azure Blob Storage
- ✅ Azure Functions (Backend API)
- ✅ Azure Static Web App (Frontend)

**Tiempo: 5-10 minutos**

### **3️⃣ Esperar GitHub Actions**

Después de que `deploy.sh` termine:
1. El Static Web App se crea
2. GitHub Actions detecta el push automáticamente
3. Despliega el frontend (2-3 minutos)
4. ✅ ¡Todo listo!

## 🌐 **URLs que Obtendrás:**

Al finalizar el deployment verás:

```
✅ Deployment completado!

URLs:
- Frontend: https://orange-meadow-04657c61e.azurestaticapps.net
- API:      https://bookr-api.azurewebsites.net
- SQL:      bookr-sql-server.database.windows.net
```

## 🎯 **Probar la Aplicación:**

1. Ir a la URL del Static Web App
2. Click en "Registrarse"
3. Crear tu cuenta
4. ¡Crear reservas!

**Todos los datos se guardarán en Azure SQL Database** 🎉

## 🔐 **Credenciales por Defecto:**

- **SQL Admin:** `bookradmin`
- **SQL Password:** `Bookr@2024!SQL`
- **JWT Secret:** Configurado automáticamente

## ⚠️ **IMPORTANTE:**

- Los datos están en Azure (no en localStorage)
- La primera vez la BD está vacía
- Necesitas crear una cuenta nueva
- Todo está persistido en la nube

## 🐛 **Si Algo Falla:**

### Verificar logs del deployment:
```bash
az deployment group show \
  --resource-group bookr \
  --name main \
  --query properties.error
```

### Ver logs de Functions:
```bash
az functionapp log tail \
  --name bookr-api \
  --resource-group bookr
```

### Reiniciar Function App:
```bash
az functionapp restart \
  --name bookr-api \
  --resource-group bookr
```

## 🗑️ **Eliminar Todo (Cuando termines):**

```bash
cd templates-params-scrips/bicep
./cleanup.sh
```

Esto borra el Resource Group completo con todos los recursos.

## 💰 **Costo Estimado:**

- Static Web App: **GRATIS**
- Azure Functions: **~$0-5/mes** (Consumption Plan)
- SQL Database: **~$5/mes** (Basic tier)
- Blob Storage: **~$0-1/mes**

**Total: ~$5-10/mes**

---

## ✨ **RESUMEN:**

```bash
# 1. Commit
git add . && git commit -m "feat: app lista para Azure" && git push

# 2. Deploy
cd templates-params-scrips/bicep && ./deploy.sh

# 3. Esperar y listo!
# Ve a la URL que te da el script
```

**¡ESO ES TODO! 🎉**

