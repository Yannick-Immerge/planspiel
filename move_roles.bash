# Move the roles from web_apps/planspiel-prototype/publicc/roles to prototype_roles
# and override the roles present in there

# Remove all directories inside prototype_roles
rm -rf prototype_roles/1_ethan_miller
rm -rf prototype_roles/2_sam_johnson
rm -rf prototype_roles/3_richard_davis
rm -rf prototype_roles/4_li_wen
rm -rf prototype_roles/5_leon_schulz
rm -rf prototype_roles/6_mikkel_pedersen
rm -rf prototype_roles/7_yasemin_aidin
rm -rf prototype_roles/8_yi_huang
rm -rf prototype_roles/9_aigerim_amanova
rm -rf prototype_roles/10_joao_silva
rm -rf prototype_roles/11_anais_fournier
rm -rf prototype_roles/12_kofi_owusu

cp -r web_apps/planspiel-prototype/public/roles/* prototype_roles
