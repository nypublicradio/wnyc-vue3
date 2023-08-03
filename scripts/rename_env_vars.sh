#!/bin/bash -x

env_var_prefix=""

case "${ENV}" in
    "demo") env_var_prefix="DEMO_" ;;
    "prod") env_var_prefix="PROD_" ;;
    *) echo "Unknown environment '${ENV}'. Cannot rename variables." >&2
       exit 1 ;;
esac

while IFS= read -r env_var; do
    new_env_var="${env_var#${env_var_prefix}}"   # Remove the prefix
    eval "${new_env_var}=\${${env_var}}"
    echo export "${new_env_var}" >> local-env
done < <(printenv | grep "^${env_var_prefix}")