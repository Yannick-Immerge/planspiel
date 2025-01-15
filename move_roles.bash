# Move the roles from web_apps/planspiel-prototype/publicc/roles to prototype_roles
# and override the roles present in there

project_directory=$(pwd)
echo "Project directory: $project_directory"
cp -r web_apps/planspiel-prototype/public/roles prototype_roles
