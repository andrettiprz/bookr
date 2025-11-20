@description('Static Web App name')
param name string

@description('Location for the Static Web App')
param location string = resourceGroup().location

@description('SKU tier')
param sku string = 'Free'

@description('SKU code')
param skuCode string = 'Free'

@description('Repository URL')
param repositoryUrl string

@description('Branch name')
param branch string = 'main'

@description('Repository token')
@secure()
param repositoryToken string = ''

@description('App location')
param appLocation string = './frontend'

@description('API location')
param apiLocation string = ''

@description('App artifact location')
param appArtifactLocation string = 'dist'

@description('Enterprise grade CDN status')
param enterpriseGradeCdnStatus string = 'disabled'

// Static Web App
resource staticWebApp 'Microsoft.Web/staticSites@2022-09-01' = {
  name: name
  location: location
  properties: {
    repositoryUrl: repositoryUrl
    branch: branch
    repositoryToken: repositoryToken != '' ? repositoryToken : null
    buildProperties: {
      appLocation: appLocation
      apiLocation: apiLocation != '' ? apiLocation : null
      appArtifactLocation: appArtifactLocation
    }
    enterpriseGradeCdnStatus: enterpriseGradeCdnStatus
  }
  sku: {
    tier: sku
    name: skuCode
  }
}

output staticWebAppName string = staticWebApp.name
output staticWebAppId string = staticWebApp.id
output defaultHostname string = staticWebApp.properties.defaultHostname

