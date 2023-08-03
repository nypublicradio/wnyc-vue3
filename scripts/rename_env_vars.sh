#!/bin/bash
# Example usage
# ENV="demo"
# DEMO_VARNAME="Demo Value with spaces and special characters: * ! @"
# PROD_VARNAME="Production Value"
# # Run the script
# ./rename_env_variables.sh

# Now, the variables will be renamed to VARNAME based on the ENV value
# echo "$VARNAME"         # Output: "Demo Value with spaces and special characters: * ! @"
# echo "$PROD_VARNAME"    # Output: "Production Value"

env_var_prefix=""

case "${ENV}" in
    "demo") env_var_prefix="DEMO_" ;;
    "prod") env_var_prefix="PROD_" ;;
    *) echo "Unknown environment '${ENV}'. Cannot rename variables." >&2
       exit 1 ;;
esac

# Loop through all environment variables
while IFS= read -r env_var; do
    new_env_var="${env_var#${env_var_prefix}}"   # Remove the prefix
    value="${!env_var}"                         # Get the value of the original variable
    quoted_value=$(printf "%q" "${value}")      # Quote the value to handle special characters
    eval "${new_env_var}=${quoted_value}"       # Assign the quoted value to the renamed variable
    export "${new_env_var}"
done < <(printenv | grep "^${env_var_prefix}")
