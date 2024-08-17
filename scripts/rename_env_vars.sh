#!/bin/bash

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
    echo "${new_env_var}" >> local-env
done < <(printenv | grep "^${env_var_prefix}")

export APP_VERSION=$(git tag --sort=-committerdate | grep -v "demo" | head -n 1 | sed -E 's/(v[0-9]+\.[0-9]+\.[0-9]+).*/\1/')

echo "APP_VERSION=${APP_VERSION}" >> local-env
echo "APP_VERSION_MAJOR=$(echo ${APP_VERSION} | cut -d. -f1 | cut -c2-)" >> local-env
echo "APP_VERSION_MINOR=$(echo ${APP_VERSION} | cut -d. -f2)" >> local-env
echo "APP_VERSION_PATCH=$(echo ${APP_VERSION} | cut -d. -f3)" >> local-env
echo "APP_SHORT_VERSION=$(echo ${APP_VERSION} | cut -d. -f1 | cut -c2-).$(echo ${APP_VERSION} | cut -d. -f2)" >> local-env
echo "APP_LONG_VERSION=$(echo ${APP_VERSION} | cut -d. -f1 | cut -c2-).$(echo ${APP_VERSION} | cut -d. -f2).$(echo ${APP_VERSION} | cut -d. -f3)" >> local-env
cat local-env | sed 's/\(^[^=]*\)=\(.*\)/export \1="\2"/' >> ~/.bash_profile
source ~/.bash_profile