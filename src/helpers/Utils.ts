export function assertEnvironment(varName: string) {
  const envVarValue = process.env[varName];
  
  if (!envVarValue) {
    throw new Error(`Environment variable ${varName} is required`);
  }
  
  return envVarValue;
};