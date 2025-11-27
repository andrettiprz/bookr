# 🚀 Guía de Deployment Completa

## 📋 Pasos para Desplegar a Azure

### PASO 1: Commit y Push al Repositorio

```bash
cd /Users/andrettiprz/Documents/My\ Stuff/projects/bookr

# Agregar todos los cambios
git add .

# Commit con mensaje descriptivo
git commit -m "feat: implementación completa con modo local y diseño premium"

# Push a GitHub
git push origin main
```

### PASO 2: Desplegar Infraestructura a Azure

```bash
# Navegar a la carpeta de scripts Bicep
cd templates-params-scrips/bicep

# Ejecutar script de deployment
./deploy.sh
```

**El script automáticamente:**
- ✅ Crea el Resource Group `bookr`
- ✅ Despliega Azure SQL Database
- ✅ Despliega Azure Blob Storage
- ✅ Despliega Azure Functions (API Backend)
- ✅ Despliega Azure Static Web App (Frontend)
- ✅ Inicializa el schema de la base de datos
- ✅ Configura todas las conexiones

**Tiempo estimado:** 5-10 minutos

**Al finalizar, verás:**
```
✅ Deployment completado exitosamente!

Recursos desplegados:
- Static Web App URL: https://orange-meadow-xyz.azurestaticapps.net
- Function App URL: https://bookr-api-xyz123.azurewebsites.net
- SQL Server: bookr-sql-server.database.windows.net
- Storage Account: bookrblobst
```

### PASO 3: Configurar Frontend para usar Azure Backend

#### 3.1 - Crear archivo de variables de entorno

```bash
cd ../../frontend

# Copiar el template
cp .env.example .env

# Editar el archivo .env
nano .env
```

#### 3.2 - Configurar la URL del Function App

En el archivo `.env`, reemplaza con la URL que obtuviste:

```env
VITE_API_URL=https://TU-FUNCTION-APP.azurewebsites.net/api
```

#### 3.3 - Cambiar a Modo Backend

Editar `frontend/src/services/api.js`:

```javascript
// Línea 3:
const USE_LOCAL_MODE = false; // ⬅️ Cambiar de true a false
```

#### 3.4 - Rebuild y Redeploy Frontend

```bash
# Desde la carpeta frontend/
npm run build

# Commit y push los cambios
cd ..
git add .
git commit -m "chore: cambiar a modo backend Azure"
git push origin main
```

**GitHub Actions automáticamente desplegará la nueva versión.**

### PASO 4: Verificar que Todo Funciona

1. **Ir a la URL del Static Web App:**
   ```
   https://orange-meadow-xyz.azurestaticapps.net
   ```

2. **Crear una cuenta nueva**
   - Los datos se guardarán en Azure SQL Database

3. **Crear reservas**
   - Se guardarán en la base de datos Azure

4. **Verificar conexión a BD:**
   ```bash
   cd templates-params-scrips/bicep
   
   # Conectarse a SQL
   az sql db show-connection-string \
     --server bookr-sql-server \
     --name bookr-sql-db \
     --client sqlcmd
   ```

## 🔄 Migrar Datos de Local a Azure (Opcional)

Si tienes datos en localStorage que quieres migrar:

### Exportar desde Local:

1. Ir a http://localhost:5174
2. Ir a Reservations
3. Click en "Exportar" → "JSON"
4. Guardar el archivo

### Importar a Azure:

Los datos se pueden agregar manualmente o crear un script de migración.

## 🗑️ Limpiar Recursos (Cuando termines)

```bash
cd templates-params-scrips/bicep
./cleanup.sh
```

Esto eliminará **TODOS** los recursos de Azure (Resource Group completo).

## ⚠️ IMPORTANTE - Diferencias entre Modo Local y Azure

| Aspecto | Modo Local | Modo Azure |
|---------|-----------|------------|
| **Datos** | localStorage (navegador) | Azure SQL Database |
| **Usuarios** | Sin hashear | Hasheados con bcrypt |
| **Tokens** | Simulados | JWT reales |
| **Storage** | No disponible | Azure Blob Storage |
| **Persistencia** | Solo en ese navegador | Global en la nube |
| **Colaboración** | No | Sí (múltiples usuarios) |

## 📝 Notas Importantes

### Contraseñas y Seguridad:

1. **SQL Password:** `Bookr@2024!SQL` 
   - ⚠️ Cambiar en producción
   - Editar en `main.parameters.json`

2. **JWT Secret:** `Bookr2024JWTSecretKey!ChangeInProduction`
   - ⚠️ Cambiar en producción
   - Editar en `main.parameters.json`

3. **GitHub Token:**
   - Necesario para Static Web App
   - Se configura automáticamente en el primer deployment

### Variables de Entorno:

El backend en Azure Functions ya tiene configuradas:
- `SQL_CONNECTION_STRING` ✅
- `STORAGE_CONNECTION_STRING` ✅
- `JWT_SECRET` ✅

### Costos Aproximados:

- Static Web App: **GRATIS** (Free tier)
- Functions Consumption: **~$0-5/mes** (primeros 1M ejecuciones gratis)
- SQL Database Basic: **~$5/mes**
- Blob Storage: **~$0-1/mes** (primeros 5GB gratis)

**Total estimado: ~$5-10/mes**

## 🐛 Troubleshooting

### Error: "Backend no responde"

```bash
# Verificar que el Function App está corriendo
az functionapp list --query "[?name=='bookr-api'].{Name:name, State:state}"

# Reiniciar si es necesario
az functionapp restart --name bookr-api --resource-group bookr
```

### Error: "No puedo conectarme a SQL"

```bash
# Verificar firewall rules
az sql server firewall-rule list \
  --server bookr-sql-server \
  --resource-group bookr

# Agregar tu IP si es necesario
az sql server firewall-rule create \
  --server bookr-sql-server \
  --resource-group bookr \
  --name AllowMyIP \
  --start-ip-address $(curl -s ifconfig.me) \
  --end-ip-address $(curl -s ifconfig.me)
```

### Error: "Static Web App no se actualiza"

1. Verificar GitHub Actions: https://github.com/TU-USUARIO/bookr/actions
2. Esperar ~2-3 minutos después del push
3. Hacer hard refresh en el navegador (Cmd+Shift+R)

## ✅ Checklist de Deployment

- [ ] Commit y push al repositorio
- [ ] Ejecutar `./deploy.sh` exitosamente
- [ ] Copiar URL del Function App
- [ ] Crear archivo `.env` con VITE_API_URL
- [ ] Cambiar `USE_LOCAL_MODE = false`
- [ ] Build y push cambios
- [ ] Verificar en Static Web App URL
- [ ] Probar registro y login
- [ ] Crear una reserva de prueba
- [ ] Verificar que se guarda en BD

## 🎉 ¡Listo!

Tu aplicación Bookr está **100% funcional en Azure** con:
- ✅ Frontend en Static Web App
- ✅ Backend en Azure Functions
- ✅ Base de datos en Azure SQL
- ✅ Storage en Azure Blob Storage
- ✅ CI/CD con GitHub Actions
- ✅ HTTPS automático
- ✅ Escalable y en producción

---

**Creado para el curso de Infrastructure as Code**
**Proyecto: Bookr - Sistema de Agendamiento Premium**

