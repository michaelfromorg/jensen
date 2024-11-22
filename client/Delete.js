function clearPropertiesService() {
  const properties = PropertiesService.getScriptProperties();
  properties.deleteAllProperties();
  
  return "All properties cleared!";
}
